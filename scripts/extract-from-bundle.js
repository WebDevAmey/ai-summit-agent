/**
 * Script to extract sessions from the JavaScript bundle of the deployed site
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on('error', reject);
  });
}

async function extractFromBundle() {
  console.log('Fetching HTML to find JavaScript bundle...\n');
  
  try {
    const html = await fetchUrl('https://india-ai-explorer.vercel.app/');
    
    // Find all script tags
    const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/gi);
    const scripts = [];
    
    if (scriptMatches) {
      for (const match of scriptMatches) {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) {
          let src = srcMatch[1];
          if (src.startsWith('/')) {
            src = 'https://india-ai-explorer.vercel.app' + src;
          } else if (!src.startsWith('http')) {
            src = 'https://india-ai-explorer.vercel.app/' + src;
          }
          scripts.push(src);
        }
      }
    }
    
    console.log(`Found ${scripts.length} script files`);
    console.log('Searching for sessions data in bundles...\n');
    
    // Try to find sessions in the main bundle
    for (const scriptUrl of scripts) {
      if (scriptUrl.includes('index') || scriptUrl.includes('main') || scriptUrl.includes('chunk')) {
        try {
          console.log(`Checking: ${scriptUrl.substring(0, 80)}...`);
          const jsContent = await fetchUrl(scriptUrl);
          
          // Look for session array patterns
          // Pattern: array of objects with "title" property
          const patterns = [
            /\[[\s\S]{500,}?"title"[\s\S]{500,}?\]/g,
            /sessions:\s*\[[\s\S]{500,}?\]/g,
            /rawSessions[\s\S]{1000,}?\]/g
          ];
          
          for (const pattern of patterns) {
            const matches = jsContent.match(pattern);
            if (matches) {
              for (const match of matches) {
                // Try to extract valid JSON
                try {
                  // Clean up the match to make it valid JSON
                  let cleaned = match
                    .replace(/const\s+\w+\s*=\s*/, '')
                    .replace(/export\s+const\s+\w+\s*=\s*/, '')
                    .replace(/;\s*$/, '');
                  
                  // Try to find the array
                  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
                  if (arrayMatch) {
                    const jsonStr = arrayMatch[0];
                    // Try to parse
                    const data = JSON.parse(jsonStr);
                    if (Array.isArray(data) && data.length > 100 && data[0].title) {
                      console.log(`\n✅ Found ${data.length} sessions in bundle!`);
                      const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
                      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
                      console.log(`✅ Saved to data/sessions-raw.json`);
                      return data;
                    }
                  }
                } catch (e) {
                  // Not valid JSON, continue
                }
              }
            }
          }
        } catch (e) {
          // Error fetching script, continue
        }
      }
    }
    
    console.log('\n⚠️  Could not extract sessions from bundles automatically.');
    console.log('The data is likely minified/obfuscated.');
    console.log('\nPlease use manual extraction:');
    console.log('1. Open https://india-ai-explorer.vercel.app/');
    console.log('2. Open DevTools → Network tab');
    console.log('3. Find the main JavaScript bundle');
    console.log('4. Search for "sessions" or session titles');
    console.log('5. Copy the session array to data/sessions-raw.json');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  
  return null;
}

extractFromBundle()
  .then(sessions => {
    if (sessions) {
      console.log(`\n✅ Successfully extracted ${sessions.length} sessions!`);
      console.log('Next: npm run parse-sessions && npm run update-sessions');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });

