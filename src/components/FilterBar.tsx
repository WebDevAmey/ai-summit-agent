import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DAY_LABELS, DayCode, TimeSlot } from '@/lib/types';

interface FilterBarProps {
  query: string;
  setQuery: (q: string) => void;
  selectedDay: string | null;
  setSelectedDay: (d: string | null) => void;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (t: string | null) => void;
  selectedTopics: string[];
  sort: 'time' | 'title' | 'topics';
  setSort: (s: 'time' | 'title' | 'topics') => void;
  onClearAll: () => void;
  resultCount: number;
}

const TIME_SLOTS: TimeSlot[] = ['Morning', 'Afternoon', 'Evening'];

export function FilterBar({
  query, setQuery,
  selectedDay, setSelectedDay,
  selectedTimeSlot, setSelectedTimeSlot,
  selectedTopics,
  sort, setSort,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  const hasFilters = query || selectedDay || selectedTimeSlot || selectedTopics.length > 0;

  return (
    <div className="sticky top-0 z-40 glass-surface border-b border-border/30 backdrop-blur-xl py-4">
      <div className="container mx-auto px-4 space-y-3">
        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sessions, speakers, topics…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              aria-label="Search sessions"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-auto w-full"
            aria-label="Sort sessions"
          >
            <option value="time">By Time</option>
            <option value="title">By Title</option>
            <option value="topics">By Topic Count</option>
          </select>
        </div>

        {/* Filter pills row */}
        <div className="flex gap-2 overflow-x-auto scroll-hidden items-center pb-1 -mx-4 px-4">
          {/* Day pills */}
          <div className="flex gap-2 items-center flex-shrink-0">
            {(Object.entries(DAY_LABELS) as [DayCode, string][]).map(([code, label], idx) => (
              <motion.button
                key={code}
                onClick={() => setSelectedDay(selectedDay === code ? null : code)}
                className={`filter-pill whitespace-nowrap flex-shrink-0 ${selectedDay === code ? 'filter-pill-active' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {label.split(', ')[0]}
              </motion.button>
            ))}
          </div>

          <div className="w-px h-6 bg-border/50 mx-1 flex-shrink-0" />

          {/* Time slot pills */}
          <div className="flex gap-2 items-center flex-shrink-0">
            {TIME_SLOTS.map((slot, idx) => (
              <motion.button
                key={slot}
                onClick={() => setSelectedTimeSlot(selectedTimeSlot === slot ? null : slot)}
                className={`filter-pill whitespace-nowrap flex-shrink-0 ${selectedTimeSlot === slot ? 'filter-pill-active' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {slot}
              </motion.button>
            ))}
          </div>

          {hasFilters && (
            <>
              <div className="w-px h-6 bg-border/50 mx-1 flex-shrink-0" />
              <motion.button 
                onClick={onClearAll} 
                className="filter-pill text-primary hover:text-primary-foreground hover:bg-primary flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                whileTap={{ scale: 0.9 }}
                transition={{ rotate: { duration: 0.3 } }}
              >
                <X className="w-3 h-3" /> Clear all
              </motion.button>
            </>
          )}
        </div>

        {/* Active topic chips + result count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex gap-2 overflow-x-auto scroll-hidden w-full sm:w-auto pb-1 px-1">
            <AnimatePresence mode="popLayout">
              {selectedTopics.map((t, idx) => (
                <motion.span 
                  key={t} 
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium whitespace-nowrap"
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -20 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {t}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <motion.span 
            className="text-xs text-muted-foreground whitespace-nowrap sm:ml-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {resultCount} session{resultCount !== 1 ? 's' : ''}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
