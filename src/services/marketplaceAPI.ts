import api from "./api";

export interface MarketplaceCourse {
  _id: string;
  title: string;
  shortDescription?: string;
  language: string;
  category: string;
  difficulty: string;
  thumbnail?: string | null;
  priceCents: number;
  includedInPro: boolean;
  ownership: "platform" | "marketplace";
  estimatedHours?: number;
  totalLessons?: number;
  enrollmentCount?: number;
  averageRating?: number;
  ratingCount?: number;
  salesCount?: number;
  publishedAt?: string;
  tags?: string[];
  instructor?: { _id: string; name: string; profilePicture?: string };
  /** Precomputed server-side so a card renders one unambiguous state. */
  access: {
    owned: boolean;
    coveredByPro: boolean;
    isFree: boolean;
    canOpen: boolean;
    requiresPurchase: boolean;
  };
}

export interface BrowseFilters {
  language?: string;
  category?: string;
  difficulty?: string;
  search?: string;
  price?: "free" | "paid" | "included";
  sort?: "popular" | "newest" | "rating" | "price_low" | "price_high";
  page?: number;
  limit?: number;
}

export const marketplaceAPI = {
  browse: async (filters: BrowseFilters = {}) => {
    const res = await api.get("/marketplace", { params: filters });
    return res.data.data as {
      courses: MarketplaceCourse[];
      pagination: { page: number; pages: number; total: number };
    };
  },

  getCourse: async (courseId: string) => {
    const res = await api.get(`/marketplace/${courseId}`);
    return res.data.data;
  },

  getFilters: async () => {
    const res = await api.get("/marketplace/meta/filters");
    return res.data.data as {
      languages: { value: string; count: number }[];
      categories: { value: string; count: number }[];
      priceRange: { min: number; max: number };
    };
  },

  /** Starts Stripe Checkout for a single course. Navigate to the returned URL. */
  buy: async (courseId: string): Promise<string> => {
    const res = await api.post(`/billing/courses/${courseId}/checkout`);
    return res.data.data.url;
  },
};

export default marketplaceAPI;
