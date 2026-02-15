import { motion } from 'framer-motion';
import { dedupedSessions } from '@/data/sessions';
import { getTopicStats } from '@/lib/search';
import { VENUE } from '@/lib/types';
import { Sparkles, Calendar, Users, Tag } from 'lucide-react';

export function Hero() {
  const totalSessions = dedupedSessions.length;
  const totalSpeakers = new Set(dedupedSessions.flatMap(s => s.speakers)).size;
  const totalTopics = getTopicStats().length;

  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-gray-500/10 via-gray-400/5 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-gray-400/8 via-gray-500/5 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-gray-500/3 to-transparent rounded-full blur-2xl" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(128,128,128,0.15)_1px,transparent_0)] bg-[size:32px_32px]" />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-gray-500/10 via-gray-400/10 to-gray-500/10 border border-gray-500/20 backdrop-blur-sm mb-8 group hover:border-gray-400/40 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-gray-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Feb 16–20, 2026</span>
            <span className="w-1 h-1 rounded-full bg-gray-400/50" />
            <span className="text-sm font-medium text-gray-300">{VENUE}</span>
          </motion.div>
          
          {/* Main heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 tracking-tight"
          >
            <span className="block text-foreground mb-2">India AI</span>
            <span className="block text-gradient bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Impact Summit
            </span>
            <span className="block text-foreground mt-2 text-4xl md:text-5xl lg:text-6xl font-semibold">
              2026
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-sans leading-relaxed"
          >
            <span className="font-semibold text-foreground">{totalSessions} Sessions</span>
            {' • '}
            <span className="font-semibold text-foreground">5 Days</span>
            {' • '}
            <span className="text-gradient-subtle font-medium">Discover Your Perfect Sessions</span>
          </motion.p>

          {/* Enhanced stats grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto"
          >
            {[
              { label: 'Sessions', value: totalSessions, icon: Calendar, color: 'gray' },
              { label: 'Speakers', value: totalSpeakers, icon: Users, color: 'gray-light' },
              { label: 'Topics', value: totalTopics, icon: Tag, color: 'gray' },
              { label: 'Days', value: 5, icon: Sparkles, color: 'gray-light' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="relative glass-card p-6 md:p-8 rounded-2xl border-gray-500/10 hover:border-gray-400/30 transition-all duration-300 hover:shadow-glow-gray">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${
                      stat.color === 'gray' 
                        ? 'from-gray-500/20 to-gray-600/10' 
                        : 'from-gray-400/20 to-gray-500/10'
                    } mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === 'gray' ? 'text-gray-400' : 'text-gray-300'
                      }`} />
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold font-sans mb-2 ${
                      stat.color === 'gray' ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
