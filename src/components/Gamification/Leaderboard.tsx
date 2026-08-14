import React, { useState } from "react";
import { Trophy, Medal } from "lucide-react";

const Leaderboard: React.FC<{
  leaderboard: any[];
  // null is the "loaded but unranked" state the hook reports; undefined is
  // "not loaded yet". Both render the same, but the prop must accept each.
  userRank?: number | null;
  loading?: boolean;
}> = ({ leaderboard = [], userRank, loading = false }) => {
  const [displayLimit, setDisplayLimit] = useState(10);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-lg p-6 animate-pulse">
        <div className="h-64 bg-blue-800/30 rounded"></div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-lg p-6 border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Global Leaderboard
        </h2>
        <p className="text-blue-200 text-sm mt-1">
          Top learners by total points earned
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="md:order-1">
              <LeaderboardPodiumCard
                rank={2}
                user={topThree[1].user}
                points={topThree[1].totalPoints}
                isHighlight={userRank === 2}
              />
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="md:order-0">
              <LeaderboardPodiumCard
                rank={1}
                user={topThree[0].user}
                points={topThree[0].totalPoints}
                isHighlight={userRank === 1}
                isPrimary
              />
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="md:order-2">
              <LeaderboardPodiumCard
                rank={3}
                user={topThree[2].user}
                points={topThree[2].totalPoints}
                isHighlight={userRank === 3}
              />
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-indigo-900/30 backdrop-blur-xl rounded-lg border border-indigo-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-900/50 border-b border-indigo-500/30">
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-200">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-200">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-indigo-200">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {remaining.slice(0, displayLimit - 3).map((entry, index) => (
                <LeaderboardRow
                  key={index}
                  rank={index + 4}
                  user={entry.user}
                  points={entry.totalPoints}
                  isUserRow={userRank === index + 4}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {displayLimit < leaderboard.length && (
          <div className="px-4 py-3 border-t border-indigo-500/30 flex justify-center">
            <button
              onClick={() => setDisplayLimit((prev) => prev + 10)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Your Rank */}
      {userRank && userRank > 3 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-purple-100 font-semibold">Your Current Rank</span>
            <div className="text-3xl font-bold text-purple-400">#{userRank}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaderboardPodiumCard: React.FC<{
  rank: number;
  user: any;
  points: number;
  isHighlight?: boolean;
  isPrimary?: boolean;
}> = ({ rank, user, points, isHighlight, isPrimary }) => {
  const rankColors = {
    1: "from-yellow-500/30 to-orange-500/30 border-yellow-500/50",
    2: "from-gray-400/30 to-gray-500/30 border-gray-400/50",
    3: "from-orange-600/30 to-orange-700/30 border-orange-600/50",
  };

  const medalColors = {
    1: "text-yellow-400",
    2: "text-gray-300",
    3: "text-orange-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} backdrop-blur-xl rounded-lg p-6 border transition-transform ${
        isPrimary ? "transform scale-105 shadow-2xl shadow-yellow-500/20" : ""
      } ${isHighlight ? "ring-2 ring-purple-500" : ""}`}
    >
      <div className={`flex justify-center mb-4 ${medalColors[rank as keyof typeof medalColors]}`}>
        <Medal className="w-8 h-8" />
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-2">{rank}</div>

        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden border-2 border-white/20">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-2xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h3 className="text-white font-semibold text-lg mb-1">{user?.name}</h3>
        <p className={`text-lg font-bold ${
          rank === 1
            ? "text-yellow-400"
            : rank === 2
              ? "text-gray-300"
              : "text-orange-400"
        }`}>
          {points.toLocaleString()} pts
        </p>
      </div>
    </div>
  );
};

const LeaderboardRow: React.FC<{
  rank: number;
  user: any;
  points: number;
  isUserRow?: boolean;
}> = ({ rank, user, points, isUserRow }) => {
  return (
    <tr
      className={`border-b border-indigo-500/20 hover:bg-indigo-800/30 transition-colors ${
        isUserRow ? "bg-indigo-800/50 font-semibold" : ""
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-300">#{rank}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-indigo-100 font-medium">{user?.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-indigo-300 font-bold text-lg">
          {points.toLocaleString()}
        </span>
      </td>
    </tr>
  );
};

export default Leaderboard;
