import React from "react";

interface LanguageCardProps {
  language: string;
  emoji: string;
  tutorialCount: number;
  isRecommended?: boolean;
  onClick: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  emoji,
  tutorialCount,
  isRecommended = false,
  onClick,
}) => {
  // Color mapping based on language
  const getLanguageColors = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    switch (lowerLang) {
      case "python":
        return {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100",
          button: "bg-blue-500 hover:bg-blue-600",
          border: "border-blue-200",
        };
      case "javascript":
        return {
          bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
          button: "bg-yellow-500 hover:bg-yellow-600",
          border: "border-yellow-200",
        };
      case "cpp":
      case "c++":
        return {
          bg: "bg-gradient-to-br from-purple-50 to-purple-100",
          button: "bg-purple-500 hover:bg-purple-600",
          border: "border-purple-200",
        };
      case "java":
        return {
          bg: "bg-gradient-to-br from-red-50 to-red-100",
          button: "bg-red-500 hover:bg-red-600",
          border: "border-red-200",
        };
      case "react":
        return {
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100",
          button: "bg-cyan-500 hover:bg-cyan-600",
          border: "border-cyan-200",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-50 to-gray-100",
          button: "bg-gray-500 hover:bg-gray-600",
          border: "border-gray-200",
        };
    }
  };

  const colors = getLanguageColors(language);

  return (
    <div
      className={`${colors.bg} rounded-xl border-2 ${colors.border} shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group relative`}
      onClick={onClick}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Recommended
          </div>
        </div>
      )}

      <div className="p-6 flex flex-col items-center text-center">
        {/* Emoji Icon */}
        <div className="text-5xl mb-4">{emoji}</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 capitalize">
          {language}
        </h3>

        {/* Difficulty Badge */}
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Beginner to Expert
        </span>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 min-h-[40px]">
          {language === "python" &&
            "Complete Python programming from fundamentals to advanced topics"}
          {language === "javascript" &&
            "Modern JavaScript, ES6+, and asynchronous programming"}
          {(language === "cpp" || language === "c++") &&
            "Systems programming, memory management, and STL"}
          {language === "java" &&
            "Enterprise Java development and object-oriented programming"}
          {language === "react" &&
            "Building modern web applications with React and Hooks"}
        </p>

        {/* Topic Count */}
        <div className="flex items-center space-x-2 text-gray-700 text-sm mb-4">
          <span>📚</span>
          <span className="font-medium">{tutorialCount} Topics</span>
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

export default LanguageCard;

