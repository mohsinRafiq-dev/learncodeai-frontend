import api from "./api";

// Gamification API service
export const gamificationAPI = {
  // Get user gamification stats
  getStats: async () => {
    const response = await api.get("/gamification/stats");
    return response.data;
  },

  // Get user rank
  getUserRank: async () => {
    const response = await api.get("/gamification/rank");
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit: number = 100, offset: number = 0) => {
    const response = await api.get("/gamification/leaderboard", {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get user streak
  getStreak: async () => {
    const response = await api.get("/gamification/streak");
    return response.data;
  },

  // Update streak
  updateStreak: async () => {
    const response = await api.put("/gamification/streak/update");
    return response.data;
  },

  // Get user badges
  getBadges: async () => {
    const response = await api.get("/gamification/badges");
    return response.data;
  },

  // Get top users
  getTopUsers: async (limit: number = 10) => {
    const response = await api.get("/gamification/top-users", {
      params: { limit },
    });
    return response.data;
  },

  // Get achievements progress
  getAchievementsProgress: async () => {
    const response = await api.get("/gamification/achievements/progress");
    return response.data;
  },

  // Add points (internal)
  addPoints: async (points: number, reason: string, relatedId?: string) => {
    const response = await api.post("/gamification/points/add", {
      points,
      reason,
      relatedId,
    });
    return response.data;
  },
};

export default gamificationAPI;
