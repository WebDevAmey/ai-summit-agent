type CachedImage = {
  url: string;
  expiresAt: number;
};

interface ResolveImageArgs {
  query: string;
  fallbackUrl: string;
}

const CACHE_PREFIX = "ai-summit-image-cache:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const memoryCache = new Map<string, CachedImage>();

function getCacheKey(query: string) {
  return `${CACHE_PREFIX}${query.toLowerCase().trim()}`;
}

function readStorageCache(key: string): CachedImage | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedImage;
    if (!parsed.url || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorageCache(key: string, value: CachedImage) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors.
  }
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
  if (!accessKey) return null;

  const endpoint = new URL("https://api.unsplash.com/search/photos");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("per_page", "1");
  endpoint.searchParams.set("orientation", "landscape");
  endpoint.searchParams.set("content_filter", "high");

  const response = await fetch(endpoint.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`
    }
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    results?: Array<{
      urls?: {
        regular?: string;
      };
    }>;
  };

  return data.results?.[0]?.urls?.regular ?? null;
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;
  if (!apiKey) return null;

  const endpoint = new URL("https://api.pexels.com/v1/search");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("per_page", "1");
  endpoint.searchParams.set("orientation", "landscape");

  const response = await fetch(endpoint.toString(), {
    headers: {
      Authorization: apiKey
    }
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    photos?: Array<{
      src?: {
        large?: string;
      };
    }>;
  };

  return data.photos?.[0]?.src?.large ?? null;
}

export async function resolveDynamicImage({ query, fallbackUrl }: ResolveImageArgs): Promise<string> {
  const normalizedQuery = query.toLowerCase().trim();
  const key = getCacheKey(normalizedQuery);

  const memory = memoryCache.get(key);
  if (memory && memory.expiresAt > Date.now()) {
    return memory.url;
  }

  const storage = readStorageCache(key);
  if (storage) {
    memoryCache.set(key, storage);
    return storage.url;
  }

  const enableDynamic = import.meta.env.VITE_ENABLE_DYNAMIC_IMAGES === "true";
  if (!enableDynamic) return fallbackUrl;

  try {
    const unsplashImage = await fetchUnsplashImage(normalizedQuery);
    const pexelsImage = unsplashImage ? null : await fetchPexelsImage(normalizedQuery);
    const resolved = unsplashImage ?? pexelsImage ?? fallbackUrl;

    const cachedValue: CachedImage = {
      url: resolved,
      expiresAt: Date.now() + CACHE_TTL_MS
    };

    memoryCache.set(key, cachedValue);
    writeStorageCache(key, cachedValue);
    return resolved;
  } catch {
    return fallbackUrl;
  }
}
