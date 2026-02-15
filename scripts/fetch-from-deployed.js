/**
 * Script to fetch all sessions from the deployed site using Puppeteer
 * https://india-ai-explorer.vercel.app/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchFromDeployed() {
  console.log('Fetching sessions from https://india-ai-explorer.vercel.app/...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    
    console.log('Loading page...');
    await page.goto('https://india-ai-explorer.vercel.app/', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Extracting session data from page...');
    
    // Try to get sessions from the page's JavaScript context
    const sessions = await page.evaluate(() => {
      // Method 1: Check if sessions are in window object
      if (window.sessions || window.__sessions || window.sessionData) {
        return window.sessions || window.__sessions || window.sessionData;
      }
      
      // Method 2: Check for Next.js data
      if (window.__NEXT_DATA__) {
        const nextData = window.__NEXT_DATA__;
        if (nextData.props?.pageProps?.sessions) {
          return nextData.props.pageProps.sessions;
        }
        if (nextData.props?.initialState?.sessions) {
          return nextData.props.initialState.sessions;
        }
      }
      
      // Method 3: Try to find data in script tags
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        if (content.includes('sessions') && content.includes('[')) {
          try {
            // Try to extract array
            const arrayMatch = content.match(/\[[\s\S]*"title"[\s\S]*\]/);
            if (arrayMatch) {
              const data = JSON.parse(arrayMatch[0]);
              if (Array.isArray(data) && data.length > 0 && data[0].title) {
                return data;
              }
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      // Method 4: Try to access React/Vue component state
      // Look for elements that might contain session data
      const sessionElements = document.querySelectorAll('[data-session], .session, [class*="session"]');
      if (sessionElements.length > 0) {
        console.log(`Found ${sessionElements.length} session elements in DOM`);
      }
      
      return null;
    });
    
    // Method 5: Intercept network requests
    const apiSessions = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('session') || url.includes('agenda') || url.includes('data') || url.includes('.json')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json') || url.endsWith('.json')) {
            const data = await response.json();
            if (Array.isArray(data)) {
              if (data.length > 0 && data[0].title) {
                apiSessions.push(...data);
              }
            } else if (data.sessions) {
              apiSessions.push(...(Array.isArray(data.sessions) ? data.sessions : []));
            }
          }
        } catch (e) {
          // Not JSON or error
        }
      }
    });
    
    // Wait for network requests
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Combine results
    let allSessions = sessions || [];
    if (apiSessions.length > 0) {
      allSessions = [...allSessions, ...apiSessions];
    }
    
    // If still no sessions, try to extract from the page source
    if (allSessions.length === 0) {
      console.log('Trying to extract from page source...');
      const pageContent = await page.content();
      
      // Look for JSON in script tags
      const scriptMatches = pageContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        for (const script of scriptMatches) {
          const content = script.replace(/<script[^>]*>|<\/script>/gi, '');
          if (content.includes('sessions') && content.includes('title')) {
            try {
              // Try to find array
              const arrayMatch = content.match(/\[[\s\S]{100,}?\]/);
              if (arrayMatch) {
                const data = JSON.parse(arrayMatch[0]);
                if (Array.isArray(data) && data.length > 0 && data[0].title) {
                  allSessions = data;
                  break;
                }
              }
            } catch (e) {
              // Continue
            }
          }
        }
      }
    }
    
    if (allSessions.length === 0) {
      console.log('\n⚠️  Could not automatically extract sessions.');
      console.log('\nTrying manual method:');
      console.log('1. Open https://india-ai-explorer.vercel.app/ in browser');
      console.log('2. Open DevTools (F12) → Console tab');
      console.log('3. Run: JSON.stringify(window.__NEXT_DATA__?.props?.pageProps?.sessions || [])');
      console.log('4. Copy the output and save to data/sessions-raw.json');
      return null;
    }
    
    // Remove duplicates
    const uniqueSessions = [];
    const seen = new Set();
    for (const session of allSessions) {
      const key = `${session.title}-${session.dateISO || session.date}-${session.room || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSessions.push(session);
      }
    }
    
    console.log(`\n✅ Found ${uniqueSessions.length} unique sessions`);
    
    // Save raw data
    const outputPath = path.join(__dirname, '..', 'data', 'sessions-raw.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueSessions, null, 2));
    console.log(`✅ Saved to data/sessions-raw.json`);
    
    return uniqueSessions;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
fetchFromDeployed()
  .then(sessions => {
    if (sessions && sessions.length > 0) {
      console.log(`\n✅ Successfully extracted ${sessions.length} sessions!`);
      console.log('\nNext steps:');
      console.log('  npm run parse-sessions');
      console.log('  npm run update-sessions');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });
