/**
 * Script to extract session data from HTML content
 * This script parses the SESSIONS and CLUSTERS arrays from the HTML
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cluster ID to topic name mapping
const clusterToTopic = {
  'keynotes': 'Keynotes & Firesides',
  'hackathons': 'Hackathons, Demos & Masterclasses',
  'healthcare': 'Healthcare & Biotech',
  'agriculture': 'Agriculture & Food Systems',
  'climate': 'Climate, Energy & Sustainability',
  'defense': 'Cybersecurity & National Security',
  'finance': 'Finance & Fintech',
  'languages': 'Multilingual & Indic Language AI',
  'frontier': 'Frontier AI & Foundation Models',
  'startups': 'Startups & Venture Capital',
  'creative': 'Creative AI & Media',
  'space': 'Space, Quantum & Emerging Tech',
  'education': 'Education & Skilling',
  'inclusion': 'Women, Children & Social Impact',
  'global': 'Global Cooperation & Diplomacy',
  'governance': 'AI Governance & Regulation',
  'safety': 'AI Safety & Responsible AI',
  'dpi': 'Digital Public Infrastructure',
  'infra': 'AI Infrastructure & Compute',
  'data': 'Data Governance & Open Data',
  'enterprise': 'Enterprise & Industry AI',
  'general': 'General AI',
};

// Map date ISO to day code
function getDayCode(dateISO) {
  const dateMap = {
    '2026-02-16': 'Mon16',
    '2026-02-17': 'Tue17',
    '2026-02-18': 'Wed18',
    '2026-02-19': 'Thu19',
    '2026-02-20': 'Fri20',
  };
  return dateMap[dateISO] || 'Mon16';
}

// Map day code to date label
function getDateLabel(dayCode) {
  const labels = {
    'Mon16': 'Mon, Feb 16',
    'Tue17': 'Tue, Feb 17',
    'Wed18': 'Wed, Feb 18',
    'Thu19': 'Thu, Feb 19',
    'Fri20': 'Fri, Feb 20',
  };
  return labels[dayCode] || labels['Mon16'];
}

// Convert time from HH:MM:SS to "HH:MM AM/PM"
function formatTime(timeStr) {
  if (!timeStr) return '9:00 AM';
  
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const min = minutes || '00';
  
  if (hour === 0) return `12:${min} AM`;
  if (hour < 12) return `${hour}:${min} AM`;
  if (hour === 12) return `12:${min} PM`;
  return `${hour - 12}:${min} PM`;
}

// Parse speakers from string
function parseSpeakers(speakerStr) {
  if (!speakerStr) return [];
  
  // Split by semicolon or comma, then clean up
  const speakers = speakerStr
    .split(/[;,]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Remove titles and company info in parentheses
      return s.replace(/\s*\([^)]*\)\s*/g, '').trim();
    })
    .filter(s => s.length > 0);
  
  return speakers;
}

// Parse a session from the compressed format
function parseSession(rawSession) {
  const dayCode = getDayCode(rawSession.dt);
  const dateLabel = getDateLabel(dayCode);
  
  // Get topics
  const topics = [];
  if (rawSession.c && clusterToTopic[rawSession.c]) {
    topics.push(clusterToTopic[rawSession.c]);
  }
  if (rawSession.c2 && Array.isArray(rawSession.c2)) {
    rawSession.c2.forEach(c => {
      if (clusterToTopic[c] && !topics.includes(clusterToTopic[c])) {
        topics.push(clusterToTopic[c]);
      }
    });
  }
  if (topics.length === 0) {
    topics.push('General AI');
  }
  
  // Parse speakers
  const speakers = parseSpeakers(rawSession.sp);
  
  // Parse knowledge partners
  const knowledgePartners = rawSession.kp ? [rawSession.kp] : [];
  
  return {
    title: rawSession.t || '',
    dateLabel,
    dateISO: rawSession.dt || '2026-02-16',
    startTime: formatTime(rawSession.st),
    endTime: rawSession.et ? formatTime(rawSession.et) : '',
    location: rawSession.v || 'Bharat Mandapam',
    room: rawSession.r || 'Main Hall',
    speakers,
    description: rawSession.d || '',
    knowledgePartners,
    topics,
    dayCode,
  };
}

// Extract sessions from HTML content
function extractFromHTML(htmlContent) {
  // Extract SESSIONS array - handle multiline arrays
  // Look for "const SESSIONS = [" and find the matching closing bracket
  const startPattern = /const SESSIONS = \[/;
  const startMatch = htmlContent.match(startPattern);
  
  if (!startMatch) {
    throw new Error('Could not find SESSIONS array in HTML');
  }
  
  const startIndex = startMatch.index + startMatch[0].length;
  let bracketCount = 1;
  let i = startIndex;
  
  // Find the matching closing bracket
  while (i < htmlContent.length && bracketCount > 0) {
    if (htmlContent[i] === '[') bracketCount++;
    if (htmlContent[i] === ']') bracketCount--;
    i++;
  }
  
  if (bracketCount !== 0) {
    throw new Error('Could not find end of SESSIONS array');
  }
  
  const sessionsStr = htmlContent.substring(startIndex - 1, i);
  
  // Use Function constructor for safer eval
  const sessions = (new Function(`return ${sessionsStr}`))();
  
  console.log(`Found ${sessions.length} sessions in HTML`);
  
  // Parse all sessions
  const parsedSessions = sessions.map(parseSession);
  
  return parsedSessions;
}

// Main function
function main() {
  const htmlPath = process.argv[2];
  
  if (!htmlPath) {
    console.error('Usage: node extract-from-html.js <path-to-html-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File not found: ${htmlPath}`);
    process.exit(1);
  }
  
  console.log(`Reading HTML from ${htmlPath}...`);
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('Extracting sessions...');
  const sessions = extractFromHTML(htmlContent);
  
  // Save to sessions-raw.json format
  const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(sessions, null, 2));
  console.log(`✅ Extracted ${sessions.length} sessions to data/sessions-raw.json`);
  
  // Also save parsed format
  const parsedPath = path.join(__dirname, '..', 'data', 'sessions-parsed.json');
  fs.writeFileSync(parsedPath, JSON.stringify(sessions, null, 2));
  console.log(`✅ Saved parsed sessions to data/sessions-parsed.json`);
  
  return sessions;
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractFromHTML, parseSession };

