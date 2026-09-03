import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { query } from "../lib/db";
import { DEFAULT_FALLBACK_PALETTE } from "../lib/palette-engine";

async function seedData() {
  console.log("Seeding initial database rows into Neon PostgreSQL...");

  // 1. Seed Media Assets
  const honeyPalette = {
    dominant: "#D97706",
    vibrant: "#F59E0B",
    darkVibrant: "#78350F",
    lightVibrant: "#FEF3C7",
    muted: "#B45309",
    darkMuted: "#451A03",
    contrastText: "#FFFFFF",
    accentFrame: "#F59E0B",
    isDarkImage: true,
    frameAngle: "-2.8deg",
  };

  const sportsPalette = {
    dominant: "#DC2626",
    vibrant: "#EF4444",
    darkVibrant: "#450A0A",
    lightVibrant: "#FEE2E2",
    muted: "#991B1B",
    darkMuted: "#1E0404",
    contrastText: "#FFFFFF",
    accentFrame: "#EF4444",
    isDarkImage: true,
    frameAngle: "3.2deg",
  };

  const propertyPalette = {
    dominant: "#0284C7",
    vibrant: "#0EA5E9",
    darkVibrant: "#0C4A6E",
    lightVibrant: "#E0F2FE",
    muted: "#0369A1",
    darkMuted: "#082F49",
    contrastText: "#FFFFFF",
    accentFrame: "#0EA5E9",
    isDarkImage: true,
    frameAngle: "-1.8deg",
  };

  const m1 = await query(
    `INSERT INTO media_assets (title, url, file_type, category, client_name, campaign_headline, metrics, palette, is_overridden)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      "Wild Forest Raw Amber Honey Jar",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=85",
      "image",
      "food-honey",
      "Vedika Organics",
      "PURE GOLD. ZERO COMPROMISE.",
      JSON.stringify({ views: "1.4M+", roas: "6.2x ROAS", conversions: "8,400+ Orders" }),
      JSON.stringify(honeyPalette),
      false,
    ]
  );

  const m2 = await query(
    `INSERT INTO media_assets (title, url, file_type, category, client_name, campaign_headline, metrics, palette, is_overridden)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      "Veebro HyperSpeed Pro Football Studs",
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=85",
      "image",
      "sports-football",
      "Veebro Athletics",
      "SPEED BEYOND MEASURE.",
      JSON.stringify({ views: "2.8M+", roas: "7.8x ROAS", conversions: "12,200+ Pairs" }),
      JSON.stringify(sportsPalette),
      false,
    ]
  );

  const m3 = await query(
    `INSERT INTO media_assets (title, url, file_type, category, client_name, campaign_headline, metrics, palette, is_overridden)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      "Skyline Panorama Luxury Suites",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      "image",
      "property",
      "Altura Living",
      "LIVE ABOVE THE ORDINARY.",
      JSON.stringify({ views: "890k+", roas: "14.5x ROAS", conversions: "32 Units Sold" }),
      JSON.stringify(propertyPalette),
      false,
    ]
  );

  const mediaRows = await query(`SELECT id, category FROM media_assets`);
  const mediaMap = new Map(mediaRows.rows.map((r: any) => [r.category, r.id]));

  // 2. Seed Homepage Verticals Showcase
  if (mediaMap.get("food-honey")) {
    await query(
      `INSERT INTO verticals (category, hero_media_id, headline, client_name, reach_stat, roas_stat, is_featured, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [
        "food-honey",
        mediaMap.get("food-honey"),
        "PURE GOLD. ZERO COMPROMISE.",
        "Vedika Organics",
        "1.4M+ Reach",
        "6.2x ROAS",
        true,
        0,
      ]
    );
  }

  if (mediaMap.get("sports-football")) {
    await query(
      `INSERT INTO verticals (category, hero_media_id, headline, client_name, reach_stat, roas_stat, is_featured, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [
        "sports-football",
        mediaMap.get("sports-football"),
        "SPEED BEYOND MEASURE.",
        "Veebro Athletics",
        "2.8M+ Reach",
        "7.8x ROAS",
        true,
        1,
      ]
    );
  }

  if (mediaMap.get("property")) {
    await query(
      `INSERT INTO verticals (category, hero_media_id, headline, client_name, reach_stat, roas_stat, is_featured, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [
        "property",
        mediaMap.get("property"),
        "LIVE ABOVE THE ORDINARY.",
        "Altura Living",
        "890k+ Reach",
        "14.5x ROAS",
        true,
        2,
      ]
    );
  }

  // 3. Seed Historical Deals for AI Grounding Context
  await query(
    `INSERT INTO historical_deals (category, budget_inr, deliverables, final_price_inr, roas_achieved, client_type, notes)
     VALUES 
     ($1, $2, $3, $4, $5, $6, $7),
     ($8, $9, $10, $11, $12, $13, $14),
     ($15, $16, $17, $18, $19, $20, $21)
     ON CONFLICT DO NOTHING`,
    [
      "food-honey",
      50000,
      JSON.stringify(["15 Video Variations", "40 Ad Posters", "Shopify Bot"]),
      65000,
      6.2,
      "D2C Organic Brand",
      "Scaled amber honey past ₹48L/mo with 6.2x ROAS.",
      "sports-football",
      75000,
      JSON.stringify(["25 Video Cuts", "50 Drop Posters", "Waitlist Funnel"]),
      95000,
      7.8,
      "Athletic Footwear",
      "Sold out 12,200 cleat pairs in 14 days.",
      "property",
      120000,
      JSON.stringify(["12 4K Walkthroughs", "HNI Targeting", "WhatsApp Bot"]),
      150000,
      14.5,
      "Luxury Real Estate",
      "32 units booked worth ₹112 Cr.",
    ]
  );

  // 4. Seed Services
  await query(
    `INSERT INTO services (slug, title, tagline, category, badge, description, key_features, deliverables, hero_image, palette, starting_price)
     VALUES 
     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
     ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
     ON CONFLICT (slug) DO NOTHING`,
    [
      "brand-growth",
      "D2C Brand & FMCG Viral Launch",
      "Explosive e-commerce sales for food, honey, apparel, and lifestyle products.",
      "food-honey",
      "MOST POPULAR",
      "High-energy comic-poster ad formats and viral UGC creator blitzes engineered to scale ROAS from 2.5x to 7x+ on Shopify and marketplaces.",
      JSON.stringify(["Comic ad creative framework", "Influencer seeding", "Funnel optimization", "Landing page tuning"]),
      JSON.stringify(["25 Video Variations", "60 Graphic Ad Assets", "Creator Management", "Real-time Tracker"]),
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85",
      JSON.stringify(honeyPalette),
      "₹65,000 / month",

      "property-promotion",
      "Property & Real Estate Blitz",
      "High-ticket room, villa, and residential development lead generation.",
      "property",
      "HIGH ROI",
      "Cinematic walkthroughs, geo-targeted HNI lead generation, and dynamic comic-poster creative ads that deliver verified site visits and buyer inquiries.",
      JSON.stringify(["Drone 4K storytelling", "Micro-targeted HNI ads", "WhatsApp visit booking bot", "Lead pipeline reports"]),
      JSON.stringify(["12 Cinematic Video Creatives", "40 High-Res Ad Posters", "WhatsApp Automation", "Media Strategist"]),
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
      JSON.stringify(propertyPalette),
      "₹45,000 / month",
    ]
  );

  // 5. Seed App Settings
  await query(
    `INSERT INTO app_settings (key, value)
     VALUES ('advance_payment_pct', '{"percentage": 20}')
     ON CONFLICT (key) DO NOTHING`
  );

  console.log("Initial database seeding completed successfully!");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
