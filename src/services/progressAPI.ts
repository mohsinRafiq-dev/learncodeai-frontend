import api from "./api";

// Progress Tracking API service
export const progressAPI = {
  // Get comprehensive progress dashboard data
  getDashboard: async () => {
    const response = await api.get("/progress/dashboard");
    return response.data;
  },

  // Get performance analytics (strengths/weaknesses)
  getPerformanceAnalytics: async () => {
    const response = await api.get("/progress/analytics");
    return response.data;
  },

  // Export progress report as JSON
  exportReportJSON: async () => {
    const response = await api.get("/progress/export?format=json");
    return response.data;
  },

  // Export progress report as CSV (returns blob)
  exportReportCSV: async () => {
    const response = await api.get("/progress/export?format=csv", {
      responseType: "blob",
    });
    return response.data;
  },
};

export default progressAPI;
