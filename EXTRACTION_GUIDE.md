# Guide: Extracting 470 Sessions from Official Website

This guide will help you extract all ~470 sessions from https://impact.indiaai.gov.in/

## Quick Start

1. **Try automated extraction first:**
   ```bash
   npm install puppeteer
   node scripts/fetch-sessions.js
   node scripts/parse-sessions.js
   node scripts/update-sessions.js
   ```

2. **If that doesn't work, try API endpoints:**
   ```bash
   node scripts/fetch-api.js
   ```

3. **If APIs don't work, use manual extraction (see below)**

## Manual Extraction Method

Since the website loads content dynamically with JavaScript, you may need to extract the data manually:

### Step 1: Find the Session Data

1. Open https://impact.indiaai.gov.in/agenda in your browser
2. Open Developer Tools (Press F12)
3. Go to the **Network** tab
4. Filter by **XHR** or **Fetch**
5. Reload the page (F5)
6. Look for requests that return JSON data containing sessions

### Step 2: Identify the API Endpoint

Common patterns to look for:
- URLs containing `/api/sessions`
- URLs containing `/api/agenda`
- URLs containing `/api/events`
- Any JSON response with session/agenda data

### Step 3: Copy the JSON Data

1. Click on the network request that contains session data
2. Go to the **Response** or **Preview** tab
3. Copy the entire JSON response
4. Save it to `data/sessions-raw.json`

### Step 4: Process the Data

Once you have the raw JSON:

```bash
node scripts/parse-sessions.js
node scripts/update-sessions.js
```

## Alternative: Browser Console Method

If you can't find the API endpoint, try this:

1. Open https://impact.indiaai.gov.in/agenda
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Try these commands:

```javascript
// Try to find session data in window object
console.log(window.__INITIAL_STATE__);
console.log(window.__APOLLO_STATE__);
console.log(window.sessionData);
console.log(window.agendaData);

// Try to find React/Vue data
const reactRoot = document.querySelector('#root')._reactInternalInstance;
console.log(reactRoot);

// Look for any global variables with session data
Object.keys(window).filter(k => k.toLowerCase().includes('session') || k.toLowerCase().includes('agenda'))
```

5. If you find the data, copy it and save to `data/sessions-raw.json`

## Data Format Requirements

The `sessions-raw.json` file should contain an array of session objects. Each session should have:

```json
{
  "title": "Session Title",
  "speakers": ["Speaker 1", "Speaker 2"],
  "startTime": "9:00 AM",
  "endTime": "10:00 AM",
  "date": "Monday, February 16",
  "room": "Main Hall",
  "location": "Bharat Mandapam",
  "description": "Session description...",
  "category": "Keynote"
}
```

## Expected Session Count

The website should have approximately **470 sessions** across 5 days:
- Day 1 (Mon, Feb 16): ~94 sessions
- Day 2 (Tue, Feb 17): ~94 sessions
- Day 3 (Wed, Feb 18): ~94 sessions
- Day 4 (Thu, Feb 19): ~94 sessions
- Day 5 (Fri, Feb 20): ~94 sessions

## Troubleshooting

### "No sessions found"
- Verify you're looking at the correct network requests
- Check if the website requires login/authentication
- Try accessing the site in incognito mode
- Check browser console for errors

### "Parsing errors"
- Ensure `sessions-raw.json` is valid JSON
- Check the data structure matches expected format
- Review `scripts/parse-sessions.js` for field mappings

### "Missing fields"
- Some sessions may have incomplete data
- The parser will use defaults for missing fields
- You may need to manually update some sessions

## Contact

If you're unable to extract the data, you can:
1. Contact the summit organizers for a data export
2. Check if they provide a public API
3. Look for an export/download feature on the website

## Next Steps

After successfully extracting and updating the sessions:

1. **Update speakers**: Extract unique speakers and add to `src/data/speakers.ts`
2. **Test the application**: Run `npm run build` to verify everything works
3. **Review data**: Check a few sessions to ensure data quality
4. **Deploy**: The application is ready with all 470 sessions!

