# Manual Extraction from Deployed Site

Since the deployed site (https://india-ai-explorer.vercel.app/) has all 470 sessions, you can extract them directly from the browser:

## Method 1: Browser Console (Easiest)

1. Open https://india-ai-explorer.vercel.app/ in your browser
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Run this command:

```javascript
// Try to access the sessions from the React app
const root = document.querySelector('#root');
const reactFiber = root._reactInternalFiber || root._reactInternalInstance;

// Or try to find it in the window object
console.log('Checking window objects...');
console.log(window.__NEXT_DATA__);
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);

// If using React DevTools, you can inspect the component tree
// Look for the component that renders sessions
```

## Method 2: Network Tab

1. Open https://india-ai-explorer.vercel.app/
2. Open DevTools (F12) → **Network** tab
3. Filter by **JS** or **Fetch/XHR**
4. Look for JavaScript bundles (usually `index-*.js` or `chunk-*.js`)
5. Click on the main bundle file
6. In the **Response** tab, search for `"sessions"` or `"title"`
7. Copy the JSON array containing sessions

## Method 3: Source Code

Since this is the same repository, check the GitHub repo for the latest sessions.ts file:
- https://github.com/WebDevAmey/ai-summit-navigator

## Method 4: Direct Data Access

If the app exports the data, try accessing:
- https://india-ai-explorer.vercel.app/data/sessions.json
- https://india-ai-explorer.vercel.app/api/sessions
- https://india-ai-explorer.vercel.app/sessions.json

