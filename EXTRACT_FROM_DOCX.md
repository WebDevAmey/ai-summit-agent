# Extracting Sessions from summit-info.docx

This guide explains how to extract all sessions from the `summit-info.docx` file and update the repository.

## Prerequisites

The script uses `mammoth` library which is already installed. If you need to reinstall:

```bash
npm install mammoth --save-dev
```

## Usage

1. **Place the file:**
   - Place `summit-info.docx` in the project root or provide the full path
   - The file should contain session information (titles, speakers, times, descriptions, etc.)

2. **Run the extraction:**
   ```bash
   npm run extract-from-docx "path/to/summit-info.docx"
   ```
   
   Or directly:
   ```bash
   node scripts/extract-from-docx.js "path/to/summit-info.docx"
   ```

3. **Update sessions.ts:**
   ```bash
   node scripts/update-sessions.js
   ```

## What the Script Does

1. **Extracts text** from the .docx file using mammoth
2. **Parses sessions** by identifying:
   - Session titles
   - Speakers
   - Times (start and end)
   - Dates
   - Locations and rooms
   - Descriptions
   - Knowledge partners
3. **Infers topics** from title and description keywords
4. **Formats data** to match the application structure
5. **Saves** to `data/sessions-raw.json` and `data/sessions-parsed.json`

## Expected Document Format

The script works best with documents that have:

- **Session titles** (numbered or clearly separated)
- **Time information** (e.g., "9:00 AM - 10:30 AM" or "09:00-10:30")
- **Date information** (e.g., "Feb 16", "Monday, February 16")
- **Speaker names** (e.g., "Speakers: John Doe, Jane Smith")
- **Descriptions** (session descriptions or summaries)
- **Location/Room** information (e.g., "Room: Main Hall", "Venue: Bharat Mandapam")

## Output

After running the script, you'll have:

- `data/sessions-raw.json` - Raw extracted session data
- `data/sessions-parsed.json` - Parsed and formatted data
- Console output with statistics (session count, distribution by day)

## Next Steps

1. **Review the extracted data:**
   ```bash
   # Check the JSON files
   cat data/sessions-raw.json
   ```

2. **Update sessions.ts:**
   ```bash
   node scripts/update-sessions.js
   ```

3. **Update speakers.ts:**
   - Extract unique speakers from the sessions
   - Add them to `src/data/speakers.ts`

4. **Test the application:**
   ```bash
   npm run build
   npm run dev
   ```

## Troubleshooting

### "File not found"
- Ensure the file path is correct
- Use absolute path if relative path doesn't work
- Check file permissions

### "No sessions found"
- The document format might be different than expected
- Check the console output for parsing details
- You may need to adjust the parsing logic in `extract-from-docx.js`

### "Incorrect time format"
- The script tries to handle various time formats
- If times are parsed incorrectly, check the format in the document
- You may need to adjust the `formatTime` function

### "Missing speakers"
- Speaker information might be in a different format
- Check how speakers are listed in the document
- Adjust the `parseSpeakers` function if needed

## Customization

If your document has a specific format, you can customize the parsing in `scripts/extract-from-docx.js`:

- `parseSessionFromText()` - Main parsing function
- `formatTime()` - Time format conversion
- `parseSpeakers()` - Speaker name extraction
- `inferTopics()` - Topic inference from keywords

## Example Document Structure

The script expects something like:

```
1. Session Title Here
   Time: 9:00 AM - 10:30 AM
   Date: Monday, February 16, 2026
   Speakers: John Doe, Jane Smith
   Room: Main Hall
   Description: This session explores...
   
2. Another Session Title
   ...
```

Or any similar structured format.

