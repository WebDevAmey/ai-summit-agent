# Extracting Sessions from HTML

This guide explains how to extract all 470 sessions from the `india-ai-explorer.vercel.app` HTML and update the repository.

## Method 1: Extract from HTML File (Recommended)

1. **Get the HTML:**
   - Open https://india-ai-explorer.vercel.app/ in your browser
   - Right-click and select "View Page Source" (or press Ctrl+U)
   - Save the entire HTML to a file (e.g., `page-source.html`)

2. **Extract sessions:**
   ```bash
   node scripts/process-html-sessions.js page-source.html
   ```

   This will:
   - Extract the SESSIONS array from the HTML
   - Parse and format all sessions
   - Update `src/data/sessions.ts`
   - Save intermediate files to `data/`

## Method 2: Extract from Browser Console

1. **Open the website:**
   - Go to https://india-ai-explorer.vercel.app/
   - Open Developer Tools (F12)
   - Go to Console tab

2. **Run the extraction code:**
   ```bash
   node scripts/extract-from-page.js
   ```
   This will create `scripts/browser-extract-sessions.js` with the code to paste in the console.

3. **Copy the output:**
   - The console will display the SESSIONS array as JSON
   - Copy the JSON output
   - Save it to `data/sessions-array.json`

4. **Process the JSON:**
   ```bash
   # Convert the array format to our format
   node scripts/convert-array-format.js data/sessions-array.json
   ```

## Method 3: Manual Extraction

If the automated methods don't work:

1. **Find the SESSIONS array in the HTML:**
   - Look for `const SESSIONS = [` in the HTML source
   - Copy the entire array (from `[` to matching `]`)

2. **Save as JSON:**
   - Save the array to `data/sessions-array.json`
   - Ensure it's valid JSON (array of objects)

3. **Process it:**
   ```bash
   node scripts/process-array-sessions.js data/sessions-array.json
   ```

## Expected Output

After successful extraction, you should have:
- `src/data/sessions.ts` - Updated with all ~470 sessions
- `data/sessions-raw.json` - Raw extracted data
- `data/sessions-parsed.json` - Parsed and formatted data
- `src/data/sessions.ts.backup` - Backup of original file

## Next Steps

1. **Update speakers:**
   ```bash
   node scripts/update-speakers.js
   ```
   This will extract all unique speakers and update `src/data/speakers.ts`

2. **Test the application:**
   ```bash
   npm run build
   npm run dev
   ```

3. **Verify:**
   - Check that all sessions are displayed
   - Verify filters work correctly
   - Test search functionality

## Troubleshooting

### "Could not find SESSIONS array"
- Ensure you're using the full HTML source (not just the rendered page)
- Check that the HTML contains `const SESSIONS = [`
- Try Method 2 (browser console) instead

### "Parsing errors"
- Verify the SESSIONS array is valid JavaScript/JSON
- Check for syntax errors in the array
- Ensure all brackets are properly matched

### "Missing sessions"
- The HTML might be truncated
- Try extracting from the browser console instead
- Check the network tab for API calls that might contain session data

## Scripts Overview

- `extract-sessions-direct.js` - Core extraction logic
- `process-html-sessions.js` - Master script for HTML processing
- `extract-from-page.js` - Browser console extraction code generator
- `parse-sessions.js` - Parse raw JSON to application format
- `update-sessions.js` - Update sessions.ts file

