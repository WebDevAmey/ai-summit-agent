/**
 * Simple script to fetch session data from API endpoints
 * Usage: node scripts/fetch-api.js [url]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            resolve(data); // Return as text if not JSON
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function tryEndpoints() {
  const endpoints = [
    'https://impact.indiaai.gov.in/api/sessions',
    'https://impact.indiaai.gov.in/api/agenda',
    'https://impact.indiaai.gov.in/api/events',
    'https://impact.indiaai.gov.in/api/v1/sessions',
    'https://impact.indiaai.gov.in/api/v1/agenda',
    'https://impact.indiaai.gov.in/api/v1/events',
    'https://api.impact.indiaai.gov.in/sessions',
    'https://api.impact.indiaai.gov.in/agenda',
    'https://api.impact.indiaai.gov.in/events',
  ];
  
  console.log('Trying common API endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying: ${endpoint}...`);
      const data = await fetchUrl(endpoint);
      
      if (data && (Array.isArray(data) || (data.sessions || data.agenda || data.events || data.data))) {
        const sessions = Array.isArray(data) ? data : (data.sessions || data.agenda || data.events || data.data || []);
        
        if (sessions.length > 0) {
          console.log(`✅ Found ${sessions.length} sessions from ${endpoint}`);
          
          const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
          fs.writeFileSync(outputPath, JSON.stringify(sessions, null, 2));
          console.log(`✅ Saved to data/sessions-raw.json\n`);
          
          return sessions;
        }
      }
      
      console.log(`   No session data found\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  console.log('❌ No working API endpoint found.');
  console.log('Please use the manual extraction method described in scripts/README.md');
  return null;
}

// If URL provided as argument, try that
const url = process.argv[2];

if (url) {
  console.log(`Fetching from: ${url}\n`);
  fetchUrl(url)
    .then(data => {
      const sessions = Array.isArray(data) ? data : (data.sessions || data.agenda || data.events || data.data || []);
      const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
      fs.writeFileSync(outputPath, JSON.stringify(sessions, null, 2));
      console.log(`✅ Saved ${sessions.length} sessions to data/sessions-raw.json`);
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
} else {
  tryEndpoints()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
}
