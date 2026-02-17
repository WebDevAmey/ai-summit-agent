import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Navigation, SlidersHorizontal } from "lucide-react";
import { DelhiPlaceCard } from "@/components/DelhiPlaceCard";
import { Switch } from "@/components/ui/switch";
import {
  DELHI_CATEGORY_META,
  DelhiPlace,
  DelhiPlaceCategory,
  DelhiPlacesPayload,
  ExploreDelhiSort
} from "@/lib/delhi";

const PAGE_TITLE = "Explore Delhi | India AI Impact Summit 2026";
const PAGE_DESCRIPTION =
  "Discover iconic landmarks, food legends, and creative spaces while attending the AI Summit.";

export default function ExploreDelhiPage() {
  const [places, setPlaces] = useState<DelhiPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<DelhiPlaceCategory>("mustSee");
  const [sortByDistanceToggle, setSortByDistanceToggle] = useState(false);
  const [sortBy, setSortBy] = useState<ExploreDelhiSort>("popularity");
  const [venueLabel, setVenueLabel] = useState("Summit Venue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = PAGE_TITLE;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');

    descriptionTag?.setAttribute("content", PAGE_DESCRIPTION);
    ogTitle?.setAttribute("content", PAGE_TITLE);
    ogDescription?.setAttribute("content", PAGE_DESCRIPTION);
    twitterTitle?.setAttribute("content", PAGE_TITLE);
    twitterDescription?.setAttribute("content", PAGE_DESCRIPTION);
  }, []);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true);
        const res = await fetch("/data/delhi/places.json");
        if (!res.ok) {
          throw new Error("Unable to load Delhi recommendations.");
        }

        const payload = (await res.json()) as DelhiPlacesPayload;
        setPlaces(payload.places);
        setVenueLabel(`${payload.summitVenue.name} (${payload.summitVenue.area})`);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    void loadPlaces();
  }, []);

  const filteredPlaces = useMemo(
    () => places.filter((place) => place.category === activeCategory),
    [places, activeCategory]
  );

  const effectiveSort = sortByDistanceToggle ? "distance" : sortBy;

  const sortedPlaces = useMemo(() => {
    const items = [...filteredPlaces];

    items.sort((a, b) => {
      if (effectiveSort === "distance") return a.distanceFromVenueKm - b.distanceFromVenueKm;
      if (effectiveSort === "budget") return (a.budgetSortValue ?? Number.MAX_SAFE_INTEGER) - (b.budgetSortValue ?? Number.MAX_SAFE_INTEGER);
      if (effectiveSort === "time") return a.durationSortValue - b.durationSortValue;
      return (b.popularityScore ?? 0) - (a.popularityScore ?? 0);
    });

    return items;
  }, [filteredPlaces, effectiveSort]);

  const handleCategoryChange = useCallback((category: DelhiPlaceCategory) => {
    setActiveCategory(category);
  }, []);

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border/30 py-16 md:py-24">
        <div className="absolute inset-0 hero-gradient opacity-30" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">City Guide</p>
            <h1 className="mb-4 text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              Explore <span className="text-gradient">Delhi</span>
            </h1>
            <p className="mb-3 text-lg sm:text-xl text-foreground/90 font-sans">Experience the city beyond the summit</p>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Discover iconic landmarks, food legends, and creative spaces while attending the AI Summit.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-14 z-30 glass-surface border-b border-border/30 py-4 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1">
              {(Object.entries(DELHI_CATEGORY_META) as [DelhiPlaceCategory, { label: string; shortLabel: string }][]).map(
                ([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`filter-pill active:scale-95 touch-manipulation whitespace-nowrap ${
                      activeCategory === key ? "filter-pill-active" : ""
                    }`}
                    aria-pressed={activeCategory === key}
                  >
                    <span className="hidden sm:inline">{meta.label}</span>
                    <span className="sm:hidden">{meta.shortLabel}</span>
                  </button>
                )
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {sortedPlaces.length} curated pick{sortedPlaces.length !== 1 ? "s" : ""} in{" "}
                <span className="text-foreground">{DELHI_CATEGORY_META[activeCategory].shortLabel}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <label htmlFor="delhi-sort" className="text-xs sm:text-sm text-foreground">
                    Sort by
                  </label>
                  <select
                    id="delhi-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as ExploreDelhiSort)}
                    className="bg-transparent text-xs sm:text-sm text-foreground focus:outline-none"
                    aria-label="Sort places"
                    disabled={sortByDistanceToggle}
                  >
                    <option value="distance">Distance</option>
                    <option value="budget">Budget</option>
                    <option value="popularity">Popularity</option>
                    <option value="time">Time required</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/40 px-3 py-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <label htmlFor="distance-sort" className="text-xs sm:text-sm text-foreground">
                    Sort by Distance from Summit Venue
                  </label>
                  <Switch
                    id="distance-sort"
                    checked={sortByDistanceToggle}
                    onCheckedChange={setSortByDistanceToggle}
                    aria-label="Sort by distance from summit venue"
                  />
                </div>
              </div>
            </div>

            {sortByDistanceToggle && (
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Navigation className="h-3.5 w-3.5" />
                Placeholder distance logic is currently based on curated estimates from {venueLabel}.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-10">
        {loading ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Loading curated Delhi recommendations...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <SlidersHorizontal className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlaces.map((place) => (
              <DelhiPlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
