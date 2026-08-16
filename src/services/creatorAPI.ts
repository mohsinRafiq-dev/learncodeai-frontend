import api from "./api";

// Types mirror the backend models. Money is always integer cents — never a
// float — matching config/monetization.js on the server.

export type CreatorStatus = "none" | "pending" | "approved" | "rejected" | "suspended";

export type CourseStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "suspended";

export type CourseAction =
  | "submit"
  | "withdraw"
  | "publish"
  | "unpublish"
  | "approve"
  | "reject"
  | "suspend"
  | "reinstate";

export interface CreatorApplication {
  displayName: string;
  headline?: string;
  bio?: string;
  expertise?: string[];
  portfolioUrls?: string[];
  payoutCountry: string;
  motivation?: string;
  submittedAt?: string;
}

export interface CreatorProfile {
  _id?: string;
  status: CreatorStatus;
  canApply?: boolean;
  application?: CreatorApplication;
  review?: { reviewedAt?: string; reason?: string | null };
  platformFeeBps?: number;
  stripeAccountId?: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirementsDue?: string[];
  canSellPaidCourses?: boolean;
  canPublishFreeCourses?: boolean;
  /** One actionable sentence explaining what blocks selling, or null. */
  paidPublishBlocker?: string | null;
  stats?: {
    publishedCourses: number;
    totalSales: number;
    grossRevenueCents: number;
    netEarningsCents: number;
    paidOutCents: number;
    totalStudents: number;
    averageRating: number;
  };
}

export interface SaleSplit {
  grossCents: number;
  platformFeeCents: number;
  creatorEarningsCents: number;
  feeBps: number;
}

export interface CreatorCourse {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  language: string;
  category: string;
  difficulty: string;
  thumbnail?: string | null;
  status: CourseStatus;
  priceCents: number;
  includedInPro: boolean;
  proOptOutEffectiveAt?: string | null;
  salesCount: number;
  grossRevenueCents: number;
  enrollmentCount: number;
  averageRating: number;
  reviewNotes?: string | null;
  submittedAt?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  /** Computed server-side from the lifecycle state machine. */
  availableActions: CourseAction[];
  earningsPreview?: SaleSplit | null;
}

export interface Balance {
  pendingCents: number;
  availableCents: number;
  paidOutCents: number;
  lifetimeCents: number;
  withdrawableCents?: number;
  pendingPayoutCents?: number;
}

export interface LedgerEntry {
  _id: string;
  type: "sale" | "refund" | "pool_payout" | "payout" | "payout_reversal" | "adjustment";
  amountCents: number;
  description?: string;
  course?: { _id: string; title: string } | null;
  availableAt?: string | null;
  createdAt: string;
}

export interface Payout {
  _id: string;
  amountCents: number;
  status: "requested" | "approved" | "processing" | "paid" | "failed" | "cancelled";
  createdAt: string;
  paidAt?: string | null;
  failureReason?: string | null;
}

export interface PayoutStatus {
  onboarded: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  blocker: string | null;
  balance: Balance;
  minimumPayoutCents: number;
  canRequestPayout: boolean;
}

export interface Readiness {
  valid: boolean;
  problems: string[];
}

export interface CourseSection {
  _id: string;
  course: string;
  title: string;
  description?: string;
  order: number;
  lessons?: string[];
  estimatedHours?: number;
}

export interface CodeExample {
  title?: string;
  description?: string;
  code: string;
  input?: string;
  expectedOutput?: string;
  order?: number;
}

export interface CourseLesson {
  _id: string;
  section: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  duration?: number;
  difficulty?: string;
  videoUrl?: string;
  codeExamples?: CodeExample[];
}

export interface LessonPayload {
  title: string;
  description?: string;
  content?: string;
  duration?: number;
  difficulty?: string;
  codeExamples?: CodeExample[];
}

export const creatorAPI = {
  // ---- Application ----
  apply: async (application: CreatorApplication) => {
    const res = await api.post("/creator/apply", application);
    return res.data;
  },

  getProfile: async (): Promise<CreatorProfile> => {
    const res = await api.get("/creator/me");
    return res.data.data;
  },

  getDashboard: async () => {
    const res = await api.get("/creator/dashboard");
    return res.data.data;
  },

  getEarnings: async (page = 1, limit = 25) => {
    const res = await api.get("/creator/earnings", { params: { page, limit } });
    return res.data.data as {
      entries: LedgerEntry[];
      balance: Balance;
      pagination: { page: number; pages: number; total: number };
    };
  },

  // ---- Courses ----
  listCourses: async (status?: string) => {
    const res = await api.get("/creator/courses", { params: status ? { status } : {} });
    return res.data.data as {
      courses: CreatorCourse[];
      counts: Record<string, number>;
    };
  },

  createCourse: async (payload: {
    title: string;
    language: string;
    category: string;
    difficulty?: string;
    description?: string;
    shortDescription?: string;
  }) => {
    const res = await api.post("/creator/courses", payload);
    return res.data.data as CreatorCourse;
  },

  updateCourse: async (courseId: string, payload: Partial<CreatorCourse>) => {
    const res = await api.patch(`/creator/courses/${courseId}`, payload);
    return res.data.data as CreatorCourse;
  },

  setPricing: async (
    courseId: string,
    payload: { priceCents?: number; includedInPro?: boolean }
  ) => {
    const res = await api.patch(`/creator/courses/${courseId}/pricing`, payload);
    return res.data.data as { course: CreatorCourse; split: SaleSplit | null };
  },

  getReadiness: async (courseId: string): Promise<Readiness> => {
    const res = await api.get(`/creator/courses/${courseId}/readiness`);
    return res.data.data;
  },

  /**
   * Run a lifecycle transition. Rejects with { message, problems } when the
   * course is not ready, so the caller can list what is missing.
   */
  runAction: async (courseId: string, action: CourseAction) => {
    const res = await api.post(`/creator/courses/${courseId}/${action}`);
    return res.data.data as { course: CreatorCourse; availableActions: CourseAction[] };
  },

  deleteCourse: async (courseId: string) => {
    const res = await api.delete(`/creator/courses/${courseId}`);
    return res.data;
  },

  getCourseSales: async (courseId: string) => {
    const res = await api.get(`/creator/courses/${courseId}/sales`);
    return res.data.data;
  },

  // ---- Content authoring ----
  // Reuses the same handlers the admin portal calls; they enforce ownership
  // themselves, so a creator can only ever touch their own course.
  listSections: async (courseId: string) => {
    const res = await api.get(`/creator/courses/${courseId}/sections`);
    return (res.data.data ?? res.data) as CourseSection[];
  },

  addSection: async (courseId: string, payload: { title: string; description?: string }) => {
    const res = await api.post(`/creator/courses/${courseId}/sections`, payload);
    return res.data.data ?? res.data;
  },

  updateSection: async (sectionId: string, payload: { title?: string; description?: string }) => {
    const res = await api.put(`/creator/courses/sections/${sectionId}`, payload);
    return res.data.data ?? res.data;
  },

  deleteSection: async (sectionId: string) => {
    const res = await api.delete(`/creator/courses/sections/${sectionId}`);
    return res.data;
  },

  listLessons: async (sectionId: string) => {
    const res = await api.get(`/creator/courses/sections/${sectionId}/lessons`);
    return (res.data.data ?? res.data) as CourseLesson[];
  },

  addLesson: async (sectionId: string, payload: LessonPayload) => {
    const res = await api.post(`/creator/courses/sections/${sectionId}/lessons`, payload);
    return res.data.data ?? res.data;
  },

  updateLesson: async (lessonId: string, payload: Partial<LessonPayload>) => {
    const res = await api.put(`/creator/courses/lessons/${lessonId}`, payload);
    return res.data.data ?? res.data;
  },

  deleteLesson: async (lessonId: string) => {
    const res = await api.delete(`/creator/courses/lessons/${lessonId}`);
    return res.data;
  },

  // ---- Payouts ----
  getPayoutStatus: async (): Promise<PayoutStatus> => {
    const res = await api.get("/creator/payouts/status");
    return res.data.data;
  },

  /** Returns a single-use Stripe onboarding URL; navigate to it immediately. */
  startOnboarding: async (): Promise<string> => {
    const res = await api.post("/creator/payouts/onboard");
    return res.data.data.url;
  },

  getDashboardLink: async (): Promise<string> => {
    const res = await api.get("/creator/payouts/dashboard-link");
    return res.data.data.url;
  },

  requestPayout: async (amountCents?: number) => {
    const res = await api.post("/creator/payouts/request", { amountCents });
    return res.data.data as Payout;
  },

  listPayouts: async () => {
    const res = await api.get("/creator/payouts");
    return res.data.data as Payout[];
  },
};

/** Cents to a display string. Kept here so every surface formats identically. */
export const money = (cents?: number | null): string =>
  cents == null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        cents / 100
      );

export default creatorAPI;
