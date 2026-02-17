import { memo } from "react";
import { Clock3, ExternalLink, IndianRupee, MapPin, Sparkles } from "lucide-react";
import { DelhiPlace } from "@/lib/delhi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DelhiPlaceCardProps {
  place: DelhiPlace;
}

export const DelhiPlaceCard = memo(function DelhiPlaceCard({ place }: DelhiPlaceCardProps) {
  return (
    <article className="glass-card overflow-hidden h-full flex flex-col hover:border-primary/30 transition-all animate-fade-in-up">
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-sans">{place.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{place.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <MapPin className="h-3 w-3" /> {place.area}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <Clock3 className="h-3 w-3" /> {place.timeRequired}
          </span>
          {place.bestTimeToVisit && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <Sparkles className="h-3 w-3" /> {place.bestTimeToVisit}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {place.budget && (
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> {place.budget}
            </Badge>
          )}
          {place.famousFor && <Badge variant="outline">Famous for: {place.famousFor}</Badge>}
          {place.idealFor && <Badge variant="outline">Ideal for: {place.idealFor}</Badge>}
          {place.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="pt-1 mt-auto">
          <Button asChild variant="secondary" className="w-full">
            <a href={place.mapsUrl} target="_blank" rel="noreferrer noopener" aria-label={`Open ${place.name} on Google Maps`}>
              View on Maps <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
});
