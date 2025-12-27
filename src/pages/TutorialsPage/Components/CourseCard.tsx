import React from "react";
import {
  Code2,
  Braces,
  Cpu,
  Coffee,
  BookOpen,
  Clock,
  Layers,
} from "lucide-react";
import type { Course } from "../../../functions/CourseFunctions/courseFunctions";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  // Generate consistent colors based on course ID - terminal theme
  const getTerminalColor = (id: string) => {
    const colors = [
      {
        border: "neon-border-cyan",
        text: "text-[#00b4d8]",
        glow: "from-[#00b4d8] to-[#00e676]",
      },
      {
        border: "neon-border-purple",
        text: "text-[#8b5cf6]",
        glow: "from-[#8b5cf6] to-[#e91e63]",
      },
      {
        border: "neon-border-green",
        text: "text-[#00e676]",
        glow: "from-[#00e676] to-[#8b5cf6]",
      },
      {
        border: "neon-border-pink",
        text: "text-[#e91e63]",
        glow: "from-[#e91e63] to-[#00d4ff]",
      },
      {
        border: "neon-border-cyan",
        text: "text-[#00d4ff]",
        glow: "from-[#00d4ff] to-[#00b4d8]",
      },
    ];

    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getDifficultyText = (difficulty: string) => {
    const lower = difficulty.toLowerCase();
    if (lower === "beginner") return "Beginner → Expert";
    if (lower === "intermediate") return "Intermediate → Expert";
    if (lower === "advanced") return "Advanced";
    return "Beginner → Advanced";
  };

  const getIcon = (language: string) => {
    const iconClass = "w-10 h-10";
    if (language === "python") return <Code2 className={iconClass} />;
    if (language === "javascript") return <Braces className={iconClass} />;
    if (language === "cpp") return <Cpu className={iconClass} />;
    if (language === "java") return <Coffee className={iconClass} />;
    return <BookOpen className={iconClass} />;
  };

  const colors = getTerminalColor(course._id);

  return (
    <div
      className="relative terminal-window backdrop-blur-xl p-6 cursor-pointer group hover:scale-105 transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      {/* Glow Effect on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`${colors.text} mb-4 transform group-hover:scale-110 transition-transform duration-300`}
        >
          {getIcon(course.language)}
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-bold mb-3 line-clamp-2 ${colors.text} font-mono`}
        >
          {course.title}
        </h3>

        {/* Difficulty Badge */}
        <span
          className={`inline-block ${colors.border} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 font-mono`}
        >
          {getDifficultyText(course.difficulty)}
        </span>

        {/* Description */}
        <p className="text-[#6272a4] text-sm mb-4 min-h-[40px] line-clamp-2 font-mono">
          {course.shortDescription || course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-center space-x-4 text-[#6272a4] text-xs mb-4 font-mono">
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-medium">
              {course.totalSections || course.sections?.length || 0} sections
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{course.estimatedHours || 0}h</span>
          </div>
        </div>

        {/* Start Learning Button */}
        <div className="mt-2 w-full">
          <div
            className={`w-full py-3 ${colors.border} rounded-lg ${colors.text} font-semibold text-center transition-all duration-300 group-hover:shadow-lg font-mono flex items-center justify-center gap-2`}
          >
            <span className="text-[#6272a4]">$</span>
            <span>start_course</span>
            <span className="text-[#6272a4] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
