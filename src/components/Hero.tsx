import { motion } from 'framer-motion';
import { dedupedSessions } from '@/data/sessions';
import { getTopicStats } from '@/lib/search';
import { VENUE } from '@/lib/types';

export function Hero() {
  const totalSessions = dedupedSessions.length;
  const totalSpeakers = new Set(dedupedSessions.flatMap(s => s.speakers)).size;
  const totalTopics = getTopicStats().length;

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="font-medium text-primary whitespace-nowrap">Feb 16–20, 2026</span>
            </div>
            <span className="hidden sm:inline text-primary/50">•</span>
            <span className="font-medium text-primary text-center sm:text-left">{VENUE}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 px-2">
            <span className="text-foreground">India AI </span>
            <span className="text-gradient">Impact Summit</span>
            <span className="text-foreground"> 2026</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto font-sans px-4">
            {totalSessions} Sessions. 5 Days. Discover Your Perfect Sessions.
          </p>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-10 px-4 max-w-2xl mx-auto">
            {[
              { label: 'Sessions', value: totalSessions },
              { label: 'Speakers', value: totalSpeakers },
              { label: 'Topics', value: totalTopics },
              { label: 'Days', value: 5 },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-sans">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
