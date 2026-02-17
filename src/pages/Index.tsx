import { lazy, Suspense, useState, useMemo, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { TopicGrid } from "@/components/TopicGrid";
import { FilterBar } from "@/components/FilterBar";
import { SessionCard } from "@/components/SessionCard";
import { SessionDrawer } from "@/components/SessionDrawer";
import { searchSessions, getTopicStats } from "@/lib/search";
import { Session } from "@/lib/types";

const SummitLayoutsSection = lazy(() => import('@/components/SummitLayoutsSection'));

const Index = () => {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<"time" | "title" | "topics">("time");
  const [detailSession, setDetailSession] = useState<Session | null>(null);
  const [, setAgendaTick] = useState(0);

  const topicStats = useMemo(() => getTopicStats(), []);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setSelectedDay(null);
    setSelectedTimeSlot(null);
    setSelectedTopics([]);
  }, []);

  const results = useMemo(
    () => searchSessions(query, { day: selectedDay, topics: selectedTopics, timeSlot: selectedTimeSlot }, sort),
    [query, selectedDay, selectedTopics, selectedTimeSlot, sort]
  );

  return (
    <div className="min-h-screen relative z-[1] bg-transparent">
      <Hero />
      <TopicGrid topics={topicStats} selectedTopics={selectedTopics} onToggleTopic={toggleTopic} />
      <Suspense
        fallback={
          <section className="container mx-auto px-4 py-6 sm:py-8">
            <div className="glass-card p-6 text-center text-muted-foreground">Loading venue layouts...</div>
          </section>
        }
      >
        <SummitLayoutsSection />
      </Suspense>
      
      <FilterBar
        query={query}
        setQuery={setQuery}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
        selectedTopics={selectedTopics}
        sort={sort}
        setSort={setSort}
        onClearAll={clearAll}
        resultCount={results.length}
      />

      <section className="container mx-auto px-4 py-6 sm:py-8">
        {results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpenDetail={setDetailSession}
                onAgendaChange={() => setAgendaTick(t => t + 1)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-muted-foreground">No sessions match your filters.</p>
            <button 
              onClick={clearAll} 
              className="text-primary text-sm mt-2 hover:underline active:scale-95 touch-manipulation"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      <SessionDrawer session={detailSession} onClose={() => setDetailSession(null)} />
    </div>
  );
};

export default Index;
