import { useState, useEffect } from 'react';
import gamificationAPI from '../services/gamificationAPI';

const useGamification = (userId?: string) => {
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await gamificationAPI.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await gamificationAPI.getStreak();
      setStreak(response.data);
    } catch (err: any) {
      console.error('Error fetching streak:', err);
      setError(err.message || 'Failed to fetch streak');
    }
  };

  const fetchLeaderboard = async (limit = 100) => {
    try {
      const response = await gamificationAPI.getLeaderboard(limit);
      setLeaderboard(response.data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to fetch leaderboard');
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await gamificationAPI.getUserRank();
      setUserRank(response.data?.rank || response.data);
    } catch (err: any) {
      console.error('Error fetching rank:', err);
      setError(err.message || 'Failed to fetch rank');
    }
  };

  const fetchAllGamificationData = async () => {
    await Promise.all([
      fetchStats(),
      fetchStreak(),
      fetchLeaderboard(),
      fetchUserRank(),
    ]);
  };

  const refreshGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchAllGamificationData();
      console.log('✅ Gamification data refreshed successfully');
    } catch (err: any) {
      console.error('Error refreshing gamification data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const refreshStreak = async () => {
    try {
      console.log('🔄 Manually refreshing streak...');
      const response = await gamificationAPI.refreshStreak();
      setStreak(response.data);
      await fetchStats();
      console.log('✅ Streak refreshed:', response.data);
    } catch (err: any) {
      console.error('Error refreshing streak:', err);
      setError(err.message || 'Failed to refresh streak');
    }
  };

  useEffect(() => {
    fetchAllGamificationData();
  }, []);

  return {
    stats,
    streak,
    leaderboard,
    userRank,
    loading,
    error,
    refetch: fetchAllGamificationData,
    refreshGamificationData,
    refreshStreak,
    fetchStats,
    fetchStreak,
    fetchLeaderboard,
    fetchUserRank,
  };
};

export default useGamification;
