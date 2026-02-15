import { Session } from '@/lib/types';
import { X, Calendar, Clock, MapPin, Users, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { isSessionSaved, saveSessionId, removeSessionId } from '@/lib/agenda';
import { useState, useEffect } from 'react';

interface SessionDrawerProps {
  session: Session | null;
  onClose: () => void;
}

export function SessionDrawer({ session, onClose }: SessionDrawerProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session) setSaved(isSessionSaved(session.id));
  }, [session]);

  useEffect(() => {
    if (session) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [session]);

  if (!session) return null;

  const toggleSave = () => {
    if (saved) removeSessionId(session.id);
    else saveSessionId(session.id);
    setSaved(!saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-card border-l border-border overflow-y-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md">
          <h2 className="text-lg font-bold font-sans text-foreground truncate pr-4">{session.title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {session.dateLabel}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {session.startTime} – {session.endTime}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {session.room}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={toggleSave}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                saved
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {saved ? <BookmarkCheck className="w-5 h-5 sm:w-4 sm:h-4" /> : <Bookmark className="w-5 h-5 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{saved ? 'Saved to Agenda' : 'Add to My Agenda'}</span>
              <span className="sm:hidden font-semibold">{saved ? 'Saved' : 'Save'}</span>
            </button>
            {session.liveUrl && (
              <a
                href={session.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">Watch Live</span><span className="sm:hidden">Live</span>
              </a>
            )}
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-2">
            {session.topics.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 font-sans">About This Session</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{session.description}</p>
          </div>

          {/* Speakers */}
          {session.speakers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 font-sans flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Speakers
              </h3>
              <div className="space-y-2">
                {session.speakers.map(name => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {name.charAt(0)}
                    </div>
                    <span className="text-sm text-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Partners */}
          {session.knowledgePartners.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 font-sans">Knowledge Partners</h3>
              <div className="flex flex-wrap gap-2">
                {session.knowledgePartners.map(kp => (
                  <span key={kp} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">{kp}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
