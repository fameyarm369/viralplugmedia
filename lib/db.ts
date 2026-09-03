import { BusinessCategory, CaseStudy, Lead, MediaAsset, ServiceOffering } from "./types";
import { query } from "./db/index";
export * from "./db/index";
export * from "./db/queries";

/**
 * Clean data layer connected directly to PostgreSQL 17.
 * Hardcoded mock arrays have been deprecated and replaced with real database queries.
 */
