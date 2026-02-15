import { Session } from '@/lib/types';
import { X, Calendar, Clock, MapPin, Users, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { isSessionSaved, saveSessionId, removeSessionId } from '@/lib/agenda';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const toggleSave = () => {
    if (saved) removeSessionId(session.id);
    else saveSessionId(session.id);
    setSaved(!saved);
  };

  return (
    <AnimatePresence>
      {session && (
        <motion.div 
          className="fixed inset-0 z-50 flex justify-end" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full sm:max-w-lg bg-card border-l border-border overflow-y-auto"
            onClick={e => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
          <motion.div 
            className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h2 
              className="text-lg font-bold font-sans text-foreground truncate pr-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {session.title}
            </motion.h2>
            <motion.button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" 
              aria-label="Close"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {session.dateLabel}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {session.startTime} – {session.endTime}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {session.room}</span>
          </div>

          {/* Actions */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={toggleSave}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                saved
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              <motion.div
                animate={saved ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                {saved ? <BookmarkCheck className="w-5 h-5 sm:w-4 sm:h-4" /> : <Bookmark className="w-5 h-5 sm:w-4 sm:h-4" />}
              </motion.div>
              <span className="hidden sm:inline">{saved ? 'Saved to Agenda' : 'Add to My Agenda'}</span>
              <span className="sm:hidden font-semibold">{saved ? 'Saved' : 'Save'}</span>
            </motion.button>
            {session.liveUrl && (
              <motion.a
                href={session.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(255, 107, 0, 0)",
                    "0 0 20px rgba(255, 107, 0, 0.5)",
                    "0 0 0px rgba(255, 107, 0, 0)"
                  ]
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
              >
                <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">Watch Live</span><span className="sm:hidden">Live</span>
              </motion.a>
            )}
          </motion.div>

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
