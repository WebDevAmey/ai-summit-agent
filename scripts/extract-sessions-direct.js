/**
 * Direct extraction script - extracts SESSIONS from HTML and updates sessions.ts
 * This script can work with HTML content or a saved HTML file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cluster ID to topic name mapping (from CLUSTERS array in HTML)
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

function formatTime(timeStr) {
  if (!timeStr) return '9:00 AM';
  
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0]);
  const min = parts[1] || '00';
  
  if (hour === 0) return `12:${min} AM`;
  if (hour < 12) return `${hour}:${min} AM`;
  if (hour === 12) return `12:${min} PM`;
  return `${hour - 12}:${min} PM`;
}

function parseSpeakers(speakerStr) {
  if (!speakerStr) return [];
  
  // Split by semicolon first (common separator), then by comma
  return speakerStr
    .split(/[;,]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Clean up speaker names - remove extra info in parentheses sometimes
      // But keep names with titles like "Dr. Name" or "Sh. Name"
      return s.trim();
    })
    .filter(s => s.length > 0);
}

function makeId(date, title, room) {
  return `${date}-${title}-${room}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function getTimeSlot(time) {
  if (!time) return 'Afternoon';
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.toUpperCase().includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  if (h24 < 12) return 'Morning';
  if (h24 < 17) return 'Afternoon';
  return 'Evening';
}

function parseSession(rawSession) {
  const dayCode = getDayCode(rawSession.dt);
  const dateLabel = getDateLabel(dayCode);
  
  // Get topics from cluster IDs
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
  
  const speakers = parseSpeakers(rawSession.sp);
  const knowledgePartners = rawSession.kp ? [rawSession.kp] : [];
  
  const startTime = formatTime(rawSession.st);
  
  return {
    title: rawSession.t || '',
    dateLabel,
    dateISO: rawSession.dt || '2026-02-16',
    startTime,
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

function extractSessionsFromHTML(htmlContent) {
  // Find the start of SESSIONS array
  const startPattern = /const SESSIONS = \[/;
  const startMatch = htmlContent.match(startPattern);
  
  if (!startMatch) {
    throw new Error('Could not find SESSIONS array in HTML');
  }
  
  const startIndex = startMatch.index + startMatch[0].length - 1; // Include the [
  let bracketCount = 0;
  let i = startIndex;
  let inString = false;
  let stringChar = null;
  let escaped = false;
  
  // Find the matching closing bracket, handling strings properly
  while (i < htmlContent.length) {
    const char = htmlContent[i];
    
    if (escaped) {
      escaped = false;
      i++;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      i++;
      continue;
    }
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar) {
      inString = false;
      stringChar = null;
    } else if (!inString) {
      if (char === '[') bracketCount++;
      if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          i++; // Include the ]
          break;
        }
      }
    }
    
    i++;
  }
  
  if (bracketCount !== 0) {
    throw new Error('Could not find end of SESSIONS array');
  }
  
  const sessionsStr = htmlContent.substring(startIndex, i);
  
  // Parse the JavaScript array
  const sessions = (new Function(`return ${sessionsStr}`))();
  
  console.log(`✅ Extracted ${sessions.length} sessions from HTML`);
  
  return sessions.map(parseSession);
}

// Main function
function main() {
  const htmlPath = process.argv[2];
  
  if (!htmlPath) {
    console.error('Usage: node extract-sessions-direct.js <path-to-html-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File not found: ${htmlPath}`);
    process.exit(1);
  }
  
  console.log(`Reading HTML from ${htmlPath}...`);
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('Extracting and parsing sessions...');
  const sessions = extractSessionsFromHTML(htmlContent);
  
  // Remove duplicates
  const seen = new Set();
  const uniqueSessions = sessions.filter(session => {
    const id = makeId(session.dateISO, session.title, session.room);
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
  
  console.log(`✅ Parsed ${uniqueSessions.length} unique sessions (removed ${sessions.length - uniqueSessions.length} duplicates)`);
  
  // Save to sessions-raw.json
  const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueSessions, null, 2));
  console.log(`✅ Saved to data/sessions-raw.json`);
  
  // Also save parsed format
  const parsedPath = path.join(__dirname, '..', 'data', 'sessions-parsed.json');
  fs.writeFileSync(parsedPath, JSON.stringify(uniqueSessions, null, 2));
  console.log(`✅ Saved to data/sessions-parsed.json`);
  
  return uniqueSessions;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractSessionsFromHTML, parseSession };

