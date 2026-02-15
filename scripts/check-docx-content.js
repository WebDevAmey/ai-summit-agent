/**
 * Check what's actually in the docx file
 */

import mammoth from 'mammoth';
import fs from 'fs';

async function checkContent() {
  const result = await mammoth.extractRawText({ path: 'summit-info.docx' });
  const text = result.value;
  
  console.log(`Total characters: ${text.length}`);
  console.log(`Total lines: ${text.split('\n').length}\n`);
  
  // Check for SESSIONS array
  const sessionsMatch = text.match(/const SESSIONS = (\[[\s\S]*?\]);/);
  if (sessionsMatch) {
    console.log('✅ Found SESSIONS array!');
    try {
      const sessions = (new Function(`return ${sessionsMatch[1]}`))();
      console.log(`   Sessions count: ${sessions.length}`);
      if (sessions.length > 0) {
        console.log(`   First session:`, JSON.stringify(sessions[0], null, 2));
      }
      return sessions;
    } catch (e) {
      console.log(`   Error parsing: ${e.message}`);
    }
  } else {
    console.log('❌ No SESSIONS array found');
  }
  
  // Check for session patterns
  const sessionTitlePattern = /"t":\s*"([^"]+)"/g;
  const matches = [...text.matchAll(sessionTitlePattern)];
  if (matches.length > 0) {
    console.log(`\n✅ Found ${matches.length} session titles in compressed format`);
    console.log(`   Sample titles:`);
    matches.slice(0, 5).forEach((m, i) => console.log(`   ${i + 1}. ${m[1]}`));
  }
  
  // Check for HTML content
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    console.log(`\n⚠️  Document contains HTML content`);
  }
  
  // Check for actual session-like content
  const sessionKeywords = ['session', 'speaker', 'time:', 'date:', 'room:', 'hall:'];
  const hasSessionContent = sessionKeywords.some(kw => text.toLowerCase().includes(kw));
  if (hasSessionContent) {
    console.log(`\n✅ Document contains session-related keywords`);
  }
  
  // Save a sample to see structure
  const sample = text.substring(0, 2000);
  fs.writeFileSync('data/docx-sample.txt', sample);
  console.log(`\n📄 Saved first 2000 characters to data/docx-sample.txt`);
}

checkContent().catch(console.error);

