import React from "react";
import { Trophy, Lock } from "lucide-react";

const BadgesShowcase: React.FC<{
  badges: any[];
  achievements?: any[];
  loading?: boolean;
}> = ({ badges = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-lg p-6 animate-pulse">
        <div className="h-40 bg-amber-800/30 rounded"></div>
      </div>
    );
  }

  const unlockedCount = badges.length;
  const allBadges = [
    { name: "First Steps", icon: "👣", rarity: "common" },
    { name: "Code Master", icon: "🧑‍💻", rarity: "rare" },
    { name: "Quick Learner", icon: "⚡", rarity: "uncommon" },
    { name: "Night Owl", icon: "🦉", rarity: "uncommon" },
    { name: "Consistent Coder", icon: "🔥", rarity: "rare" },
    { name: "Course Completer", icon: "🎓", rarity: "rare" },
    { name: "Tutorial Expert", icon: "📚", rarity: "epic" },
    { name: "Quiz Champion", icon: "🏆", rarity: "epic" },
    { name: "Helper", icon: "🤝", rarity: "epic" },
    { name: "Legendary", icon: "👑", rarity: "legendary" },
  ];

  const unlockedBadgeNames = badges.map((b: any) => b.badge?.name || b.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-lg p-6 border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Badges & Achievements
            </h2>
            <p className="text-amber-200 text-sm mt-1">
              {unlockedCount} of {allBadges.length} badges unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">{unlockedCount}</div>
            <div className="text-xs text-amber-300">Total Earned</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-amber-900/30 backdrop-blur-xl rounded-lg p-4 border border-amber-500/30">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-amber-200">Badge Collection Progress</span>
          <span className="text-amber-400 font-semibold">
            {Math.round((unlockedCount / allBadges.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-amber-950/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-500"
            style={{ width: `${(unlockedCount / allBadges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {allBadges.map((badge, index) => {
          const isUnlocked = unlockedBadgeNames.includes(badge.name);
          const rarityColors = {
            common: "from-gray-400 to-gray-500",
            uncommon: "from-green-400 to-green-500",
            rare: "from-blue-400 to-blue-500",
            epic: "from-purple-500 to-pink-500",
            legendary: "from-yellow-500 to-orange-500",
          };

          return (
            <div
              key={index}
              className={`relative group cursor-pointer transition-transform hover:scale-105 ${
                !isUnlocked ? "opacity-40" : ""
              }`}
            >
              <div
                className={`bg-gradient-to-br ${
                  rarityColors[badge.rarity as keyof typeof rarityColors]
                } rounded-lg p-4 aspect-square flex flex-col items-center justify-center relative overflow-hidden`}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />

                {/* Badge content */}
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-xs font-bold text-white text-center leading-tight">
                  {badge.name}
                </div>

                {/* Locked icon */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock className="w-6 h-6 text-white/60" />
                  </div>
                )}

                {/* Unlock checkmark */}
                {isUnlocked && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {badge.name}
                  <div className="text-gray-400 text-xs">
                    {badge.rarity.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rarity Legend */}
      <div className="bg-amber-900/20 backdrop-blur-xl rounded-lg p-4 border border-amber-500/20">
        <h3 className="text-sm font-semibold text-amber-200 mb-3">Rarity Levels</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {Object.entries({
            common: "Common",
            uncommon: "Uncommon",
            rare: "Rare",
            epic: "Epic",
            legendary: "Legendary",
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded bg-gradient-to-r ${
                {
                  common: "from-gray-400 to-gray-500",
                  uncommon: "from-green-400 to-green-500",
                  rare: "from-blue-400 to-blue-500",
                  epic: "from-purple-500 to-pink-500",
                  legendary: "from-yellow-500 to-orange-500",
                }[key]
              }`} />
              <span className="text-amber-200">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesShowcase;
