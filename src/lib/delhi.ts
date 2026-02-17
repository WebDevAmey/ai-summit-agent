export type DelhiPlaceCategory =
  | "mustSee"
  | "heritage"
  | "chill"
  | "streetFood"
  | "cafes";

export type ExploreDelhiSort = "distance" | "budget" | "popularity" | "time";

export interface DelhiPlace {
  id: string;
  name: string;
  category: DelhiPlaceCategory;
  description: string;
  area: string;
  /** Human-readable time commitment, e.g. "1–2 hrs" */
  timeRequired: string;
  /** Normalized duration (in minutes) used for sorting. */
  durationSortValue: number;
  /** Indicative budget string shown on the card, e.g. "₹200–₹500 per person". */
  budget: string;
  /** Who this place is best suited for, e.g. "Food explorers", "Solo work", "Late-night hangouts". */
  idealFor: string;
  /** Optional popularity signal derived from community recommendations. */
  popularityScore?: number;
  /** Approximate distance from summit venue, used for distance sorting. */
  distanceFromVenueKm: number;
  /** Optional numeric budget value for consistent sorting by budget. */
  budgetSortValue?: number;
  /** Additional structured hints (cuisine, vibe, etc.) are folded into tags for simplicity. */
  tags: string[];
  /** Best time window to visit, if there is a clear preference. */
  bestTimeToVisit?: string;
  /** Most famous dish/item associated with this place. */
  famousFor?: string;
  /** Deep link to open in maps. */
  mapsUrl: string;
}

export type DelhiEateryCategory = "Food" | "Cafe";

export interface DelhiEatery {
  id: string;
  name: string;
  area?: string;
  famousFor: string;
  shortDescription: string;
  category: DelhiEateryCategory;
}

export interface DelhiPlacesPayload {
  summitVenue: {
    name: string;
    area: string;
  };
  places: DelhiPlace[];
}

export const DELHI_CATEGORY_META: Record<
  DelhiPlaceCategory,
  { label: string; shortLabel: string }
> = {
  mustSee: {
    label: "Must-See Delhi Icons",
    shortLabel: "Must-See"
  },
  heritage: {
    label: "Heritage & Landmarks",
    shortLabel: "Heritage"
  },
  chill: {
    label: "Chill & Cultural Spots",
    shortLabel: "Cultural"
  },
  streetFood: {
    label: "Authentic Street Food",
    shortLabel: "Street Food"
  },
  cafes: {
    label: "Best Cafes",
    shortLabel: "Cafes"
  }
};
