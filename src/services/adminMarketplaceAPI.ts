import api from "./api";
import type { CourseStatus } from "./creatorAPI";

// Admin-side marketplace: creator applications and course review.

export interface CreatorApplicationRow {
  _id: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  user: { _id: string; name: string; email: string; profilePicture?: string; createdAt: string };
  application: {
    displayName: string;
    headline?: string;
    bio?: string;
    expertise?: string[];
    portfolioUrls?: string[];
    payoutCountry?: string;
    motivation?: string;
    submittedAt?: string;
  };
  review?: { reviewedBy?: { name: string }; reviewedAt?: string; reason?: string | null };
  platformFeeBps: number;
  payoutsEnabled: boolean;
  stats?: { totalSales: number; netEarningsCents: number; publishedCourses: number };
  createdAt: string;
}

export interface ReviewCourseRow {
  _id: string;
  title: string;
  shortDescription?: string;
  language: string;
  difficulty: string;
  status: CourseStatus;
  priceCents: number;
  includedInPro: boolean;
  submittedAt?: string;
  instructor: { _id: string; name: string; email: string };
}

export interface CodeVerificationResult {
  total: number;
  passed: number;
  failed: number;
  unjudged: number;
  passRate: number | null;
  recommendation: string;
  results: Array<{
    lesson: string;
    exampleIndex: number;
    title: string;
    verdict: string;
    ok: boolean;
    diagnostic: string | null;
  }>;
}

export const adminMarketplaceAPI = {
  // ---- Creator applications ----
  listApplications: async (status = "pending", page = 1) => {
    const res = await api.get("/admin/creators", { params: { status, page } });
    return res.data.data as {
      applications: CreatorApplicationRow[];
      counts: Record<string, number>;
      pagination: { page: number; pages: number; total: number };
    };
  },

  getApplication: async (id: string) => {
    const res = await api.get(`/admin/creators/${id}`);
    return res.data.data as CreatorApplicationRow & {
      context: { courseCount: number; orderSummary: any };
    };
  },

  decideApplication: async (
    id: string,
    decision: "approve" | "reject",
    reason?: string,
    platformFeeBps?: number
  ) => {
    const res = await api.patch(`/admin/creators/${id}/decision`, {
      decision,
      reason,
      platformFeeBps,
    });
    return res.data;
  },

  setSuspension: async (id: string, suspend: boolean, reason?: string) => {
    const res = await api.patch(`/admin/creators/${id}/suspend`, { suspend, reason });
    return res.data;
  },

  // ---- Course review ----
  getReviewQueue: async (page = 1) => {
    const res = await api.get("/admin/course-review", { params: { page } });
    return res.data.data as {
      courses: ReviewCourseRow[];
      counts: Record<string, number>;
      pagination: { page: number; pages: number; total: number };
    };
  },

  getCourseForReview: async (courseId: string) => {
    const res = await api.get(`/admin/course-review/${courseId}`);
    return res.data.data;
  },

  /** Executes every code example in the course through the sandbox. */
  verifyCourseCode: async (courseId: string) => {
    const res = await api.post(`/admin/course-review/${courseId}/verify-code`);
    return res.data.data as CodeVerificationResult;
  },

  decideCourse: async (
    courseId: string,
    action: "approve" | "reject" | "suspend" | "reinstate",
    reason?: string
  ) => {
    const res = await api.post(`/admin/course-review/${courseId}/${action}`, { reason });
    return res.data;
  },
};

export default adminMarketplaceAPI;
