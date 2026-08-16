import api from "./api";

// The plan catalogue comes from the server, which builds it from the same
// config the Stripe prices were created from. The pricing page must never
// quote a number that differs from what the invoice says.

export interface PlanLimits {
  aiCreditsPerMonth: number;
  codeExecutionsPerDay: number;
  /** null means unlimited — Infinity does not survive JSON. */
  savedSnippets: number | null;
  quizAttemptsPerQuiz: number | null;
}

export interface PlanFeatures {
  tutorialDifficulties: string[];
  platformCoursesIncluded: boolean;
  proCatalogueIncluded: boolean;
  certificates: boolean;
  verifiedGeneration: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  key: "free" | "pro" | "lifetime";
  name: string;
  priceCents: number;
  yearlyPriceCents: number | null;
  interval: string | null;
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface PlanCatalogue {
  plans: Plan[];
  aiActionCosts: Record<string, number>;
  currency: string;
}

export interface CreditSummary {
  period: string;
  planKey: string;
  allocated: number;
  used: number;
  remaining: number;
  percentUsed: number;
  byAction: Record<string, number>;
  deniedCount: number;
  resetsAt: string;
  costs: Record<string, number>;
}

export const plansAPI = {
  getCatalogue: async (): Promise<PlanCatalogue> => {
    const res = await api.get("/billing/plans");
    return res.data.data;
  },

  getCredits: async (): Promise<CreditSummary> => {
    const res = await api.get("/billing/ai-credits");
    return res.data.data;
  },
};

export const money = (cents: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Whole-dollar prices read better without trailing zeros on a pricing page.
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

export default plansAPI;
