import React from "react";
import type { Course } from "../../../functions/CourseFunctions/courseFunctions";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  // Generate random gradient background based on course ID for consistency
  const getRandomGradient = (id: string) => {
    const gradients = [
      {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        button: "bg-blue-500 hover:bg-blue-600",
        border: "border-blue-200",
      },
      {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100",
        button: "bg-purple-500 hover:bg-purple-600",
        border: "border-purple-200",
      },
      {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        button: "bg-green-500 hover:bg-green-600",
        border: "border-green-200",
      },
      {
        bg: "bg-gradient-to-br from-pink-50 to-pink-100",
        button: "bg-pink-500 hover:bg-pink-600",
        border: "border-pink-200",
      },
      {
        bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
        button: "bg-indigo-500 hover:bg-indigo-600",
        border: "border-indigo-200",
      },
      {
        bg: "bg-gradient-to-br from-teal-50 to-teal-100",
        button: "bg-teal-500 hover:bg-teal-600",
        border: "border-teal-200",
      },
      {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100",
        button: "bg-orange-500 hover:bg-orange-600",
        border: "border-orange-200",
      },
      {
        bg: "bg-gradient-to-br from-red-50 to-red-100",
        button: "bg-red-500 hover:bg-red-600",
        border: "border-red-200",
      },
      {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
        button: "bg-emerald-500 hover:bg-emerald-600",
        border: "border-emerald-200",
      },
      {
        bg: "bg-gradient-to-br from-cyan-50 to-cyan-100",
        button: "bg-cyan-500 hover:bg-cyan-600",
        border: "border-cyan-200",
      },
      {
        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
        button: "bg-yellow-500 hover:bg-yellow-600",
        border: "border-yellow-200",
      },
      {
        bg: "bg-gradient-to-br from-rose-50 to-rose-100",
        button: "bg-rose-500 hover:bg-rose-600",
        border: "border-rose-200",
      },
    ];

    // Use course ID to generate consistent index
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % gradients.length;
    return gradients[index];
  };

  const getDifficultyText = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower === "beginner") return "Beginner to Expert";
    if (lower === "intermediate") return "Intermediate to Expert";
    if (lower === "advanced") return "Advanced";
    return "Beginner to Advanced";
  };

  const getEmoji = (language: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // Language-based emojis
    if (language === "python") return "🐍";
    if (language === "javascript") return "⚡";
    if (language === "cpp") return "⚙️";
    
    // Category-based emojis
    if (lowerTitle.includes("array") || lowerTitle.includes("string"))
      return "📊";
    if (lowerTitle.includes("linked") || lowerTitle.includes("list"))
      return "🔗";
    if (lowerTitle.includes("tree") || lowerTitle.includes("graph"))
      return "🌳";
    if (lowerTitle.includes("sort") || lowerTitle.includes("search"))
      return "🔍";
    if (lowerTitle.includes("dynamic") || lowerTitle.includes("dp"))
      return "💡";
    if (lowerTitle.includes("web")) return "🌐";
    
    return "📚";
  };

  const colors = getRandomGradient(course._id);

  return (
    <div
      className={`${colors.bg} rounded-xl border-2 ${colors.border} shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group`}
      onClick={onClick}
    >
      <div className="p-6 flex flex-col items-center text-center">
        {/* Emoji Icon */}
        <div className="text-5xl mb-4">{getEmoji(course.language, course.title)}</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h3>

        {/* Difficulty Badge */}
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {getDifficultyText(course.difficulty)}
        </span>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 min-h-[40px] line-clamp-2">
          {course.shortDescription || course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-center space-x-4 text-gray-700 text-xs mb-4">
          <div className="flex items-center space-x-1">
            <span>📚</span>
            <span className="font-medium">{course.totalSections || course.sections?.length || 0} Sections</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏱️</span>
            <span className="font-medium">{course.estimatedHours || 0}h</span>
          </div>
        </div>

        {/* Start Learning Button */}
        <button
          className={`${colors.button} text-white font-semibold py-2.5 px-6 rounded-lg w-full transition-colors duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span>Start Learning</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;

