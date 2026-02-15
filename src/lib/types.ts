export interface Speaker {
  id: string;
  name: string;
  post: string;
  company?: string;
  profileUrl?: string;
}

export interface Session {
  id: string;
  title: string;
  dateLabel: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  location: string;
  room: string;
  speakers: string[];
  description: string;
  knowledgePartners: string[];
  liveUrl?: string;
  topics: string[];
  dayCode: 'Mon16' | 'Tue17' | 'Wed18' | 'Thu19' | 'Fri20';
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
}

export interface TopicInfo {
  name: string;
  icon: string;
  count: number;
  color: string;
}

export type DayCode = Session['dayCode'];
export type TimeSlot = Session['timeSlot'];

export const DAY_LABELS: Record<DayCode, string> = {
  Mon16: 'Mon, Feb 16',
  Tue17: 'Tue, Feb 17',
  Wed18: 'Wed, Feb 18',
  Thu19: 'Thu, Feb 19',
  Fri20: 'Fri, Feb 20',
};

export const VENUE = 'Bharat Mandapam, New Delhi';

export const ALL_TOPICS = [
  'Keynotes & Firesides',
  'Healthcare & Biotech',
  'Agriculture & Food Systems',
  'Climate, Energy & Sustainability',
  'Cybersecurity & National Security',
  'Finance & Fintech',
  'AI Governance & Regulation',
  'AI Safety & Responsible AI',
  'Education & Skilling',
  'Digital Public Infrastructure',
  'AI Infrastructure & Compute',
  'Startups & Venture Capital',
  'Enterprise & Industry AI',
  'Creative AI & Media',
  'Global Cooperation & Diplomacy',
  'General AI',
] as const;

export type TopicName = typeof ALL_TOPICS[number];
