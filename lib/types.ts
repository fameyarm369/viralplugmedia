export type BusinessCategory =
  | "property"
  | "local-shop"
  | "food-honey"
  | "sports-football"
  | "fashion-apparel"
  | "consumer-product"
  | "creator-influencer"
  | "event-entertainment";

export interface ColorPalette {
  dominant: string;
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  muted: string;
  darkMuted: string;
  contrastText: string;
  accentFrame: string;
  isDarkImage: boolean;
  frameAngle?: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  fileType: "image" | "video";
  category: BusinessCategory;
  clientName: string;
  campaignHeadline: string;
  metrics?: {
    views?: string;
    roas?: string;
    conversions?: string;
    impressions?: string;
    leads?: string;
  };
  palette: ColorPalette;
  isOverridden?: boolean;
}

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface Lead {
  id: string;
  name: string;
  businessName: string;
  category: BusinessCategory;
  phone: string;
  email: string;
  budgetRange: string;
  timeline: string;
  notes?: string;
  leadScore: number;
  status: LeadStatus;
  primaryMedia?: MediaAsset;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface Campaign {
  id: string;
  title: string;
  clientName: string;
  category: BusinessCategory;
  status: "DRAFT" | "PROPOSAL_REVIEW" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
  startDate: string;
  endDate: string;
  budgetINR: number;
  metrics: {
    views: number;
    clicks: number;
    leads: number;
    roas: number;
  };
  heroMedia: MediaAsset;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  category: BusinessCategory;
  categoryLabel: string;
  heroImage: string;
  campaignHeadline: string;
  stickerText: string;
  summary: string;
  results: {
    metric: string;
    value: string;
    label: string;
  }[];
  challenge: string;
  solution: string;
  palette: ColorPalette;
}

export interface ServiceOffering {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: BusinessCategory;
  badge: string;
  description: string;
  keyFeatures: string[];
  deliverables: string[];
  heroImage: string;
  palette: ColorPalette;
  startingPrice: string;
}
