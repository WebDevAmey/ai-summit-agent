import { memo } from "react";
import { MapPin } from "lucide-react";
import { DelhiEatery } from "@/lib/delhi";
import { Badge } from "@/components/ui/badge";

interface DelhiEateryCardProps {
  place: DelhiEatery;
}

export const DelhiEateryCard = memo(function DelhiEateryCard({ place }: DelhiEateryCardProps) {
  return (
    <article className="glass-card overflow-hidden h-full flex flex-col hover:border-primary/30 transition-all animate-fade-in-up">
      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground font-sans">{place.name}</h3>
          {place.area && (
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{place.area}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
          <Badge variant="secondary">{place.category === "Cafe" ? "Cafe" : "Food"}</Badge>
          <Badge variant="outline">Famous for: {place.famousFor}</Badge>
        </div>

        <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2">{place.shortDescription}</p>
      </div>
    </article>
  );
});


