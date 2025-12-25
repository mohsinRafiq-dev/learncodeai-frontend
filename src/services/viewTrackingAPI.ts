import api from "./api";

export const viewTrackingAPI = {
  // Track views
  trackTutorialView: async (tutorialId: string) => {
    try {
      const response = await api.post(`/views/tutorials/${tutorialId}/view`);
      return response.data;
    } catch (error) {
      console.error("Error tracking tutorial view:", error);
      throw error;
    }
  },

  trackCourseView: async (courseId: string) => {
    try {
      const response = await api.post(`/views/courses/${courseId}/view`);
      return response.data;
    } catch (error) {
      console.error("Error tracking course view:", error);
      throw error;
    }
  },

  // Get most viewed content
  getMostViewedTutorials: async (limit: number = 10) => {
    try {
      const response = await api.get(`/views/tutorials/most-viewed?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching most viewed tutorials:", error);
      throw error;
    }
  },

  getMostViewedCourses: async (limit: number = 10) => {
    try {
      const response = await api.get(`/views/courses/most-viewed?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching most viewed courses:", error);
      throw error;
    }
  },

  getMostViewedContent: async (limit: number = 10) => {
    try {
      const response = await api.get(`/views/most-viewed?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching most viewed content:", error);
      throw error;
    }
  },
};

export default viewTrackingAPI;

