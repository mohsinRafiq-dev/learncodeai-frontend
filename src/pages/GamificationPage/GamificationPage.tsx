import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useGamification from "../../hooks/useGamification";
import GamificationStats from "../../components/Gamification/GamificationStats";
import BadgesShowcase from "../../components/Gamification/BadgesShowcase";
import StreakTracker from "../../components/Gamification/StreakTracker";
import Leaderboard from "../../components/Gamification/Leaderboard";
import { Award, Trophy, Flame, BarChart3, RefreshCw } from "lucide-react";

const GamificationPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { stats, streak, leaderboard, userRank, loading, error, refreshGamificationData } =
    useGamification();
  const [activeTab, setActiveTab] = useState<
    "overview" | "badges" | "streaks" | "leaderboard"
  >("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isAuthenticated) {
    navigate("/signin");
    return null;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "badges", label: "Badges", icon: Trophy },
    { id: "streaks", label: "Streaks", icon: Flame },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshGamificationData();
      console.log('✅ Dashboard refreshed');
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">
                Gamification Dashboard
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white rounded-lg transition-all"
              title="Refresh gamification data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-purple-200">
            Track your progress, earn badges, and compete on the leaderboard
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-purple-900/30 text-purple-200 hover:bg-purple-900/50 border border-purple-500/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-200 mt-4">Loading your gamification data...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-200 font-semibold">Error loading gamification data</p>
            <p className="text-red-300 text-sm mt-2">{error}</p>
            <p className="text-red-300 text-xs mt-3">Make sure you're logged in and the backend server is running at http://localhost:5000</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
        <div>
          {activeTab === "overview" && (
            <GamificationStats stats={stats} loading={loading} />
          )}

          {activeTab === "badges" && (
            <BadgesShowcase
              badges={stats?.badges || []}
              achievements={stats?.achievements || []}
              loading={loading}
            />
          )}

          {activeTab === "streaks" && (
            <StreakTracker streak={streak} loading={loading} />
          )}

          {activeTab === "leaderboard" && (
            <Leaderboard
              leaderboard={leaderboard}
              userRank={userRank}
              loading={loading}
            />
          )}
        </div>
        )}

        {/* Quick Stats */}
        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <QuickStatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Global Rank"
              value={`#${userRank || "N/A"}`}
              color="from-yellow-500 to-orange-500"
            />
            <QuickStatCard
              icon={<Flame className="w-6 h-6" />}
              label="Current Streak"
              value={`${streak?.currentStreak || 0} days`}
              color="from-red-500 to-pink-500"
            />
            <QuickStatCard
              icon={<Award className="w-6 h-6" />}
              label="Badges Earned"
              value={`${stats.badges?.length || 0}/10`}
              color="from-purple-500 to-pink-500"
            />
            <QuickStatCard
              icon={<BarChart3 className="w-6 h-6" />}
              label="Level"
              value={`${stats.level}`}
              color="from-blue-500 to-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const QuickStatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => {
  return (
    <div
      className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-xl rounded-lg p-4 border border-white/10`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-sm text-white/70">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
};

export default GamificationPage;
