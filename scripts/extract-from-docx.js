/**
 * Script to extract session data from summit-info.docx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cluster/topic mapping
const topicKeywords = {
  'keynotes': 'Keynotes & Firesides',
  'fireside': 'Keynotes & Firesides',
  'keynote': 'Keynotes & Firesides',
  'hackathon': 'Hackathons, Demos & Masterclasses',
  'demo': 'Hackathons, Demos & Masterclasses',
  'masterclass': 'Hackathons, Demos & Masterclasses',
  'healthcare': 'Healthcare & Biotech',
  'health': 'Healthcare & Biotech',
  'medical': 'Healthcare & Biotech',
  'biotech': 'Healthcare & Biotech',
  'agriculture': 'Agriculture & Food Systems',
  'agricultural': 'Agriculture & Food Systems',
  'food': 'Agriculture & Food Systems',
  'farming': 'Agriculture & Food Systems',
  'climate': 'Climate, Energy & Sustainability',
  'energy': 'Climate, Energy & Sustainability',
  'sustainability': 'Climate, Energy & Sustainability',
  'carbon': 'Climate, Energy & Sustainability',
  'cybersecurity': 'Cybersecurity & National Security',
  'security': 'Cybersecurity & National Security',
  'defense': 'Cybersecurity & National Security',
  'finance': 'Finance & Fintech',
  'fintech': 'Finance & Fintech',
  'banking': 'Finance & Fintech',
  'language': 'Multilingual & Indic Language AI',
  'multilingual': 'Multilingual & Indic Language AI',
  'llm': 'Frontier AI & Foundation Models',
  'foundation model': 'Frontier AI & Foundation Models',
  'frontier': 'Frontier AI & Foundation Models',
  'startup': 'Startups & Venture Capital',
  'venture': 'Startups & Venture Capital',
  'creative': 'Creative AI & Media',
  'media': 'Creative AI & Media',
  'space': 'Space, Quantum & Emerging Tech',
  'quantum': 'Space, Quantum & Emerging Tech',
  'education': 'Education & Skilling',
  'skilling': 'Education & Skilling',
  'learning': 'Education & Skilling',
  'inclusion': 'Women, Children & Social Impact',
  'women': 'Women, Children & Social Impact',
  'children': 'Women, Children & Social Impact',
  'global': 'Global Cooperation & Diplomacy',
  'cooperation': 'Global Cooperation & Diplomacy',
  'diplomacy': 'Global Cooperation & Diplomacy',
  'governance': 'AI Governance & Regulation',
  'regulation': 'AI Governance & Regulation',
  'policy': 'AI Governance & Regulation',
  'safety': 'AI Safety & Responsible AI',
  'responsible': 'AI Safety & Responsible AI',
  'ethics': 'AI Safety & Responsible AI',
  'dpi': 'Digital Public Infrastructure',
  'digital public': 'Digital Public Infrastructure',
  'infrastructure': 'AI Infrastructure & Compute',
  'compute': 'AI Infrastructure & Compute',
  'data': 'Data Governance & Open Data',
  'enterprise': 'Enterprise & Industry AI',
  'industry': 'Enterprise & Industry AI',
};

function getDayCode(dateStr) {
  if (!dateStr) return 'Mon16';
  
  const lower = dateStr.toLowerCase();
  if (lower.includes('16') || lower.includes('mon')) return 'Mon16';
  if (lower.includes('17') || lower.includes('tue')) return 'Tue17';
  if (lower.includes('18') || lower.includes('wed')) return 'Wed18';
  if (lower.includes('19') || lower.includes('thu')) return 'Thu19';
  if (lower.includes('20') || lower.includes('fri')) return 'Fri20';
  
  return 'Mon16';
}

function getDateLabel(dayCode) {
  const labels = {
    'Mon16': 'Mon, Feb 16',
    'Tue17': 'Tue, Feb 17',
    'Wed18': 'Wed, Feb 18',
    'Thu19': 'Thu, Feb 19',
    'Fri20': 'Fri, Feb 20',
  };
  return labels[dayCode] || labels['Mon16'];
}

function getDateISO(dayCode) {
  const dates = {
    'Mon16': '2026-02-16',
    'Tue17': '2026-02-17',
    'Wed18': '2026-02-18',
    'Thu19': '2026-02-19',
    'Fri20': '2026-02-20',
  };
  return dates[dayCode] || dates['Mon16'];
}

function formatTime(timeStr) {
  if (!timeStr) return '9:00 AM';
  
  // Handle various time formats
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i);
  if (!timeMatch) return '9:00 AM';
  
  let hour = parseInt(timeMatch[1]);
  const minutes = timeMatch[2] || '00';
  let period = timeMatch[3]?.toUpperCase() || '';
  
  // Convert to 12-hour format if needed
  if (!period) {
    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    } else {
      period = 'AM';
    }
  }
  
  return `${hour}:${minutes} ${period}`;
}

function inferTopics(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const topics = new Set();
  
  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (text.includes(keyword)) {
      topics.add(topic);
    }
  }
  
  if (topics.size === 0) {
    topics.add('General AI');
  }
  
  return Array.from(topics);
}

function parseSpeakers(speakerStr) {
  if (!speakerStr) return [];
  
  return speakerStr
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Clean up speaker names
      return s.replace(/\s*\([^)]*\)\s*/g, '').trim();
    })
    .filter(s => s.length > 0);
}

// Parse session from text lines
function parseSessionFromText(lines, index) {
  const session = {
    title: '',
    description: '',
    speakers: [],
    startTime: '9:00 AM',
    endTime: '',
    date: '',
    location: 'Bharat Mandapam',
    room: 'Main Hall',
    knowledgePartners: [],
  };
  
  let currentField = '';
  let inDescription = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Detect title (usually first non-empty line or line with "Session" or numbered)
    if (!session.title && (line.length > 10 || line.match(/^\d+\./))) {
      session.title = line.replace(/^\d+\.\s*/, '');
      continue;
    }
    
    // Detect time patterns
    const timeMatch = line.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) {
      session.startTime = formatTime(`${timeMatch[1]}:${timeMatch[2] || '00'} ${timeMatch[3] || ''}`);
      session.endTime = formatTime(`${timeMatch[4]}:${timeMatch[5] || '00'} ${timeMatch[6] || ''}`);
      continue;
    }
    
    // Detect date
    if (line.match(/feb|february|16|17|18|19|20/i)) {
      session.date = line;
      continue;
    }
    
    // Detect speakers
    if (line.match(/speaker|panelist|presenter/i) || line.includes(':')) {
      const speakerMatch = line.match(/(?:speaker|panelist|presenter)[s]?:?\s*(.+)/i);
      if (speakerMatch) {
        session.speakers = parseSpeakers(speakerMatch[1]);
      } else if (line.includes(':')) {
        const parts = line.split(':');
        if (parts.length > 1 && parts[1].trim().length > 0) {
          session.speakers = parseSpeakers(parts[1]);
        }
      }
      continue;
    }
    
    // Detect location/room
    if (line.match(/room|hall|venue|location|bharat|mandapam/i)) {
      if (line.match(/room/i)) {
        const roomMatch = line.match(/room\s*[#:]?\s*(.+)/i);
        if (roomMatch) session.room = roomMatch[1].trim();
      }
      if (line.match(/hall/i)) {
        const hallMatch = line.match(/hall\s*[#:]?\s*(.+)/i);
        if (hallMatch) session.room = hallMatch[1].trim();
      }
      continue;
    }
    
    // Everything else is description
    if (session.title && !session.description && line.length > 20) {
      session.description = line;
      inDescription = true;
    } else if (inDescription && line.length > 10) {
      session.description += ' ' + line;
    }
  }
  
  // If no description found, use title as description
  if (!session.description && session.title) {
    session.description = session.title;
  }
  
  return session;
}

async function extractFromDocx(docxPath) {
  console.log(`Reading ${docxPath}...`);
  
  const result = await mammoth.extractRawText({ path: docxPath });
  const text = result.value;
  
  console.log(`Extracted ${text.length} characters from document`);
  
  // First, try to find the SESSIONS array (compressed format from HTML)
  const sessionsMatch = text.match(/const SESSIONS = (\[[\s\S]*?\]);/);
  if (sessionsMatch) {
    console.log(`✅ Found SESSIONS array in document!`);
    try {
      const rawSessions = (new Function(`return ${sessionsMatch[1]}`))();
      console.log(`   Extracted ${rawSessions.length} sessions from SESSIONS array`);
      
      // Use the same parsing logic as extract-sessions-direct.js
      const clusterToTopic = {
        'keynotes': 'Keynotes & Firesides',
        'hackathons': 'Hackathons, Demos & Masterclasses',
        'healthcare': 'Healthcare & Biotech',
        'agriculture': 'Agriculture & Food Systems',
        'climate': 'Climate, Energy & Sustainability',
        'defense': 'Cybersecurity & National Security',
        'finance': 'Finance & Fintech',
        'languages': 'Multilingual & Indic Language AI',
        'frontier': 'Frontier AI & Foundation Models',
        'startups': 'Startups & Venture Capital',
        'creative': 'Creative AI & Media',
        'space': 'Space, Quantum & Emerging Tech',
        'education': 'Education & Skilling',
        'inclusion': 'Women, Children & Social Impact',
        'global': 'Global Cooperation & Diplomacy',
        'governance': 'AI Governance & Regulation',
        'safety': 'AI Safety & Responsible AI',
        'dpi': 'Digital Public Infrastructure',
        'infra': 'AI Infrastructure & Compute',
        'data': 'Data Governance & Open Data',
        'enterprise': 'Enterprise & Industry AI',
        'general': 'General AI',
      };
      
      const formattedSessions = rawSessions.map(rawSession => {
        const dayCode = getDayCode(rawSession.dt);
        const dateLabel = getDateLabel(dayCode);
        
        // Get topics from cluster IDs
        const topics = [];
        if (rawSession.c && clusterToTopic[rawSession.c]) {
          topics.push(clusterToTopic[rawSession.c]);
        }
        if (rawSession.c2 && Array.isArray(rawSession.c2)) {
          rawSession.c2.forEach(c => {
            if (clusterToTopic[c] && !topics.includes(clusterToTopic[c])) {
              topics.push(clusterToTopic[c]);
            }
          });
        }
        if (topics.length === 0) {
          topics.push('General AI');
        }
        
        const speakers = parseSpeakers(rawSession.sp);
        const knowledgePartners = rawSession.kp ? [rawSession.kp] : [];
        
        return {
          title: rawSession.t || '',
          dateLabel,
          dateISO: rawSession.dt || '2026-02-16',
          startTime: formatTime(rawSession.st),
          endTime: rawSession.et ? formatTime(rawSession.et) : '',
          location: rawSession.v || 'Bharat Mandapam',
          room: rawSession.r || 'Main Hall',
          speakers,
          description: rawSession.d || '',
          knowledgePartners,
          topics,
          dayCode,
        };
      });
      
      return formattedSessions;
    } catch (error) {
      console.error(`   Error parsing SESSIONS array: ${error.message}`);
      // Fall through to text parsing
    }
  }
  
  // Fallback: Parse from text (original logic)
  console.log(`   Parsing from document text...`);
  const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
  console.log(`   Found ${lines.length} non-empty lines`);
  
  // Filter out HTML/CSS content
  const filteredLines = lines.filter(line => {
    return !line.startsWith('<') && 
           !line.includes('DOCTYPE') &&
           !line.includes('var(--') &&
           !line.match(/^[.#]?\w+\s*\{/) &&
           line.length > 5;
  });
  
  const sessions = [];
  let currentSessionLines = [];
  
  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const isNewSession = line.match(/^\d+\./) || 
                        line.match(/^session\s*\d+/i) ||
                        (line.length > 30 && currentSessionLines.length > 3);
    
    if (isNewSession && currentSessionLines.length > 0) {
      const session = parseSessionFromText(currentSessionLines, sessions.length);
      if (session.title && session.title.length > 10) {
        sessions.push(session);
      }
      currentSessionLines = [line];
    } else {
      currentSessionLines.push(line);
    }
  }
  
  if (currentSessionLines.length > 0) {
    const session = parseSessionFromText(currentSessionLines, sessions.length);
    if (session.title && session.title.length > 10) {
      sessions.push(session);
    }
  }
  
  console.log(`   Parsed ${sessions.length} sessions from text`);
  
  const formattedSessions = sessions.map((session, index) => {
    const dayCode = getDayCode(session.date);
    const topics = inferTopics(session.title, session.description);
    
    return {
      title: session.title || `Session ${index + 1}`,
      dateLabel: getDateLabel(dayCode),
      dateISO: getDateISO(dayCode),
      startTime: session.startTime,
      endTime: session.endTime || '',
      location: session.location,
      room: session.room,
      speakers: session.speakers,
      description: session.description || session.title,
      knowledgePartners: session.knowledgePartners,
      topics,
      dayCode,
    };
  });
  
  return formattedSessions;
}

async function main() {
  const docxPath = process.argv[2];
  
  if (!docxPath) {
    console.error('Usage: node extract-from-docx.js <path-to-summit-info.docx>');
    console.error('\nExample:');
    console.error('  node extract-from-docx.js ../summit-info.docx');
    console.error('  node extract-from-docx.js "C:\\Users\\Amey Tarmale\\Desktop\\summit-info.docx"');
    process.exit(1);
  }
  
  if (!fs.existsSync(docxPath)) {
    console.error(`❌ File not found: ${docxPath}`);
    process.exit(1);
  }
  
  try {
    const sessions = await extractFromDocx(docxPath);
    
    // Save to data directory
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const outputPath = path.join(dataDir, 'sessions-raw.json');
    fs.writeFileSync(outputPath, JSON.stringify(sessions, null, 2));
    console.log(`✅ Saved ${sessions.length} sessions to data/sessions-raw.json`);
    
    // Also save as parsed format
    const parsedPath = path.join(dataDir, 'sessions-parsed.json');
    fs.writeFileSync(parsedPath, JSON.stringify(sessions, null, 2));
    console.log(`✅ Saved to data/sessions-parsed.json`);
    
    console.log(`\n📊 Statistics:`);
    console.log(`   - Total sessions: ${sessions.length}`);
    const byDay = {};
    sessions.forEach(s => {
      byDay[s.dayCode] = (byDay[s.dayCode] || 0) + 1;
    });
    Object.entries(byDay).forEach(([day, count]) => {
      console.log(`     ${day}: ${count} sessions`);
    });
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Review data/sessions-raw.json`);
    console.log(`   2. Run: node scripts/update-sessions.js`);
    console.log(`   3. Update speakers.ts with new speakers`);
    
    return sessions;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('extract-from-docx.js')) {
  main();
}

export { extractFromDocx, parseSessionFromText };

