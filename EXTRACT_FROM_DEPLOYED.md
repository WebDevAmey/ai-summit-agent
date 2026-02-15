# Extract 470 Sessions from Deployed Site

Since https://india-ai-explorer.vercel.app/ has all 470 sessions, here's how to extract them:

## Quick Method: Browser Console

1. **Open the deployed site**: https://india-ai-explorer.vercel.app/
2. **Open Developer Tools** (Press F12)
3. **Go to Console tab**
4. **Run this code**:

```javascript
// Get all sessions from the page
const sessions = [];

// Method 1: Check if sessions are exposed globally
if (window.sessions || window.__sessions) {
  sessions.push(...(window.sessions || window.__sessions));
}

// Method 2: Check Next.js data
if (window.__NEXT_DATA__?.props?.pageProps?.sessions) {
  sessions.push(...window.__NEXT_DATA__.props.pageProps.sessions);
}

// Method 3: Try to access React component state
// (Requires React DevTools extension)
const root = document.querySelector('#root');
if (root && root._reactInternalFiber) {
  // Navigate React fiber tree to find sessions
  let fiber = root._reactInternalFiber;
  while (fiber) {
    if (fiber.memoizedState || fiber.memoizedProps) {
      const state = fiber.memoizedState;
      const props = fiber.memoizedProps;
      if (state?.sessions) {
        sessions.push(...state.sessions);
        break;
      }
      if (props?.sessions) {
        sessions.push(...props.sessions);
        break;
      }
    }
    fiber = fiber.child || fiber.sibling;
  }
}

// If found, copy to clipboard
if (sessions.length > 0) {
  const json = JSON.stringify(sessions, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log(`✅ Copied ${sessions.length} sessions to clipboard!`);
    console.log('Now paste into data/sessions-raw.json');
  });
} else {
  console.log('⚠️ Sessions not found automatically.');
  console.log('Try Method 2: Network Tab');
}
```

5. **If sessions are found**, they'll be copied to your clipboard
6. **Paste into** `data/sessions-raw.json`
7. **Run**: `npm run parse-sessions && npm run update-sessions`

## Method 2: Network Tab

1. Open https://india-ai-explorer.vercel.app/
2. Open DevTools (F12) → **Network** tab
3. **Filter by JS** (JavaScript files)
4. **Reload the page** (F5)
5. Look for the main bundle file (usually `index-*.js` or similar)
6. **Click on it** → Go to **Response** tab
7. **Search for** `"sessions"` or `"title":`
8. **Find the array** of session objects
9. **Copy the entire array** (from `[` to `]`)
10. **Save to** `data/sessions-raw.json`
11. **Run**: `npm run parse-sessions && npm run update-sessions`

## Method 3: Source Map

1. Open https://india-ai-explorer.vercel.app/
2. Open DevTools (F12) → **Sources** tab
3. Look for `webpack://` or source maps
4. Navigate to `src/data/sessions.ts`
5. The file should be readable in the Sources tab
6. Copy the session data

## Method 4: Direct File Access

Try these URLs (may not work if not public):
- https://india-ai-explorer.vercel.app/src/data/sessions.ts
- https://india-ai-explorer.vercel.app/data/sessions.json
- https://india-ai-explorer.vercel.app/api/sessions

## After Extraction

Once you have `data/sessions-raw.json`:

```bash
npm run parse-sessions
npm run update-sessions
npm run build
```

This will update your local application with all 470 sessions from the deployed site.

