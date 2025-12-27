import React from "react";
import { Code2, Braces, Cpu, Coffee, Atom } from "lucide-react";

interface LanguageCardProps {
  language: string;
  tutorialCount: number;
  isRecommended?: boolean;
  onClick: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  tutorialCount,
  isRecommended = false,
  onClick,
}) => {
  // Get icon based on language
  const getLanguageIcon = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    switch (lowerLang) {
      case "python":
        return <Code2 className="w-12 h-12" />;
      case "javascript":
        return <Braces className="w-12 h-12" />;
      case "cpp":
      case "c++":
        return <Cpu className="w-12 h-12" />;
      case "java":
        return <Coffee className="w-12 h-12" />;
      case "react":
        return <Atom className="w-12 h-12" />;
      default:
        return <Code2 className="w-12 h-12" />;
    }
  };
  // Color mapping based on language - terminal theme
  const getLanguageColors = (lang: string) => {
    const lowerLang = lang.toLowerCase();
    switch (lowerLang) {
      case "python":
        return {
          border: "neon-border-cyan",
          text: "text-[#00b4d8]",
          glow: "from-[#00b4d8] to-[#00e676]",
        };
      case "javascript":
        return {
          border: "neon-border-green",
          text: "text-[#00e676]",
          glow: "from-[#00e676] to-[#8b5cf6]",
        };
      case "cpp":
      case "c++":
        return {
          border: "neon-border-pink",
          text: "text-[#e91e63]",
          glow: "from-[#e91e63] to-[#00d4ff]",
        };
      case "java":
        return {
          border: "neon-border-purple",
          text: "text-[#8b5cf6]",
          glow: "from-[#8b5cf6] to-[#e91e63]",
        };
      case "react":
        return {
          border: "neon-border-cyan",
          text: "text-[#00d4ff]",
          glow: "from-[#00d4ff] to-[#00b4d8]",
        };
      default:
        return {
          border: "neon-border-cyan",
          text: "text-[#00b4d8]",
          glow: "from-[#00b4d8] to-[#8b5cf6]",
        };
    }
  };

  const colors = getLanguageColors(language);

  return (
    <div
      className={`relative terminal-window backdrop-blur-xl p-6 cursor-pointer group hover:scale-105 transition-all duration-300 overflow-hidden`}
      onClick={onClick}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-[#00e676] to-[#00b4d8] text-[#0a0e27] text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 font-mono">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            For You
          </div>
        </div>
      )}

      {/* Glow Effect on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Language Icon */}
        <div className="flex items-center justify-center mb-4">
          <div
            className={`${colors.text} transform group-hover:scale-110 transition-transform duration-300`}
          >
            {getLanguageIcon(language)}
          </div>
        </div>

        {/* Language Name */}
        <h3
          className={`text-2xl font-bold text-center mb-2 ${colors.text} font-mono`}
        >
          {language === "cpp"
            ? "C++"
            : language.charAt(0).toUpperCase() + language.slice(1)}
        </h3>

        {/* Difficulty Badge */}
        <span
          className={`inline-block ${colors.border} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 font-mono`}
        >
          Beginner → Expert
        </span>

        {/* Tutorial Count */}
        <p className="text-[#6272a4] text-center text-sm mb-4 font-mono">
          <span className="text-[#00b4d8]">{"// "}</span>
          {tutorialCount} {tutorialCount === 1 ? "topic" : "topics"}
        </p>

        {/* Button */}
        <div className="mt-2 w-full">
          <div
            className={`w-full py-3 ${colors.border} rounded-lg ${colors.text} font-semibold text-center transition-all duration-300 group-hover:shadow-lg font-mono flex items-center justify-center gap-2`}
          >
            <span className="text-[#6272a4]">$</span>
            <span>start_learning</span>
            <span className="text-[#6272a4] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageCard;
