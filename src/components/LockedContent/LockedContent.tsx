// LockedContent — overlay shown when a free-tier user hits gated content.
// Used in tutorials when `isLocked` is on the API response, and in courses
// when a section/lesson is part of a paid course.

import React from "react";
import { Link } from "react-router-dom";
import { Lock, Crown } from "lucide-react";

interface LockedContentProps {
  title?: string;
  message?: string;
  difficulty?: string;
  module?: string;
}

const LockedContent: React.FC<LockedContentProps> = ({
  title,
  message,
  difficulty,
  module,
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 my-6 rounded-2xl bg-gradient-to-br from-[#1a1f3e] to-[#0d1230] border border-[#8b5cf6]/30 shadow-lg shadow-purple-500/10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/40 mb-4">
        <Lock className="w-8 h-8 text-[#a78bfa]" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
        {title || "This content is part of Pro"}
      </h3>

      {(difficulty || module) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs">
          {module && (
            <span className="px-2 py-1 rounded-full bg-[#1a1f3e] border border-[#2a3050] text-gray-300">
              {module}
            </span>
          )}
          {difficulty && (
            <span
              className={`px-2 py-1 rounded-full border ${
                difficulty === "intermediate"
                  ? "bg-amber-900/30 border-amber-500/40 text-amber-300"
                  : "bg-rose-900/30 border-rose-500/40 text-rose-300"
              }`}
            >
              {difficulty}
            </span>
          )}
        </div>
      )}

      <p className="text-sm text-[#a3a8c2] mb-6 max-w-md mx-auto">
        {message ||
          "Foundations are free. Intermediate and advanced content, all courses, quizzes, and certificates are part of Pro — starting at $6/month."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white hover:from-[#7c3aed] hover:to-[#8b5cf6] transition-all"
        >
          <Crown className="w-4 h-4" />
          See Pro plans
        </Link>
        <Link
          to="/tutorials"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 hover:bg-[#2a3050] transition-all"
        >
          Browse free tutorials
        </Link>
      </div>
    </div>
  );
};

export default LockedContent;
