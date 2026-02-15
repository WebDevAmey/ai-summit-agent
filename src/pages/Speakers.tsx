import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { speakers } from '@/data/speakers';
import { SpeakerCard } from '@/components/SpeakerCard';
import { SessionCard } from '@/components/SessionCard';
import { SessionDrawer } from '@/components/SessionDrawer';
import { getSessionsForSpeaker } from '@/lib/search';
import { Session } from '@/lib/types';

export default function SpeakersPage() {
  const [query, setQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [detailSession, setDetailSession] = useState<Session | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return speakers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.post.toLowerCase().includes(q) ||
      (s.company && s.company.toLowerCase().includes(q))
    );
  }, [query]);

  const speakerSessions = useMemo(
    () => selectedSpeaker ? getSessionsForSpeaker(selectedSpeaker) : [],
    [selectedSpeaker]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Speaker <span className="text-gradient">Directory</span>
        </h1>
        <p className="text-muted-foreground mb-8">{speakers.length} world-class speakers across 5 days</p>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search speakers…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Search speakers"
          />
        </div>

        {selectedSpeaker && (
          <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
          <h2 className="text-base sm:text-lg font-semibold font-sans text-foreground">
            Sessions with <span className="text-primary break-words">{selectedSpeaker}</span>
          </h2>
          <button onClick={() => setSelectedSpeaker(null)} className="text-xs text-primary hover:underline whitespace-nowrap">
            Show all speakers
          </button>
        </div>
            <div className="grid gap-4 md:grid-cols-2">
              {speakerSessions.map(s => (
                <SessionCard key={s.id} session={s} onOpenDetail={setDetailSession} />
              ))}
            </div>
            {speakerSessions.length === 0 && (
              <p className="text-muted-foreground text-sm">No sessions found for this speaker.</p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(speaker => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onClick={() => setSelectedSpeaker(speaker.name)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No speakers found.</p>
          </div>
        )}
      </div>

      <SessionDrawer session={detailSession} onClose={() => setDetailSession(null)} />
    </div>
  );
}
