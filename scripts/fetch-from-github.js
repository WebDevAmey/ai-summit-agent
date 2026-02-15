/**
 * Script to fetch sessions data from GitHub repository
 * Since the deployed site is built from this repo, we can get the data from GitHub
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function fetchFromGitHub() {
  console.log('Fetching sessions from GitHub repository...\n');
  
  // Try to get the raw file from GitHub
  const githubUrl = 'https://raw.githubusercontent.com/WebDevAmey/ai-summit-navigator/main/src/data/sessions.ts';
  
  try {
    console.log(`Fetching from: ${githubUrl}`);
    const content = await fetchUrl(githubUrl);
    
    // Parse the TypeScript file to extract sessions
    // Look for the rawSessions array
    const sessionsMatch = content.match(/const rawSessions[^=]*=\s*\[([\s\S]*?)\];/);
    
    if (sessionsMatch) {
      console.log('✅ Found rawSessions array in GitHub file');
      console.log('Note: This file contains TypeScript code, not JSON.');
      console.log('You need to extract the session objects manually or use the local file.');
      
      // Save the file for reference
      const outputPath = path.join(__dirname, '..', 'data', 'sessions-from-github.ts');
      fs.writeFileSync(outputPath, content);
      console.log(`✅ Saved to data/sessions-from-github.ts`);
      console.log('\nTo extract sessions, you can:');
      console.log('1. Copy the sessions.ts file from your local repo');
      console.log('2. Or manually extract the session objects from the TypeScript file');
      
      return null;
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  
  console.log('\n⚠️  Could not fetch from GitHub.');
  console.log('Please use one of these methods:');
  console.log('1. Check the local sessions.ts file in src/data/');
  console.log('2. Use browser console on the deployed site');
  console.log('3. Extract from the GitHub file manually');
  
  return null;
}

// Run the script
fetchFromGitHub()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });

