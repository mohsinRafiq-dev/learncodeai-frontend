import api from "./api";

// Tutorial API for regular users
export const tutorialAPI = {
  // Create a new tutorial (for AI generation or user-created)
  createTutorial: async (tutorialData: {
    title?: string;
    description?: string;
    content?: string;
    language: string;
    concept: string;
    difficulty?: string;
    codeExamples?: Array<{ code: string; explanation?: string }>;
    notes?: string[];
    tips?: string[];
    tags?: string[];
  }) => {
    const response = await api.post("/tutorials/create", tutorialData);
    return response.data;
  },

  // Get all tutorials
  getAllTutorials: async (params?: {
    language?: string;
    difficulty?: string;
    concept?: string;
  }) => {
    const response = await api.get("/tutorials", { params });
    return response.data;
  },

  // Get tutorial by ID
  getTutorialById: async (id: string) => {
    const response = await api.get(`/tutorials/${id}`);
    return response.data;
  },

  // Get tutorials by language
  getTutorialsByLanguage: async (language: string, difficulty?: string) => {
    const params = difficulty ? { difficulty } : undefined;
    const response = await api.get(`/tutorials/language/${language}`, { params });
    return response.data;
  },

  // Get concepts by language
  getConceptsByLanguage: async (language: string) => {
    const response = await api.get(`/tutorials/concepts/${language}`);
    return response.data;
  },

  // Save tutorial
  saveTutorial: async (tutorialId: string) => {
    const response = await api.post("/tutorials/save", { tutorialId });
    return response.data;
  },

  // Get saved tutorials
  getSavedTutorials: async (language?: string) => {
    const params = language ? { language } : undefined;
    const response = await api.get("/tutorials/user/saved", { params });
    return response.data;
  },

  // Unsave tutorial
  unsaveTutorial: async (tutorialId: string) => {
    const response = await api.delete(`/tutorials/saved/${tutorialId}`);
    return response.data;
  },

  // Update tutorial progress
  updateTutorialProgress: async (tutorialId: string, completed: boolean, notes?: string) => {
    const response = await api.put(`/tutorials/progress/${tutorialId}`, { completed, notes });
    return response.data;
  },

  // Get user's created tutorials (AI-generated or custom)
  getUserCreatedTutorials: async () => {
    const response = await api.get("/tutorials/user/created");
    return response.data;
  },

  // Delete user's own tutorial
  deleteUserTutorial: async (tutorialId: string) => {
    const response = await api.delete(`/tutorials/user/created/${tutorialId}`);
    return response.data;
  },
};

export default tutorialAPI;

