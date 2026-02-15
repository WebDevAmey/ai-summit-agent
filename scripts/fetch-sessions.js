/**
 * Script to fetch all sessions from https://impact.indiaai.gov.in/
 * This script uses Puppeteer to scrape the dynamically loaded content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchSessions() {
  console.log('Starting to fetch sessions from https://impact.indiaai.gov.in/...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a longer timeout for slow-loading pages
    page.setDefaultNavigationTimeout(60000);
    
    // Navigate to the agenda page
    console.log('Navigating to agenda page...');
    await page.goto('https://impact.indiaai.gov.in/agenda', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for content to load
    await page.waitForTimeout(5000);
    
    // Try to find session data in various ways
    console.log('Extracting session data...');
    
    // Method 1: Check for API calls in network requests
    const sessions = await page.evaluate(() => {
      // Try to find session data in the page
      const sessionElements = [];
      
      // Look for common session container classes
      const selectors = [
        '[class*="session"]',
        '[class*="agenda"]',
        '[class*="event"]',
        '[data-session]',
        '.session-card',
        '.agenda-item',
        '.event-item'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
        }
      }
      
      // Try to find JSON data in script tags
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        if (content.includes('session') || content.includes('agenda') || content.includes('event')) {
          try {
            // Try to extract JSON
            const jsonMatch = content.match(/\{[\s\S]*"session[s]?"[\s\S]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              if (Array.isArray(data) || (data && data.sessions)) {
                return Array.isArray(data) ? data : data.sessions;
              }
            }
          } catch (e) {
            // Not JSON, continue
          }
        }
      }
      
      return sessionElements;
    });
    
    // Method 2: Intercept network requests to find API endpoints
    const apiSessions = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('api') || url.includes('agenda') || url.includes('session') || url.includes('event')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json')) {
            const data = await response.json();
            if (Array.isArray(data) || (data && (data.sessions || data.data))) {
              const sessions = Array.isArray(data) ? data : (data.sessions || data.data || []);
              apiSessions.push(...sessions);
            }
          }
        } catch (e) {
          // Not JSON or error reading
        }
      }
    });
    
    // Wait a bit more for network requests
    await page.waitForTimeout(10000);
    
    // Try alternative URLs
    const alternativeUrls = [
      'https://impact.indiaai.gov.in/api/sessions',
      'https://impact.indiaai.gov.in/api/agenda',
      'https://impact.indiaai.gov.in/api/events',
      'https://impact.indiaai.gov.in/sessions',
      'https://impact.indiaai.gov.in/events'
    ];
    
    for (const url of alternativeUrls) {
      try {
        console.log(`Trying ${url}...`);
        const response = await page.goto(url, { waitUntil: 'networkidle2' });
        if (response && response.ok()) {
          const content = await response.text();
          try {
            const data = JSON.parse(content);
            if (Array.isArray(data) || (data && (data.sessions || data.data))) {
              const foundSessions = Array.isArray(data) ? data : (data.sessions || data.data || []);
              apiSessions.push(...foundSessions);
              console.log(`Found ${foundSessions.length} sessions from ${url}`);
            }
          } catch (e) {
            // Not JSON
          }
        }
      } catch (e) {
        // URL doesn't exist or error
      }
    }
    
    // Combine all found sessions
    const allSessions = [...sessions, ...apiSessions];
    
    console.log(`Found ${allSessions.length} sessions`);
    
    if (allSessions.length === 0) {
      console.log('\n⚠️  No sessions found automatically.');
      console.log('Please check the website manually and provide the session data.');
      console.log('You can:');
      console.log('1. Open browser DevTools (F12)');
      console.log('2. Go to Network tab');
      console.log('3. Filter by XHR/Fetch');
      console.log('4. Look for API calls that return session data');
      console.log('5. Copy the JSON response and save it to sessions-raw.json');
    } else {
      // Save raw data
      const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
      fs.writeFileSync(outputPath, JSON.stringify(allSessions, null, 2));
      console.log(`\n✅ Saved ${allSessions.length} sessions to data/sessions-raw.json`);
    }
    
    return allSessions;
    
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
fetchSessions()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

export { fetchSessions };
