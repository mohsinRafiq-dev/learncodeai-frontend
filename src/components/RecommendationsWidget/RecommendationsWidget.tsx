import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, FileText, ChevronRight, RefreshCw, PlayCircle } from "lucide-react";
import recommendationAPI, { Recommendations } from "../../services/recommendationAPI";

const LANG_COLORS: Record<string, string> = {
  python: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cpp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  sql: "bg-green-500/20 text-green-400 border-green-500/30",
  rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  haskell: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

export default function RecommendationsWidget() {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const recs = await recommendationAPI.getRecommendations();
      setData(recs);
    } catch {
      // silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  };

  const hasContent =
    data &&
    (data.continueCourses.length > 0 ||
      data.recommendedCourses.length > 0 ||
      data.recommendedTutorials.length > 0);

  if (loading) {
    return (
      <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6 animate-pulse">
        <div className="h-5 bg-indigo-800/40 rounded w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-indigo-800/30 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasContent) return null;

  return (
    <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-semibold text-lg">What to Learn Next</h2>
        </div>
        <button
          onClick={load}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-indigo-800/40 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Continue in-progress */}
      {data!.continueCourses.length > 0 && (
        <div>
          <p className="text-xs text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5" /> Continue Learning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data!.continueCourses.map((course) => (
              <button
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="text-left bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/50 hover:bg-cyan-900/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </p>
                    <p className="text-xs text-cyan-400 mt-0.5">{course.reason}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5 transition-colors" />
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{course.overallProgress}% complete</span>
                  </div>
                  <div className="w-full bg-indigo-900/40 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${course.overallProgress}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {data!.recommendedCourses.length > 0 && (
        <div>
          <p className="text-xs text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Recommended Courses
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data!.recommendedCourses.map((course) => (
              <button
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="text-left bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 hover:border-indigo-400/50 hover:bg-indigo-900/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${LANG_COLORS[course.language] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                    {course.language}
                  </span>
                  <span className={`text-xs font-medium ${DIFF_COLORS[course.difficulty]}`}>
                    {course.difficulty}
                  </span>
                </div>
                <p className="text-white text-sm font-medium leading-tight group-hover:text-indigo-200 transition-colors line-clamp-2">
                  {course.title}
                </p>
                <p className="text-xs text-indigo-400 mt-2">{course.reason}</p>
                {course.estimatedHours && (
                  <p className="text-xs text-gray-500 mt-1">{course.estimatedHours}h estimated</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tutorials */}
      {data!.recommendedTutorials.length > 0 && (
        <div>
          <p className="text-xs text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Suggested Tutorials
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data!.recommendedTutorials.map((tutorial) => (
              <button
                key={tutorial._id}
                onClick={() => navigate(`/tutorials/${tutorial._id}`)}
                className="text-left bg-purple-900/20 border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/50 hover:bg-purple-900/30 transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${LANG_COLORS[tutorial.language] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                    {tutorial.language}
                  </span>
                </div>
                <p className="text-white text-sm font-medium group-hover:text-purple-200 transition-colors line-clamp-2">
                  {tutorial.title}
                </p>
                <p className="text-xs text-purple-400 mt-2">{tutorial.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
