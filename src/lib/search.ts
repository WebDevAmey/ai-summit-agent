import { Session, TopicInfo, ALL_TOPICS, TopicName } from "./types";
import { dedupedSessions } from "@/data/sessions";
import { speakers } from "@/data/speakers";
import { parseTimeToMinutes } from "./utils";

// Precomputed search index
interface SearchEntry {
  session: Session;
  searchText: string;
}

const searchIndex: SearchEntry[] = dedupedSessions.map(s => ({
  session: s,
  searchText: [
    s.title,
    s.description,
    ...s.speakers,
    ...s.topics,
    s.room,
    s.location,
  ].join(' ').toLowerCase(),
}));

export function searchSessions(
  query: string,
  filters: {
    day?: string | null;
    topics?: string[];
    timeSlot?: string | null;
    speaker?: string | null;
  },
  sort: "time" | "title" | "topics" = "time"
): Session[] {
  const q = query.toLowerCase().trim();

  let results = searchIndex
    .filter((entry) => {
      if (q && !entry.searchText.includes(q)) return false;
      if (filters.day && entry.session.dayCode !== filters.day) return false;
      if (filters.timeSlot && entry.session.timeSlot !== filters.timeSlot) return false;
      if (filters.topics?.length && !filters.topics.some((t) => entry.session.topics.includes(t))) return false;
      if (filters.speaker && !entry.session.speakers.includes(filters.speaker)) return false;
      return true;
    })
    .map((e) => e.session);

  switch (sort) {
    case "time": {
      // Stable, time-aware sort: first by calendar day, then by parsed start time, then by title.
      results = [...results].sort((a, b) => {
        const dateComp = a.dateISO.localeCompare(b.dateISO);
        if (dateComp !== 0) return dateComp;

        const aMinutes = parseTimeToMinutes(a.startTime);
        const bMinutes = parseTimeToMinutes(b.startTime);
        if (aMinutes !== bMinutes) return aMinutes - bMinutes;

        return a.title.localeCompare(b.title);
      });
      break;
    }
    case "title":
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "topics":
      results = [...results].sort((a, b) => b.topics.length - a.topics.length);
      break;
  }

  return results;
}

const TOPIC_ICONS: Record<string, string> = {
  'Keynotes & Firesides': '🎤',
  'Healthcare & Biotech': '🏥',
  'Agriculture & Food Systems': '🌾',
  'Climate, Energy & Sustainability': '🌍',
  'Cybersecurity & National Security': '🔒',
  'Finance & Fintech': '💰',
  'AI Governance & Regulation': '⚖️',
  'AI Safety & Responsible AI': '🛡️',
  'Education & Skilling': '📚',
  'Digital Public Infrastructure': '🏛️',
  'AI Infrastructure & Compute': '⚡',
  'Startups & Venture Capital': '🚀',
  'Enterprise & Industry AI': '🏢',
  'Creative AI & Media': '🎨',
  'Global Cooperation & Diplomacy': '🌐',
  'General AI': '🤖',
};

const TOPIC_COLORS: Record<string, string> = {
  'Keynotes & Firesides': 'from-orange-500/20 to-amber-500/10',
  'Healthcare & Biotech': 'from-emerald-500/20 to-teal-500/10',
  'Agriculture & Food Systems': 'from-lime-500/20 to-green-500/10',
  'Climate, Energy & Sustainability': 'from-cyan-500/20 to-blue-500/10',
  'Cybersecurity & National Security': 'from-red-500/20 to-rose-500/10',
  'Finance & Fintech': 'from-yellow-500/20 to-amber-500/10',
  'AI Governance & Regulation': 'from-purple-500/20 to-violet-500/10',
  'AI Safety & Responsible AI': 'from-indigo-500/20 to-blue-500/10',
  'Education & Skilling': 'from-sky-500/20 to-blue-500/10',
  'Digital Public Infrastructure': 'from-teal-500/20 to-cyan-500/10',
  'AI Infrastructure & Compute': 'from-orange-500/20 to-red-500/10',
  'Startups & Venture Capital': 'from-pink-500/20 to-rose-500/10',
  'Enterprise & Industry AI': 'from-slate-500/20 to-gray-500/10',
  'Creative AI & Media': 'from-fuchsia-500/20 to-purple-500/10',
  'Global Cooperation & Diplomacy': 'from-blue-500/20 to-indigo-500/10',
  'General AI': 'from-gray-500/20 to-slate-500/10',
};

export function getTopicStats(): TopicInfo[] {
  const counts = new Map<string, number>();
  dedupedSessions.forEach(s => {
    s.topics.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
  });

  return ALL_TOPICS
    .map(name => ({
      name,
      icon: TOPIC_ICONS[name] || '🤖',
      count: counts.get(name) || 0,
      color: TOPIC_COLORS[name] || 'from-gray-500/20 to-slate-500/10',
    }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getSpeakerSessionCount(speakerName: string): number {
  return dedupedSessions.filter(s => s.speakers.includes(speakerName)).length;
}

export function getSessionsForSpeaker(speakerName: string): Session[] {
  return dedupedSessions.filter(s => s.speakers.includes(speakerName));
}

export { dedupedSessions as allSessions };
export { speakers as allSpeakers };
