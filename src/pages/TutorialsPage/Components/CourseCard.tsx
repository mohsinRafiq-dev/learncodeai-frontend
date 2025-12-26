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

  const getIcon = (language: string, title: string) => {
    const lowerTitle = title.toLowerCase();

    // Language-based icons
    if (language === "python")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09z"
            fill="currentColor"
          />
        </svg>
      );
    if (language === "javascript")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067z"
            fill="currentColor"
          />
        </svg>
      );
    if (language === "cpp")
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91z"
            fill="currentColor"
          />
        </svg>
      );

    // Category-based icons
    if (lowerTitle.includes("array") || lowerTitle.includes("string"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 12h2v5H7v-5zm4-3h2v8h-2V9zm4-3h2v11h-2V6z"
            fill="currentColor"
          />
        </svg>
      );
    if (lowerTitle.includes("linked") || lowerTitle.includes("list"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
            fill="currentColor"
          />
        </svg>
      );
    if (lowerTitle.includes("tree") || lowerTitle.includes("graph"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"
            fill="currentColor"
          />
        </svg>
      );
    if (lowerTitle.includes("sort") || lowerTitle.includes("search"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="currentColor"
          />
        </svg>
      );
    if (lowerTitle.includes("dynamic") || lowerTitle.includes("dp"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"
            fill="currentColor"
          />
        </svg>
      );
    if (lowerTitle.includes("web"))
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
            fill="currentColor"
          />
        </svg>
      );

    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"
          fill="currentColor"
        />
      </svg>
    );
  };

  const colors = getRandomGradient(course._id);

  return (
    <div
      className={`${colors.bg} rounded-xl border-2 ${colors.border} shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group`}
      onClick={onClick}
    >
      <div className="p-6 flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className="text-5xl mb-4 transform group-hover:scale-110 transition-transform"
          style={{ color: colors.textColor }}
        >
          {getIcon(course.language, course.title)}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {course.title}
        </h3>

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
            <span className="font-medium">
              {course.totalSections || course.sections?.length || 0} Sections
            </span>
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
