/**
 * Script to update sessions.ts with parsed session data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function updateSessions() {
  const parsedPath = path.join(__dirname, '..', 'data', 'sessions-parsed.json');
  const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'sessions.ts');
  
  if (!fs.existsSync(parsedPath)) {
    console.error('❌ sessions-parsed.json not found. Please run parse-sessions.js first.');
    process.exit(1);
  }
  
  console.log('Reading parsed session data...');
  const parsedSessions = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));
  
  console.log(`Updating sessions.ts with ${parsedSessions.length} sessions...`);
  
  // Read existing sessions file to preserve structure
  const existingContent = fs.readFileSync(sessionsPath, 'utf8');
  
  // Generate the rawSessions array
  const sessionStrings = parsedSessions.map(session => {
    const speakersStr = JSON.stringify(session.speakers);
    const knowledgePartnersStr = JSON.stringify(session.knowledgePartners);
    const topicsStr = JSON.stringify(session.topics);
    const liveUrlStr = session.liveUrl ? `, liveUrl: ${JSON.stringify(session.liveUrl)}` : '';
    
    return `  { title: ${JSON.stringify(session.title)}, dateLabel: ${JSON.stringify(session.dateLabel)}, dateISO: ${JSON.stringify(session.dateISO)}, startTime: ${JSON.stringify(session.startTime)}, endTime: ${JSON.stringify(session.endTime)}, location: ${JSON.stringify(session.location)}, room: ${JSON.stringify(session.room)}, speakers: ${speakersStr}, description: ${JSON.stringify(session.description)}, knowledgePartners: ${knowledgePartnersStr}, topics: ${topicsStr}, dayCode: ${JSON.stringify(session.dayCode)}${liveUrlStr} }`;
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
  
  // Backup existing file
  const backupPath = sessionsPath + '.backup';
  fs.writeFileSync(backupPath, existingContent);
  console.log(`✅ Backed up existing sessions.ts to sessions.ts.backup`);
  
  // Write new file
  fs.writeFileSync(sessionsPath, newContent);
  console.log(`✅ Updated sessions.ts with ${parsedSessions.length} sessions`);
  
  // Extract unique speakers
  const allSpeakers = new Set();
  parsedSessions.forEach(session => {
    session.speakers.forEach(speaker => {
      if (speaker) allSpeakers.add(speaker);
    });
  });
  
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total sessions: ${parsedSessions.length}`);
  console.log(`   - Unique speakers: ${allSpeakers.size}`);
  console.log(`   - Sessions by day:`);
  const byDay = {};
  parsedSessions.forEach(s => {
    byDay[s.dayCode] = (byDay[s.dayCode] || 0) + 1;
  });
  Object.entries(byDay).forEach(([day, count]) => {
    console.log(`     ${day}: ${count} sessions`);
  });
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Next steps:`);
  console.log(`   1. Review the updated sessions.ts file`);
  console.log(`   2. Update speakers.ts with any new speakers`);
  console.log(`   3. Run 'npm run build' to test the application`);
}

// Run the script
updateSessions();

export { updateSessions };
