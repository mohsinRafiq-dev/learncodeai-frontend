import React, { useState, useEffect } from "react";
import { Award, TrendingUp, Zap, Target } from "lucide-react";

const GamificationStats: React.FC<{
  stats: any;
  loading?: boolean;
}> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg p-6 animate-pulse">
        <div className="h-32 bg-purple-800/30 rounded"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const xpPercentage = (stats.experiencePoints / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Level and XP */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Level {stats.level}
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
            <div className="text-sm text-purple-300">Total Points</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-purple-300">Experience Progress</span>
            <span className="text-purple-400">
              {stats.experiencePoints}/{1000} XP
            </span>
          </div>
          <div className="w-full bg-purple-950/50 rounded-full h-3 overflow-hidden border border-purple-500/30">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <div className="text-xs text-purple-400">
            {stats.xpToNextLevel} XP to next level
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Points"
          value={stats.totalPoints}
          color="purple"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Courses"
          value={stats.statistics.coursesCompleted}
          color="blue"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Tutorials"
          value={stats.statistics.tutorialsCompleted}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Code Runs"
          value={stats.statistics.codeExecutions}
          color="green"
        />
      </div>

      {/* Points Breakdown */}
      <div className="bg-indigo-900/30 backdrop-blur-xl rounded-lg p-6 border border-indigo-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Points Breakdown
        </h3>
        <div className="space-y-3">
          <BreakdownRow
            label="Course Completions"
            points={stats.pointsBreakdown.courseCompletion}
            color="from-blue-500 to-blue-600"
          />
          <BreakdownRow
            label="Tutorial Completions"
            points={stats.pointsBreakdown.tutorialCompletion}
            color="from-yellow-500 to-yellow-600"
          />
          <BreakdownRow
            label="Code Executions"
            points={stats.pointsBreakdown.codeExecution}
            color="from-green-500 to-green-600"
          />
          <BreakdownRow
            label="Quiz Completions"
            points={stats.pointsBreakdown.quizCompletion}
            color="from-purple-500 to-purple-600"
          />
          <BreakdownRow
            label="Streak Bonuses"
            points={stats.pointsBreakdown.streakBonus}
            color="from-pink-500 to-pink-600"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-xl rounded-lg p-4 border`}
    >
      <div className={`text-${color}-400 mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-xs text-${color}-300`}>{label}</div>
    </div>
  );
};

const BreakdownRow: React.FC<{
  label: string;
  points: number;
  color: string;
}> = ({ label, points, color }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-indigo-100">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-24 bg-indigo-900/50 rounded-full overflow-hidden`}>
          <div
            className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
            style={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
          />
        </div>
        <span className="text-indigo-300 font-semibold w-12 text-right">{points}</span>
      </div>
    </div>
  );
};

export default GamificationStats;
