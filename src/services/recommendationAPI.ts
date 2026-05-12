import api from "./api";

export interface RecommendedCourse {
  _id: string;
  title: string;
  language: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  shortDescription: string;
  estimatedHours?: number;
  reason: string;
}

export interface RecommendedTutorial {
  _id: string;
  title: string;
  language: string;
  category?: string;
  difficulty?: string;
  description?: string;
  reason: string;
}

export interface ContinueCourse {
  _id: string;
  title: string;
  language: string;
  difficulty: string;
  overallProgress: number;
  reason: string;
}

export interface Recommendations {
  continueCourses: ContinueCourse[];
  recommendedCourses: RecommendedCourse[];
  recommendedTutorials: RecommendedTutorial[];
}

const recommendationAPI = {
  getRecommendations: async (): Promise<Recommendations> => {
    const response = await api.get("/recommendations");
    return response.data.data;
  },
};

export default recommendationAPI;
