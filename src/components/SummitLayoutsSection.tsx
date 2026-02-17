import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileUp, Minus, Plus, RefreshCw } from "lucide-react";
import { SummitLayoutCard } from "@/components/SummitLayoutCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { SummitLayoutItem } from "@/lib/layouts";
import { OptimizedImage } from "@/components/OptimizedImage";

const zoomClasses = ["scale-100", "scale-125", "scale-150", "scale-[1.75]", "scale-200"];

export default function SummitLayoutsSection() {
  const [baseLayouts, setBaseLayouts] = useState<SummitLayoutItem[]>([]);
  const [uploadedLayouts, setUploadedLayouts] = useState<SummitLayoutItem[]>([]);
  const [activeItem, setActiveItem] = useState<SummitLayoutItem | null>(null);
  const [zoomStep, setZoomStep] = useState(0);

  useEffect(() => {
    const loadLayouts = async () => {
      try {
        const res = await fetch("/data/summit-layouts.json");
        if (!res.ok) return;
        const payload = (await res.json()) as SummitLayoutItem[];
        setBaseLayouts(payload);
      } catch {
        setBaseLayouts([]);
      }
    };

    void loadLayouts();
  }, []);

  useEffect(() => {
    return () => {
      uploadedLayouts.forEach((item) => {
        if (item.fileUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.fileUrl);
        }
      });
    };
  }, [uploadedLayouts]);

  const allLayouts = useMemo(() => [...uploadedLayouts, ...baseLayouts], [uploadedLayouts, baseLayouts]);

  const onUploadLayouts: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const nextItems: SummitLayoutItem[] = files.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      const isPdf = file.type === "application/pdf";
      return {
        id: `upload-${file.name}-${file.lastModified}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        type: isPdf ? "pdf" : "image",
        thumbnailUrl: isPdf ? "/placeholder.svg" : objectUrl,
        fileUrl: objectUrl,
        zones: ["Tag zones placeholder"]
      };
    });

    setUploadedLayouts((prev) => [...nextItems, ...prev]);
    event.target.value = "";
  }, []);

  const handleOpen = useCallback((item: SummitLayoutItem) => {
    setActiveItem(item);
    setZoomStep(0);
  }, []);

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Summit Venue <span className="text-gradient">Layouts</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Navigate the Summit Like a Pro</p>
        </div>

        <div className="glass-surface border border-border/30 p-4 rounded-xl mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <label
              htmlFor="layout-upload"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
            >
              <FileUp className="h-4 w-4" />
              Upload Layouts (Image/PDF)
            </label>
            <input
              id="layout-upload"
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="sr-only"
              onChange={onUploadLayouts}
            />

            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm" disabled={!allLayouts.length}>
                <a href={allLayouts[0]?.fileUrl ?? "#"} download>
                  <Download className="h-4 w-4" /> Download Layout
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {allLayouts.map((item) => (
            <SummitLayoutCard key={item.id} item={item} onOpen={handleOpen} />
          ))}
        </div>
      </div>

      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-4 sm:p-6">
          {activeItem && (
            <>
              <DialogHeader>
                <DialogTitle>{activeItem.title}</DialogTitle>
                <DialogDescription>Use zoom controls for detailed view and zone orientation.</DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Zoom out"
                  onClick={() => setZoomStep((prev) => Math.max(0, prev - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Reset zoom"
                  onClick={() => setZoomStep(0)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Zoom in"
                  onClick={() => setZoomStep((prev) => Math.min(zoomClasses.length - 1, prev + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg border border-border/40 bg-secondary/30 p-2 overflow-auto max-h-[70vh]">
                {activeItem.type === "pdf" ? (
                  <iframe title={activeItem.title} src={activeItem.fileUrl} className="w-full h-[60vh] rounded-md" />
                ) : (
                  <div className={`transition-transform duration-200 origin-top ${zoomClasses[zoomStep]}`}>
                    <OptimizedImage
                      src={activeItem.fileUrl}
                      alt={`${activeItem.title} detailed layout`}
                      fallbackSrc="/placeholder.svg"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
