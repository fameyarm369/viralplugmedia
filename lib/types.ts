export type BusinessCategory =
  | "Weddings"
  | "Corporate"
  | "Festivals"
  | "Private Events"
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
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  cardBg?: string;
  textPrimary?: string;
  textSecondary?: string;
  border?: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  fileType: "image" | "video";
  category: BusinessCategory | string;
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
  category: BusinessCategory | string;
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

export type CampaignStatus =
  | "PASSIVE_REQUEST"
  | "DRAFT"
  | "PROPOSAL_REVIEW"
  | "PAYMENT_PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type TaskType =
  | "PHOTO_UPLOAD"
  | "VIDEO_UPLOAD"
  | "FILE_SUBMISSION"
  | "FORM_FILL"
  | "APPROVAL"
  | "MILESTONE";

export type StepStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";

export interface CampaignStep {
  id: string;
  campaignId: string;
  stepNumber: number;
  title: string;
  description: string;
  taskType: TaskType;
  deadline?: string;
  status: StepStatus;
  clientSubmission?: {
    files?: Array<{ name: string; url: string; type: string; size?: string }>;
    textResponse?: string;
    formData?: Record<string, any>;
    submittedAt?: string;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  campaignId?: string;
  clientId?: string;
  type: "EMAIL" | "WHATSAPP" | "SYSTEM_LOG" | "NOTE";
  sender: string;
  recipient: string;
  subject?: string;
  content: string;
  metadata?: {
    attachments?: Array<{ name: string; url: string }>;
    phone?: string;
    direction?: "INBOUND" | "OUTBOUND";
    status?: "SENT" | "DELIVERED" | "READ";
  };
  timestamp: string;
}

export interface CustomCriteria {
  id: string;
  label: string;
  value: string;
  isRequired?: boolean;
  isFulfilled?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface BudgetBreakdown {
  venueINR: number;
  creativeProductionINR: number;
  talentAndArtistINR: number;
  techAndLogisticsINR: number;
  operationsAndStaffINR: number;
  marginINR: number;
}

export interface Campaign {
  id: string;
  title: string;
  clientId?: string | null;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  category: BusinessCategory | string;
  eventType?: string;
  requestType?: string;
  status: CampaignStatus;
  cancellationReason?: string | null;
  startDate?: string;
  endDate?: string;
  eventDate?: string;
  location?: string;
  thumbnailUrl?: string;
  budgetINR: number;
  progressPct?: number;
  currentStepName?: string;
  customCriteria?: CustomCriteria[];
  teamMembers?: TeamMember[];
  budgetBreakdown?: BudgetBreakdown;
  // Database serialization aliases
  client_id?: string | null;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  event_type?: string;
  request_type?: string;
  cancellation_reason?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  event_date?: string | null;
  thumbnail_url?: string | null;
  budget_inr?: number;
  progress_pct?: number;
  current_step_name?: string | null;
  custom_criteria?: any;
  team_members?: any;
  budget_breakdown?: any;
  hero_media_id?: string | null;
  metrics: {
    views: number;
    clicks: number;
    leads: number;
    roas: number;
  };
  heroMedia?: MediaAsset;
  steps?: CampaignStep[];
  communications?: CommunicationLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role: string;
  avatar?: string;
  backgroundInfo?: {
    industry?: string;
    companySize?: string;
    description?: string;
    preferences?: string;
    socialHandle?: string;
  };
  totalEventsCount: number;
  totalSpendINR: number;
  eventsTimeline: Array<{
    campaignId: string;
    title: string;
    category: string;
    status: CampaignStatus;
    eventDate: string;
    budgetINR: number;
  }>;
  emailHistory: CommunicationLog[];
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface WorkingEmailCredential {
  id: string;
  professionalName: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EVENT_DIRECTOR" | "MEDIA_LEAD" | "STRATEGIST" | "ACCOUNT_MANAGER";
  department: "Production" | "Creative" | "Marketing" | "Client Relations" | "Operations" | "Executive";
  passwordHash?: string;
  plainTempPassword?: string;
  isActive: boolean;
  isMfaEnabled: boolean;
  failedLoginAttempts: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FestivalTheme {
  id: string;
  name: string;
  slug: string;
  festivalType: "RAKHI" | "DIWALI" | "EID" | "CHRISTMAS" | "CUSTOM";
  description: string;
  colorScheme: {
    gradient: string;
    primary: string;
    secondary: string;
    accent: string;
    textContrast: string;
  };
  elements: {
    bannerHeadline: string;
    tagline: string;
    stickerEmoji: string;
    badgeText: string;
    memeTemplates?: string[];
  };
  mediaAssets: Array<{
    id: string;
    title: string;
    url: string;
    type: "image" | "video";
  }>;
  autoExpiryDate?: string | null;
  isActive: boolean;
  isCustom?: boolean;
  createdAt: string;
}

export interface LandingPageConfig {
  hero: {
    headline: string;
    subheadline: string;
    badgeText: string;
    mediaUrls: string[];
  };
  features: Array<{
    title: string;
    description: string;
    icon: string;
    mediaUrl?: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    company: string;
    avatarUrl?: string;
    rating: number;
  }>;
  gallery: Array<{
    title: string;
    category: string;
    mediaUrl: string;
    reachStat?: string;
  }>;
  customGradients: Array<{
    name: string;
    cssGradient: string;
    stops: string[];
    angle: number;
  }>;
  savedPalettes: ColorPalette[];
  activePalette?: ColorPalette;
  activeThemeId?: string;
}

export interface LiveDashboardMetrics {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
    byCategory: Record<string, number>;
  };
  activePromotionsCount: number;
  campaignsInProgressCount: number;
  avgCompletionPct: number;
  pendingRequestsCount: number;
  cancelledCampaignsCount: number;
  cancellationsByReason: Array<{ reason: string; count: number }>;
  newClientAcquisitions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  avgCampaignValueINR: number;
  conversionRatePct: number;
  recentActivity: Array<{
    id: string;
    type: string;
    actor: string;
    description: string;
    timestamp: string;
  }>;
  urgentAlerts: Array<{
    id: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    title: string;
    message: string;
    actionUrl?: string;
  }>;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  category: BusinessCategory | string;
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
  category: BusinessCategory | string;
  badge: string;
  description: string;
  keyFeatures: string[];
  deliverables: string[];
  heroImage: string;
  palette: ColorPalette;
  startingPrice: string;
}
