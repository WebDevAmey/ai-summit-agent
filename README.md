# India AI Impact Summit 2026 — Session Explorer

Explore 470 sessions, 3,000+ speakers across 5 days at the India AI Impact Summit 2026. Filter by topic, day, time, and venue to build your personalized agenda.

## Features

- 🔍 **470 Sessions** across 5 days (Feb 16-20, 2026)
- 👥 **3,000+ Speakers** from industry, academia, and government
- 🏷️ **22 Topics** including Healthcare, Agriculture, Climate, AI Safety, and more
- 📅 **Smart Filtering** by day, time slot, venue, and topic
- 📱 **Responsive Design** works on all devices
- 💾 **My Agenda** save your favorite sessions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Install Node.js with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd ai-summit-agent

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Extracting Session Data

This application includes all 470 sessions extracted from the official summit data. If you need to update or re-extract sessions:

### From Word Document (.docx)

```bash
# Place summit-info.docx in the project root, then:
npm run extract-docx
npm run update-sessions
npm run update-speakers
```

### From HTML

```bash
# Extract from HTML file
npm run extract-from-html <path-to-html-file>
npm run update-sessions
```

For detailed extraction instructions, see:
- [EXTRACT_FROM_DOCX.md](./EXTRACT_FROM_DOCX.md)
- [EXTRACT_FROM_HTML.md](./EXTRACT_FROM_HTML.md)
- [EXTRACTION_GUIDE.md](./EXTRACTION_GUIDE.md)

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite and configure the build
   - Click "Deploy"

   The build settings are already configured:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Custom Domain (Optional):**
   - In Vercel project settings, go to "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ai-summit-agent/
├── src/
│   ├── components/     # React components
│   ├── data/          # Session and speaker data
│   ├── lib/           # Utilities and types
│   ├── pages/         # Page components
│   └── main.tsx       # Entry point
├── scripts/           # Data extraction scripts
├── public/            # Static assets
└── dist/              # Production build output
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run extract-docx` - Extract sessions from .docx file
- `npm run update-sessions` - Update sessions.ts from parsed data
- `npm run update-speakers` - Update speakers.ts from sessions

## License

This project is created for the India AI Impact Summit 2026.
