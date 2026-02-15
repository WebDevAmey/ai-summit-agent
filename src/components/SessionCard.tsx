import { Session } from '@/lib/types';
import { Calendar, Clock, MapPin, Users, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { isSessionSaved, saveSessionId, removeSessionId } from '@/lib/agenda';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface SessionCardProps {
  session: Session;
  onOpenDetail: (session: Session) => void;
  onAgendaChange?: () => void;
}

export function SessionCard({ session, onOpenDetail, onAgendaChange }: SessionCardProps) {
  const [saved, setSaved] = useState(isSessionSaved(session.id));
  const [justSaved, setJustSaved] = useState(false);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeSessionId(session.id);
    } else {
      saveSessionId(session.id);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 300);
    }
    setSaved(!saved);
    onAgendaChange?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.03, 
        rotateY: 5,
        rotateX: 2,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        layout: { duration: 0.3 }
      }}
      className={`glass-card p-4 sm:p-5 hover:border-primary/30 cursor-pointer group relative overflow-hidden ${
        saved ? 'border-primary/30 bg-primary/5' : ''
      }`}
      onClick={() => onOpenDetail(session)}
    >
      {/* Animated background glow on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="flex justify-between items-start gap-2 sm:gap-3 mb-3 relative z-10">
        <motion.h3 
          className="text-sm sm:text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors font-sans flex-1 min-w-0"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {session.title}
        </motion.h3>
        <motion.button
          onClick={toggleSave}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={`flex-shrink-0 p-2 sm:p-1.5 rounded-lg transition-all relative z-20 ${
            saved 
              ? 'text-primary bg-primary/20 border border-primary/30' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent'
          }`}
          aria-label={saved ? 'Remove from agenda' : 'Add to agenda'}
        >
          <motion.div
            animate={justSaved ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            {saved ? (
              <BookmarkCheck className="w-5 h-5 sm:w-4 sm:h-4" />
            ) : (
              <Bookmark className="w-5 h-5 sm:w-4 sm:h-4" />
            )}
          </motion.div>
        </motion.button>
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

      <div className="flex flex-wrap gap-1.5 relative z-10">
        {session.topics.map((t, idx) => (
          <motion.span 
            key={t} 
            className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, y: -2 }}
          >
            {t}
          </motion.span>
        ))}
        {session.liveUrl && (
          <motion.span 
            className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-1"
            whileHover={{ scale: 1.1, rotate: 5 }}
            animate={{ 
              boxShadow: [
                "0 0 0px rgba(255, 107, 0, 0)",
                "0 0 10px rgba(255, 107, 0, 0.5)",
                "0 0 0px rgba(255, 107, 0, 0)"
              ]
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { type: "spring", stiffness: 300 }
            }}
          >
            <ExternalLink className="w-2.5 h-2.5" /> Live
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
