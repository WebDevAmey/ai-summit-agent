/**
 * Browser console script to extract SESSIONS array from india-ai-explorer.vercel.app
 * 
 * Instructions:
 * 1. Open https://india-ai-explorer.vercel.app/ in your browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. The script will extract the SESSIONS array and display it
 * 6. Copy the output and save it to data/sessions-array.json
 */

const extractCode = `
(async function() {
  console.log('🔍 Extracting SESSIONS array...');
  
  // Method 1: Check for SESSIONS in script tags
  const scripts = Array.from(document.querySelectorAll('script'));
  let sessionsData = null;
  
  for (const script of scripts) {
    const content = script.textContent || script.innerHTML;
    if (content.includes('const SESSIONS =') || content.includes('var SESSIONS =') || content.includes('let SESSIONS =')) {
      console.log('✅ Found SESSIONS array in script tag');
      
      // Extract the array
      const match = content.match(/(?:const|var|let)\\s+SESSIONS\\s*=\\s*(\\[[\\s\\S]*?\\]);/);
      if (match) {
        try {
          sessionsData = eval('(' + match[1] + ')');
          console.log(\`✅ Extracted \${sessionsData.length} sessions\`);
          break;
        } catch (e) {
          console.error('❌ Error parsing SESSIONS:', e);
        }
      }
    }
  }
  
  // Method 2: Try to access via window object (if available)
  if (!sessionsData && window.SESSIONS) {
    sessionsData = window.SESSIONS;
    console.log('✅ Found SESSIONS in window object');
  }
  
  // Method 3: Try to find in page context
  if (!sessionsData) {
    // Look for the array in the page source
    const pageSource = document.documentElement.outerHTML;
    const match = pageSource.match(/(?:const|var|let)\\s+SESSIONS\\s*=\\s*(\\[[\\s\\S]*?\\]);/);
    if (match) {
      try {
        sessionsData = eval('(' + match[1] + ')');
        console.log('✅ Found SESSIONS in page source');
      } catch (e) {
        console.error('❌ Error parsing from page source:', e);
      }
    }
  }
  
  if (sessionsData) {
    console.log('\\n📋 Copy the JSON below and save it to data/sessions-array.json:');
    console.log('\\n' + '='.repeat(80));
    console.log(JSON.stringify(sessionsData, null, 2));
    console.log('='.repeat(80));
    console.log('\\n✅ Extraction complete!');
    return sessionsData;
  } else {
    console.error('❌ Could not find SESSIONS array. Try:');
    console.log('1. Check if the page has fully loaded');
    console.log('2. Look for SESSIONS in the page source (View Source)');
    console.log('3. Check Network tab for API calls that might return session data');
    return null;
  }
})();
`;

// For Node.js usage - this will be written to a file
export const browserExtractCode = extractCode;

// If running in Node.js, write the code to a file
if (typeof window === 'undefined') {
  import('fs').then(async (fs) => {
    const fsModule = fs.default || fs;
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const outputPath = path.join(__dirname, 'browser-extract-sessions.js');
    fsModule.writeFileSync(outputPath, `// Copy and paste this code into the browser console on https://india-ai-explorer.vercel.app/\n\n${extractCode}`);
    console.log(`✅ Browser extraction code saved to ${outputPath}`);
    console.log('\nInstructions:');
    console.log('1. Open https://india-ai-explorer.vercel.app/ in your browser');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Copy and paste the code from browser-extract-sessions.js');
    console.log('5. Copy the output JSON and save it to data/sessions-array.json');
  });
}

