import { listHistoricalDeals } from "./db/queries";

export interface DealEstimateResult {
  hasHistoricalData: boolean;
  category: string;
  historicalDealsCount: number;
  estimatedRangeINR: {
    min: number;
    max: number;
  } | null;
  suggestedAdvanceINR: number | null;
  advancePercentage: number;
  confidence: "HIGH" | "MEDIUM" | "PENDING_STRATEGIST_REVIEW";
  basisSummary: string;
  benchmarks?: {
    avgBudget: number;
    avgFinalPrice: number;
    avgROAS: number;
  };
}

/**
 * Calculates a grounded deal estimate explicitly based on past historical deals in PostgreSQL
 */
export async function calculateGroundedEstimate(params: {
  category: string;
  serviceType?: string;
  budgetRange: string;
  timeline?: string;
  notes?: string;
  advancePercentage?: number;
}): Promise<DealEstimateResult> {
  const deals = await listHistoricalDeals({ category: params.category });
  const advancePct = params.advancePercentage || 20;

  // STRICT CONSTRAINT: If no historical deals exist in DB, report honestly
  if (!deals || deals.length === 0) {
    return {
      hasHistoricalData: false,
      category: params.category,
      historicalDealsCount: 0,
      estimatedRangeINR: null,
      suggestedAdvanceINR: null,
      advancePercentage: advancePct,
      confidence: "PENDING_STRATEGIST_REVIEW",
      basisSummary: `No historical deal benchmarks currently exist in the database for '${params.category}'. Our strategy team will manually evaluate your requirement notes and prepare a custom proposal within 24 hours.`,
    };
  }

  // Parse numerical budget hints from budgetRange string (e.g., "₹50k-₹1.5L / mo")
  let userBudgetEstimate = 50000;
  if (params.budgetRange.includes("1.5L+")) {
    userBudgetEstimate = 150000;
  } else if (params.budgetRange.includes("50k")) {
    userBudgetEstimate = 75000;
  } else if (params.budgetRange.includes("25k")) {
    userBudgetEstimate = 35000;
  }

  const prices = deals.map((d) => Number(d.final_price_inr));
  const budgets = deals.map((d) => Number(d.budget_inr));
  const roasValues = deals.map((d) => Number(d.roas_achieved)).filter((r) => r > 0);

  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const avgBudget = Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length);
  const avgROAS = roasValues.length > 0
    ? Math.round((roasValues.reduce((a, b) => a + b, 0) / roasValues.length) * 10) / 10
    : 5.5;

  // Scale estimate using ratio of client budget to historical average budget
  const ratio = Math.max(0.6, Math.min(2.5, userBudgetEstimate / (avgBudget || 50000)));
  const scaledCenter = Math.round(avgPrice * ratio);

  const min = Math.round((scaledCenter * 0.85) / 1000) * 1000;
  const max = Math.round((scaledCenter * 1.25) / 1000) * 1000;
  const suggestedAdvance = Math.round((min * (advancePct / 100)) / 100) * 100;

  const confidence: "HIGH" | "MEDIUM" = deals.length >= 3 ? "HIGH" : "MEDIUM";

  const basisSummary = `Based on ${deals.length} verified historical deal(s) in '${params.category}' with average delivery price of ₹${avgPrice.toLocaleString("en-IN")} and historical ROAS of ${avgROAS}x.`;

  return {
    hasHistoricalData: true,
    category: params.category,
    historicalDealsCount: deals.length,
    estimatedRangeINR: { min, max },
    suggestedAdvanceINR: suggestedAdvance,
    advancePercentage: advancePct,
    confidence,
    basisSummary,
    benchmarks: {
      avgBudget,
      avgFinalPrice: avgPrice,
      avgROAS,
    },
  };
}
