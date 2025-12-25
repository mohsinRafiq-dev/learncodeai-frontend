import api from "./api";

// Admin Tutorial API
export const adminTutorialAPI = {
  // Get all tutorials (with filters)
  getAllTutorials: async (params?: {
    page?: number;
    limit?: number;
    language?: string;
    difficulty?: string;
    search?: string;
  }) => {
    const response = await api.get("/admin/tutorials", { params });
    return response.data;
  },

  // Get single tutorial
  getTutorial: async (id: string) => {
    const response = await api.get(`/tutorials/${id}`);
    return response.data;
  },

  // Create new tutorial
  createTutorial: async (tutorialData: {
    title: string;
    description?: string;
    content: string;
    language: string;
    concept: string;
    difficulty?: string;
    codeExamples?: Array<{ code: string; explanation?: string }>;
    notes?: string[];
    tips?: string[];
    tags?: string[];
  }) => {
    const response = await api.post("/admin/tutorials", tutorialData);
    return response.data;
  },

  // Update tutorial
  updateTutorial: async (
    id: string,
    tutorialData: {
      title?: string;
      description?: string;
      content?: string;
      language?: string;
      concept?: string;
      difficulty?: string;
      codeExamples?: Array<{ code: string; explanation?: string }>;
      notes?: string[];
      tips?: string[];
      tags?: string[];
    }
  ) => {
    const response = await api.put(`/admin/tutorials/${id}`, tutorialData);
    return response.data;
  },

  // Delete tutorial
  deleteTutorial: async (id: string) => {
    const response = await api.delete(`/admin/tutorials/${id}`);
    return response.data;
  },

  // Get available languages
  getLanguages: async () => {
    const response = await api.get("/tutorials/languages");
    return response.data;
  },

  // Get concepts by language
  getConcepts: async (language: string) => {
    const response = await api.get(`/tutorials/languages/${language}/concepts`);
    return response.data;
  },
};

export default adminTutorialAPI;

