import { memo } from "react";
import { Download, Expand, FileText } from "lucide-react";
import { SummitLayoutItem } from "@/lib/layouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";

interface SummitLayoutCardProps {
  item: SummitLayoutItem;
  onOpen: (item: SummitLayoutItem) => void;
}

export const SummitLayoutCard = memo(function SummitLayoutCard({ item, onOpen }: SummitLayoutCardProps) {
  const isPdf = item.type === "pdf";

  return (
    <article className="glass-card overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden">
        {isPdf ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10 text-primary" />
            <span className="text-xs">PDF Layout</span>
          </div>
        ) : (
          <OptimizedImage
            src={item.thumbnailUrl}
            alt={`${item.title} layout`}
            fallbackSrc="/placeholder.svg"
            className="transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
        <div className="flex flex-wrap gap-2">
          {(item.zones ?? []).slice(0, 3).map((zone) => (
            <Badge key={zone} variant="secondary">
              {zone}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpen(item)}>
            <Expand className="h-4 w-4" /> Preview
          </Button>
          <Button asChild variant="secondary" size="icon" aria-label={`Download ${item.title}`}>
            <a href={item.fileUrl} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
});
