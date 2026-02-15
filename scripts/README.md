# Session Data Extraction Scripts

This directory contains scripts to extract and parse session data from the official India AI Impact Summit website.

## Prerequisites

Install required dependencies:
```bash
npm install puppeteer
```

## Method 1: Automated Extraction (Recommended)

### Step 1: Fetch Sessions
```bash
node scripts/fetch-sessions.js
```

This script will:
- Launch a headless browser
- Navigate to the agenda page
- Extract session data from the page
- Save raw data to `data/sessions-raw.json`

### Step 2: Parse Sessions
```bash
node scripts/parse-sessions.js
```

This script will:
- Read the raw session data
- Convert it to the application's format
- Remove duplicates
- Save parsed data to `data/sessions-parsed.json`

### Step 3: Update Application
```bash
node scripts/update-sessions.js
```

This will merge the parsed sessions into `src/data/sessions.ts`

## Method 2: Manual Extraction

If the automated script doesn't work, you can manually extract the data:

1. **Open the website**: https://impact.indiaai.gov.in/agenda
2. **Open Browser DevTools** (F12)
3. **Go to Network tab**
4. **Filter by XHR/Fetch**
5. **Reload the page**
6. **Look for API calls** that return session data (usually JSON responses)
7. **Copy the JSON response** and save it to `data/sessions-raw.json`

Common API endpoint patterns to look for:
- `/api/sessions`
- `/api/agenda`
- `/api/events`
- `/api/v1/sessions`
- Any endpoint returning JSON with session/agenda/event data

## Method 3: Direct API Access

If you know the API endpoint, you can fetch it directly:

```bash
curl https://impact.indiaai.gov.in/api/sessions > data/sessions-raw.json
```

Or use the fetch script with a known endpoint:
```bash
node scripts/fetch-api.js https://impact.indiaai.gov.in/api/sessions
```

## Data Format

The raw JSON should contain an array of session objects. Each session should have:
- `title` or `name` - Session title
- `speakers` or `speaker` - Array of speaker names or objects
- `startTime` or `time` - Start time (e.g., "9:00 AM")
- `endTime` or `end` - End time (e.g., "10:00 AM")
- `date` or `day` - Date information
- `room` or `hall` or `venueRoom` - Room/venue name
- `description` or `desc` - Session description
- `category` or `track` or `type` - Session category
- `location` or `venue` - Location name

## Troubleshooting

### No sessions found
- Check if the website requires authentication
- Verify the URL structure hasn't changed
- Try accessing the site manually to see the actual structure

### Parsing errors
- Check the format of `sessions-raw.json`
- Ensure it's valid JSON
- Verify the data structure matches expected format

### Missing data
- Some fields may need manual mapping
- Check the `parse-sessions.js` script for field mappings
- Update the parsing logic if the data structure differs

