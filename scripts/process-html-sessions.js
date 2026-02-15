/**
 * Master script to extract sessions from HTML and update sessions.ts
 * This script processes the HTML content from india-ai-explorer.vercel.app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractSessionsFromHTML, parseSession } from './extract-sessions-direct.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function updateSessionsFile(parsedSessions) {
  const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'sessions.ts');
  
  // Backup existing file
  if (fs.existsSync(sessionsPath)) {
    const backupPath = sessionsPath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(sessionsPath, 'utf8'));
    console.log(`✅ Backed up existing sessions.ts`);
  }
  
  // Generate the rawSessions array
  const sessionStrings = parsedSessions.map(session => {
    const speakersStr = JSON.stringify(session.speakers);
    const knowledgePartnersStr = JSON.stringify(session.knowledgePartners);
    const topicsStr = JSON.stringify(session.topics);
    
    return `  { title: ${JSON.stringify(session.title)}, dateLabel: ${JSON.stringify(session.dateLabel)}, dateISO: ${JSON.stringify(session.dateISO)}, startTime: ${JSON.stringify(session.startTime)}, endTime: ${JSON.stringify(session.endTime)}, location: ${JSON.stringify(session.location)}, room: ${JSON.stringify(session.room)}, speakers: ${speakersStr}, description: ${JSON.stringify(session.description)}, knowledgePartners: ${knowledgePartnersStr}, topics: ${topicsStr}, dayCode: ${JSON.stringify(session.dayCode)} }`;
  });
  
  // Create new content
  const newContent = `import { Session, DayCode } from '@/lib/types';

function makeId(date: string, title: string, room: string): string {
  return \`\${date}-\${title}-\${room}\`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

function getTimeSlot(time: string): 'Morning' | 'Afternoon' | 'Evening' {
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  if (h24 < 12) return 'Morning';
  if (h24 < 17) return 'Afternoon';
  return 'Evening';
}

const rawSessions: Omit<Session, 'id' | 'timeSlot'>[] = [
${sessionStrings.join(',\n')}
];

export const sessions: Session[] = rawSessions.map(s => ({
  ...s,
  id: makeId(s.dateISO, s.title, s.room),
  timeSlot: getTimeSlot(s.startTime),
}));

// Dedup by id
const seen = new Set<string>();
export const dedupedSessions: Session[] = sessions.filter(s => {
  if (seen.has(s.id)) return false;
  seen.add(s.id);
  return true;
});
`;
  
  // Write new file
  fs.writeFileSync(sessionsPath, newContent);
  console.log(`✅ Updated sessions.ts with ${parsedSessions.length} sessions`);
}

function extractSpeakers(parsedSessions) {
  const speakers = new Set();
  parsedSessions.forEach(session => {
    session.speakers.forEach(speaker => {
      if (speaker && speaker.trim()) {
        speakers.add(speaker.trim());
      }
    });
  });
  return Array.from(speakers).sort();
}

function main() {
  const htmlPath = process.argv[2];
  
  if (!htmlPath) {
    console.error('Usage: node process-html-sessions.js <path-to-html-file>');
    console.error('\nTo get the HTML:');
    console.error('1. Open https://india-ai-explorer.vercel.app/ in your browser');
    console.error('2. Right-click and select "View Page Source"');
    console.error('3. Save the HTML to a file');
    console.error('4. Run: node process-html-sessions.js <path-to-html-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ File not found: ${htmlPath}`);
    process.exit(1);
  }
  
  console.log(`📖 Reading HTML from ${htmlPath}...`);
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  console.log('🔍 Extracting sessions from HTML...');
  let sessions;
  try {
    sessions = extractSessionsFromHTML(htmlContent);
  } catch (error) {
    console.error(`❌ Error extracting sessions: ${error.message}`);
    process.exit(1);
  }
  
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
  
  // Save intermediate files
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dataDir, 'sessions-raw.json'),
    JSON.stringify(uniqueSessions, null, 2)
  );
  console.log(`✅ Saved to data/sessions-raw.json`);
  
  // Update sessions.ts
  console.log('\n📝 Updating sessions.ts...');
  updateSessionsFile(uniqueSessions);
  
  // Extract speakers
  const speakers = extractSpeakers(uniqueSessions);
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total sessions: ${uniqueSessions.length}`);
  console.log(`   - Unique speakers: ${speakers.length}`);
  console.log(`   - Sessions by day:`);
  const byDay = {};
  uniqueSessions.forEach(s => {
    byDay[s.dayCode] = (byDay[s.dayCode] || 0) + 1;
  });
  Object.entries(byDay).forEach(([day, count]) => {
    console.log(`     ${day}: ${count} sessions`);
  });
  
  console.log(`\n✅ Processing complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review src/data/sessions.ts`);
  console.log(`   2. Update src/data/speakers.ts with new speakers (${speakers.length} total)`);
  console.log(`   3. Run 'npm run build' to test the application`);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, updateSessionsFile, extractSpeakers };

