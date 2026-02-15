import { useState, useCallback } from 'react';
import { getSavedSessions, removeSessionId, exportAgendaAsText } from '@/lib/agenda';
import { SessionCard } from '@/components/SessionCard';
import { SessionDrawer } from '@/components/SessionDrawer';
import { Session, DAY_LABELS, DayCode } from '@/lib/types';
import { Download, Trash2, CalendarDays } from 'lucide-react';

export default function AgendaPage() {
  const [tick, setTick] = useState(0);
  const [detailSession, setDetailSession] = useState<Session | null>(null);

  const sessions = getSavedSessions();
  const refresh = useCallback(() => setTick(t => t + 1), []);

  // Group by day
  const grouped = new Map<DayCode, Session[]>();
  sessions.forEach(s => {
    const arr = grouped.get(s.dayCode) || [];
    arr.push(s);
    grouped.set(s.dayCode, arr);
  });

  const handleExport = () => {
    const text = exportAgendaAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-summit-agenda.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = (id: string) => {
    removeSessionId(id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              My <span className="text-gradient">Agenda</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">{sessions.length} saved session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">Your agenda is empty</p>
            <p className="text-sm text-muted-foreground">Browse sessions and tap the bookmark icon to save them here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(DAY_LABELS) as [DayCode, string][]).map(([code, label]) => {
              const daySessions = grouped.get(code);
              if (!daySessions?.length) return null;
              daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <div key={code}>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 font-sans">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    {label}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {daySessions.map(session => (
                      <div key={session.id} className="relative">
                        <SessionCard
                          session={session}
                          onOpenDetail={setDetailSession}
                          onAgendaChange={refresh}
                        />
                        <button
                          onClick={() => handleRemove(session.id)}
                          className="absolute top-2 right-12 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          aria-label="Remove from agenda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SessionDrawer session={detailSession} onClose={() => setDetailSession(null)} />
    </div>
  );
}
