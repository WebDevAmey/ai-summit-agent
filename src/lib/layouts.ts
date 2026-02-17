export type SummitLayoutType = "image" | "pdf";

export interface SummitLayoutItem {
  id: string;
  title: string;
  type: SummitLayoutType;
  thumbnailUrl: string;
  fileUrl: string;
  zones?: string[];
}
