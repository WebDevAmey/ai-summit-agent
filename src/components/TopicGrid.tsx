import { TopicInfo } from '@/lib/types';

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
          {topics.map((topic) => {
            const isActive = selectedTopics.includes(topic.name);
            return (
              <button
                key={topic.name}
                onClick={() => onToggleTopic(topic.name)}
                className={`
                  relative p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 group cursor-pointer flex flex-col overflow-hidden active:scale-95 touch-manipulation
                  ${isActive 
                    ? 'glass-card glow-border' 
                    : 'glass-surface hover:bg-card/60'
                  }
                `}
              >
                <div className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br ${topic.color} opacity-50`} />
                <div className="relative z-10 flex flex-col h-full">
                  <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block text-center">
                    {topic.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground block leading-tight line-clamp-2 text-center mb-auto">{topic.name}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block text-center">
                    {topic.count} sessions
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
