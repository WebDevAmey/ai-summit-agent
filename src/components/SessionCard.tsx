import { Session } from '@/lib/types';
import { Calendar, Clock, MapPin, Users, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { isSessionSaved, saveSessionId, removeSessionId } from '@/lib/agenda';
import { useState, useEffect } from 'react';

interface SessionCardProps {
  session: Session;
  onOpenDetail: (session: Session) => void;
  onAgendaChange?: () => void;
}

export function SessionCard({ session, onOpenDetail, onAgendaChange }: SessionCardProps) {
  const [saved, setSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Check saved state on mount and when session changes
  useEffect(() => {
    setSaved(isSessionSaved(session.id));
  }, [session.id]);

  const toggleSave = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (saved) {
      removeSessionId(session.id);
      setSaved(false);
    } else {
      saveSessionId(session.id);
      setSaved(true);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 300);
    }
    onAgendaChange?.();
  };

  // Handle touch events separately to prevent double-firing with onClick
  const [touchHandled, setTouchHandled] = useState(false);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const lastToggle = (window as any).lastBookmarkToggle || 0;
    // Prevent double-firing: only handle if not handled in last 300ms
    if (now - lastToggle > 300) {
      (window as any).lastBookmarkToggle = now;
      setTouchHandled(true);
      setTimeout(() => setTouchHandled(false), 300);
      toggleSave(e);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // On mobile, if touch was handled, ignore click
    if (touchHandled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleSave(e);
  };

  return (
    <div
      className={`glass-card p-4 sm:p-5 hover:border-primary/30 cursor-pointer group transition-all ${
        saved ? 'border-primary/30 bg-primary/5' : ''
      }`}
      onClick={() => onOpenDetail(session)}
      onTouchStart={(e) => {
        // Prevent card click on touch if touching bookmark area
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
          return;
        }
      }}
    >
      <div className="flex justify-between items-start gap-2 sm:gap-3 mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors font-sans flex-1 min-w-0">
          {session.title}
        </h3>
        <button
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`flex-shrink-0 p-2 sm:p-1.5 rounded-lg transition-all active:scale-95 touch-manipulation z-20 relative ${
            saved 
              ? 'text-primary bg-primary/20 border border-primary/30' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent'
          } ${justSaved ? 'animate-pulse' : ''}`}
          aria-label={saved ? 'Remove from agenda' : 'Add to agenda'}
        >
          {saved ? (
            <BookmarkCheck className={`w-5 h-5 sm:w-4 sm:h-4 ${justSaved ? 'scale-125' : ''} transition-transform`} />
          ) : (
            <Bookmark className="w-5 h-5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1 flex-shrink-0">
          <Calendar className="w-3 h-3 flex-shrink-0" /> <span className="whitespace-nowrap">{session.dateLabel}</span>
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3 flex-shrink-0" /> <span className="whitespace-nowrap">{session.startTime} – {session.endTime}</span>
        </span>
        <span className="flex items-center gap-1 min-w-0">
          <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{session.room}</span>
        </span>
      </div>

      {session.speakers.length > 0 && (
        <div className="flex items-start gap-1 text-xs text-muted-foreground mb-3 min-w-0">
          <Users className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 break-words">{session.speakers.join(', ')}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-3 break-words">{session.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {session.topics.map((t) => (
          <span 
            key={t} 
            className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground"
          >
            {t}
          </span>
        ))}
        {session.liveUrl && (
          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-1">
            <ExternalLink className="w-2.5 h-2.5" /> Live
          </span>
        )}
      </div>
    </div>
  );
}
