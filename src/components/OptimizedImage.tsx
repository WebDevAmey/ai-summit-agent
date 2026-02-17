import { memo, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg"
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
      className={cn("h-full w-full object-cover", className)}
    />
  );
});
