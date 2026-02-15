/**
 * Script to extract unique speakers from sessions and update speakers.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanSpeakerName(name) {
  if (!name) return '';
  
  // Remove common prefixes
  name = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.|Professor|Sh\.|Shri|Smt\.)\s*/i, '').trim();
  
  // Remove organization indicators (common patterns)
  if (name.match(/\b(Inc|Ltd|LLC|Corp|Corporation|University|Institute|Foundation|Limited|Services|Technologies|Systems|Solutions|Group|Company)\b/i)) {
    return null; // Likely an organization, not a person
  }
  
  // Remove titles in parentheses
  name = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Must have at least first and last name (2+ words) or be a known single name
  const words = name.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2 && name.length < 15) {
    // Might be a single name, but check if it's likely a person
    if (name.length < 3 || name.match(/^[A-Z]{2,}$/)) {
      return null; // Likely an acronym
    }
  }
  
  return name.trim();
}

function extractSpeakers() {
  const sessionsPath = path.join(__dirname, '..', 'data', 'sessions-parsed.json');
  
  if (!fs.existsSync(sessionsPath)) {
    console.error('❌ sessions-parsed.json not found. Please run extract-from-docx.js first.');
    process.exit(1);
  }
  
  console.log('Reading session data...');
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
  
  // Extract all speakers
  const allSpeakers = new Set();
  sessions.forEach(session => {
    session.speakers.forEach(speaker => {
      if (speaker && speaker.trim()) {
        const cleaned = cleanSpeakerName(speaker);
        if (cleaned && cleaned.length > 2) {
          allSpeakers.add(cleaned);
        }
      }
    });
  });
  
  const speakersArray = Array.from(allSpeakers).sort();
  
  console.log(`✅ Extracted ${speakersArray.length} unique speakers`);
  console.log(`   (Filtered from ${sessions.reduce((sum, s) => sum + s.speakers.length, 0)} total speaker entries)`);
  
  // Read existing speakers file
  const speakersPath = path.join(__dirname, '..', 'src', 'data', 'speakers.ts');
  let existingSpeakers = [];
  
  if (fs.existsSync(speakersPath)) {
    const content = fs.readFileSync(speakersPath, 'utf8');
    // Extract existing speaker IDs
    const idMatches = content.matchAll(/id:\s*"([^"]+)"/g);
    for (const match of idMatches) {
      existingSpeakers.push(match[1]);
    }
    console.log(`   Found ${existingSpeakers.length} existing speakers in speakers.ts`);
  }
  
  // Generate speaker ID from name
  function makeSpeakerId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Create speaker objects
  const newSpeakers = speakersArray.map(name => {
    const id = makeSpeakerId(name);
    return {
      id,
      name,
      post: '', // Will need to be filled manually or from another source
      company: '', // Will need to be filled manually or from another source
    };
  });
  
  // Merge with existing speakers (keep existing data)
  const existingMap = new Map();
  if (fs.existsSync(speakersPath)) {
    try {
      // Try to parse existing speakers
      const content = fs.readFileSync(speakersPath, 'utf8');
      const speakerMatches = content.matchAll(/\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*post:\s*"([^"]*)",\s*(?:company:\s*"([^"]*)",?)?/g);
      for (const match of speakerMatches) {
        existingMap.set(match[1], {
          id: match[1],
          name: match[2],
          post: match[3] || '',
          company: match[4] || '',
        });
      }
    } catch (e) {
      console.log('   Could not parse existing speakers, will create new file');
    }
  }
  
  // Merge: keep existing data, add new speakers
  const mergedSpeakers = new Map();
  
  // Add existing speakers
  existingMap.forEach((speaker, id) => {
    mergedSpeakers.set(id, speaker);
  });
  
  // Add new speakers (don't overwrite existing)
  newSpeakers.forEach(speaker => {
    if (!mergedSpeakers.has(speaker.id)) {
      mergedSpeakers.set(speaker.id, speaker);
    }
  });
  
  const finalSpeakers = Array.from(mergedSpeakers.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Generate speakers.ts content
  const speakerStrings = finalSpeakers.map(speaker => {
    const companyStr = speaker.company ? `, company: ${JSON.stringify(speaker.company)}` : '';
    const profileUrlStr = speaker.profileUrl ? `, profileUrl: ${JSON.stringify(speaker.profileUrl)}` : '';
    return `  { id: ${JSON.stringify(speaker.id)}, name: ${JSON.stringify(speaker.name)}, post: ${JSON.stringify(speaker.post)}${companyStr}${profileUrlStr} }`;
  });
  
  const newContent = `import { Speaker } from '@/lib/types';

export const speakers: Speaker[] = [
${speakerStrings.join(',\n')}
];
`;
  
  // Backup existing file
  if (fs.existsSync(speakersPath)) {
    const backupPath = speakersPath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(speakersPath, 'utf8'));
    console.log(`✅ Backed up existing speakers.ts`);
  }
  
  // Write new file
  fs.writeFileSync(speakersPath, newContent);
  console.log(`✅ Updated speakers.ts with ${finalSpeakers.length} speakers`);
  console.log(`   - Existing: ${existingMap.size}`);
  console.log(`   - New: ${finalSpeakers.length - existingMap.size}`);
  
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review src/data/speakers.ts`);
  console.log(`   2. Fill in post and company information for speakers`);
  console.log(`   3. Run 'npm run build' to test the application`);
}

extractSpeakers();

