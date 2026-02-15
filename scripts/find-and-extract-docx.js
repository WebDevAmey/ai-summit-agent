/**
 * Helper script to find summit-info.docx and extract sessions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractFromDocx } from './extract-from-docx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findDocxFile() {
  const searchPaths = [
    path.join(__dirname, '..', 'summit-info.docx'),
    path.join(__dirname, '..', '..', 'summit-info.docx'),
    path.join(process.cwd(), 'summit-info.docx'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', 'summit-info.docx'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'summit-info.docx'),
  ];
  
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath;
    }
  }
  
  return null;
}

async function main() {
  let docxPath = process.argv[2];
  
  if (!docxPath) {
    console.log('🔍 Searching for summit-info.docx...');
    docxPath = findDocxFile();
    
    if (!docxPath) {
      console.error('❌ Could not find summit-info.docx');
      console.error('\nPlease provide the file path:');
      console.error('  node scripts/find-and-extract-docx.js "path/to/summit-info.docx"');
      console.error('\nOr place the file in one of these locations:');
      const searchPaths = [
        path.join(__dirname, '..', 'summit-info.docx'),
        path.join(__dirname, '..', '..', 'summit-info.docx'),
        path.join(process.cwd(), 'summit-info.docx'),
      ];
      searchPaths.forEach(p => console.error(`  - ${p}`));
      process.exit(1);
    }
    
    console.log(`✅ Found: ${docxPath}`);
  }
  
  if (!fs.existsSync(docxPath)) {
    console.error(`❌ File not found: ${docxPath}`);
    process.exit(1);
  }
  
  console.log(`\n📄 Processing ${docxPath}...\n`);
  
  try {
    const sessions = await extractFromDocx(docxPath);
    
    console.log(`\n✅ Successfully extracted ${sessions.length} sessions!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Review data/sessions-raw.json`);
    console.log(`   2. Run: node scripts/update-sessions.js`);
    console.log(`   3. Update speakers.ts with new speakers`);
    console.log(`   4. Test: npm run build`);
    
    return sessions;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { findDocxFile };

