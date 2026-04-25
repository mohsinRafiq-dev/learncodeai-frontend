import React from "react";
import { Flame, Calendar, Target } from "lucide-react";

const StreakTracker: React.FC<{
  streak: any;
  loading?: boolean;
}> = ({ streak, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-lg p-6 animate-pulse">
        <div className="h-40 bg-red-800/30 rounded"></div>
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  const currentStreak = streak.currentStreak || 0;
  const longestStreak = streak.longestStreak || 0;

  // Generate calendar days for the past month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Current and Best Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-lg p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-red-400" />
            <span className="text-red-200 text-sm font-semibold">Current Streak</span>
          </div>
          <div className="text-4xl font-bold text-red-400">{currentStreak}</div>
          <div className="text-xs text-red-300 mt-1">consecutive days</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl rounded-lg p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-200 text-sm font-semibold">Best Streak</span>
          </div>
          <div className="text-4xl font-bold text-yellow-400">{longestStreak}</div>
          <div className="text-xs text-yellow-300 mt-1">days</div>
        </div>
      </div>

      {/* Streak Info Card */}
      <div className="bg-red-900/30 backdrop-blur-xl rounded-lg p-6 border border-red-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-red-400" />
          Your Learning Journey
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
            <span className="text-red-100">Total Streak Days</span>
            <span className="text-2xl font-bold text-red-400">{streak.totalStreakDays || 0}</span>
          </div>

          {streak.lastActivityDate && (
            <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
              <span className="text-red-100">Last Activity</span>
              <span className="text-red-300">
                {new Date(streak.lastActivityDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {streak.streakStartDate && (
            <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
              <span className="text-red-100">Streak Started</span>
              <span className="text-red-300">
                {new Date(streak.streakStartDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Streak Rewards */}
      <div className="bg-orange-900/30 backdrop-blur-xl rounded-lg p-6 border border-orange-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">Streak Bonuses</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StreakRewardCard day={3} points={25} current={currentStreak} />
          <StreakRewardCard day={7} points={75} current={currentStreak} />
          <StreakRewardCard day={14} points={150} current={currentStreak} />
          <StreakRewardCard day={30} points={300} current={currentStreak} />
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="bg-yellow-900/30 backdrop-blur-xl rounded-lg p-6 border border-yellow-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">This Month's Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-yellow-200">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-sm ${
                day === null
                  ? ""
                  : day === today.getDate()
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "bg-yellow-900/40 text-yellow-200 border border-yellow-500/30"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <p className="text-xs text-yellow-300 mt-4">
          ℹ️ Keep your streak alive by practicing daily!
        </p>
      </div>
    </div>
  );
};

const StreakRewardCard: React.FC<{
  day: number;
  points: number;
  current: number;
}> = ({ day, points, current }) => {
  const isUnlocked = current >= day;

  return (
    <div
      className={`rounded-lg p-3 text-center border transition-all ${
        isUnlocked
          ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border-amber-500/50 shadow-lg shadow-amber-500/20"
          : "bg-orange-900/20 border-orange-500/20 opacity-50"
      }`}
    >
      <div className="text-sm font-bold text-white">{day}d</div>
      <div className={`text-2xl font-bold mt-1 ${isUnlocked ? "text-yellow-400" : "text-orange-300"}`}>
        +{points}
      </div>
      <div className="text-xs text-orange-200 mt-1">pts</div>
    </div>
  );
};

export default StreakTracker;
