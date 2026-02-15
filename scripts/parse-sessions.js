/**
 * Script to parse raw session data and convert it to the application's format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to create ID from date, title, and room
function makeId(date, title, room) {
  return `${date}-${title}-${room}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// Helper function to get time slot
function getTimeSlot(time) {
  if (!time) return 'Afternoon';
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.toUpperCase().includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  if (h24 < 12) return 'Morning';
  if (h24 < 17) return 'Afternoon';
  return 'Evening';
}

// Map day names to day codes
const dayCodeMap = {
  'monday': 'Mon16',
  'tuesday': 'Tue17',
  'wednesday': 'Wed18',
  'thursday': 'Thu19',
  'friday': 'Fri20',
  'mon': 'Mon16',
  'tue': 'Tue17',
  'wed': 'Wed18',
  'thu': 'Thu19',
  'fri': 'Fri20',
  '16': 'Mon16',
  '17': 'Tue17',
  '18': 'Wed18',
  '19': 'Thu19',
  '20': 'Fri20',
};

// Map date strings to day codes
function getDayCode(dateStr) {
  if (!dateStr) return 'Mon16';
  
  const lower = dateStr.toLowerCase();
  for (const [key, code] of Object.entries(dayCodeMap)) {
    if (lower.includes(key)) return code;
  }
  
  // Try to extract day number
  const dayMatch = dateStr.match(/\b(16|17|18|19|20)\b/);
  if (dayMatch) {
    return dayCodeMap[dayMatch[1]];
  }
  
  return 'Mon16'; // Default
}

// Map date strings to date labels
function getDateLabel(dateStr, dayCode) {
  const labels = {
    'Mon16': 'Mon, Feb 16',
    'Tue17': 'Tue, Feb 17',
    'Wed18': 'Wed, Feb 18',
    'Thu19': 'Thu, Feb 19',
    'Fri20': 'Fri, Feb 20',
  };
  return labels[dayCode] || labels['Mon16'];
}

// Map date strings to ISO dates
function getDateISO(dayCode) {
  const dates = {
    'Mon16': '2026-02-16',
    'Tue17': '2026-02-17',
    'Wed18': '2026-02-18',
    'Thu19': '2026-02-19',
    'Fri20': '2026-02-20',
  };
  return dates[dayCode] || dates['Mon16'];
}

// Map topics/categories
const topicMap = {
  'keynote': 'Keynotes & Firesides',
  'fireside': 'Keynotes & Firesides',
  'panel': 'Keynotes & Firesides',
  'workshop': 'Education & Skilling',
  'healthcare': 'Healthcare & Biotech',
  'health': 'Healthcare & Biotech',
  'biotech': 'Healthcare & Biotech',
  'agriculture': 'Agriculture & Food Systems',
  'food': 'Agriculture & Food Systems',
  'climate': 'Climate, Energy & Sustainability',
  'energy': 'Climate, Energy & Sustainability',
  'sustainability': 'Climate, Energy & Sustainability',
  'cybersecurity': 'Cybersecurity & National Security',
  'security': 'Cybersecurity & National Security',
  'finance': 'Finance & Fintech',
  'fintech': 'Finance & Fintech',
  'governance': 'AI Governance & Regulation',
  'regulation': 'AI Governance & Regulation',
  'safety': 'AI Safety & Responsible AI',
  'responsible': 'AI Safety & Responsible AI',
  'ethics': 'AI Safety & Responsible AI',
  'education': 'Education & Skilling',
  'skilling': 'Education & Skilling',
  'dpi': 'Digital Public Infrastructure',
  'infrastructure': 'AI Infrastructure & Compute',
  'compute': 'AI Infrastructure & Compute',
  'startup': 'Startups & Venture Capital',
  'venture': 'Startups & Venture Capital',
  'enterprise': 'Enterprise & Industry AI',
  'industry': 'Enterprise & Industry AI',
  'creative': 'Creative AI & Media',
  'media': 'Creative AI & Media',
  'cooperation': 'Global Cooperation & Diplomacy',
  'diplomacy': 'Global Cooperation & Diplomacy',
  'general': 'General AI',
  'ai': 'General AI',
};

function inferTopics(title, description, category) {
  const text = `${title} ${description} ${category || ''}`.toLowerCase();
  const topics = new Set(['General AI']); // Default topic
  
  for (const [key, topic] of Object.entries(topicMap)) {
    if (text.includes(key)) {
      topics.add(topic);
    }
  }
  
  return Array.from(topics);
}

// Parse a single session object
function parseSession(rawSession, index) {
  // Handle different possible structures
  const title = rawSession.title || rawSession.name || rawSession.sessionTitle || `Session ${index + 1}`;
  const description = rawSession.description || rawSession.desc || rawSession.summary || '';
  const speakers = rawSession.speakers || rawSession.speaker || rawSession.speakerNames || [];
  const startTime = rawSession.startTime || rawSession.time || rawSession.start || '9:00 AM';
  const endTime = rawSession.endTime || rawSession.end || '10:00 AM';
  const location = rawSession.location || rawSession.venue || 'Bharat Mandapam';
  const room = rawSession.room || rawSession.hall || rawSession.venueRoom || 'Main Hall';
  const date = rawSession.date || rawSession.day || rawSession.dateLabel || '';
  const category = rawSession.category || rawSession.track || rawSession.type || '';
  const knowledgePartners = rawSession.knowledgePartners || rawSession.partners || rawSession.sponsors || [];
  const liveUrl = rawSession.liveUrl || rawSession.liveStream || rawSession.streamUrl;
  
  // Normalize speakers array
  let speakersArray = [];
  if (Array.isArray(speakers)) {
    speakersArray = speakers.map(s => {
      if (typeof s === 'string') return s;
      return s.name || s.speakerName || s.fullName || '';
    }).filter(Boolean);
  } else if (typeof speakers === 'string') {
    speakersArray = speakers.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Determine day code
  const dayCode = getDayCode(date);
  const dateLabel = getDateLabel(date, dayCode);
  const dateISO = getDateISO(dayCode);
  
  // Infer topics
  const topics = rawSession.topics || rawSession.tags || inferTopics(title, description, category);
  
  return {
    title,
    dateLabel,
    dateISO,
    startTime,
    endTime,
    location,
    room,
    speakers: speakersArray,
    description,
    knowledgePartners: Array.isArray(knowledgePartners) ? knowledgePartners : [],
    topics: Array.isArray(topics) ? topics : [topics],
    dayCode,
    ...(liveUrl && { liveUrl }),
  };
}

// Main parsing function
function parseSessions() {
  const rawDataPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
  
  if (!fs.existsSync(rawDataPath)) {
    console.error('❌ sessions-raw.json not found. Please run fetch-sessions.js first.');
    process.exit(1);
  }
  
  console.log('Reading raw session data...');
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
  
  console.log(`Parsing ${rawData.length} sessions...`);
  const parsedSessions = rawData.map((session, index) => parseSession(session, index));
  
  // Remove duplicates based on ID
  const seen = new Set();
  const uniqueSessions = parsedSessions.filter(session => {
    const id = makeId(session.dateISO, session.title, session.room);
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
  
  console.log(`✅ Parsed ${uniqueSessions.length} unique sessions (removed ${parsedSessions.length - uniqueSessions.length} duplicates)`);
  
  // Save parsed data
  const outputPath = path.join(__dirname, '..', 'data', 'sessions-parsed.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueSessions, null, 2));
  console.log(`✅ Saved parsed sessions to data/sessions-parsed.json`);
  
  return uniqueSessions;
}

// Run the script
parseSessions();

export { parseSessions, parseSession };
