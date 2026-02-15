import { TopicInfo } from '@/lib/types';
import { motion } from 'framer-motion';

interface TopicGridProps {
  topics: TopicInfo[];
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
}

export function TopicGrid({ topics, selectedTopics, onToggleTopic }: TopicGridProps) {
  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Explore by <span className="text-gradient">Topic</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {topics.map((topic, i) => {
            const isActive = selectedTopics.includes(topic.name);
            return (
              <motion.button
                key={topic.name}
                initial={{ opacity: 0, y: 20, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: i * 0.03,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, -5, 0],
                  y: -5,
                  transition: { 
                    rotate: { duration: 0.5 },
                    scale: { type: "spring", stiffness: 400 }
                  }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleTopic(topic.name)}
                className={`
                  relative p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 group cursor-pointer flex flex-col overflow-hidden
                  ${isActive 
                    ? 'glass-card glow-border' 
                    : 'glass-surface hover:bg-card/60'
                  }
                `}
              >
                {/* Animated background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br ${topic.color} opacity-50`}
                  animate={isActive ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.7, 0.5]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative z-10 flex flex-col h-full">
                  <motion.span 
                    className="text-xl sm:text-2xl mb-1 sm:mb-2 block text-center"
                    whileHover={{ 
                      scale: 1.3,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { rotate: { duration: 0.5 } }
                    }}
                  >
                    {topic.icon}
                  </motion.span>
                  <span className="text-xs sm:text-sm font-medium text-foreground block leading-tight line-clamp-2 text-center mb-auto">{topic.name}</span>
                  <motion.span 
                    className="text-[10px] sm:text-xs text-muted-foreground mt-1 block text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 + 0.2 }}
                  >
                    {topic.count} sessions
                  </motion.span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
