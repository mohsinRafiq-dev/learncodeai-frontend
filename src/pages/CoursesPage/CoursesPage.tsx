import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen } from "lucide-react";
import {
  getAllCourses,
  type Course,
} from "../../functions/CourseFunctions/courseFunctions";
import CourseCard from "../TutorialsPage/Components/CourseCard";

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesResponse = await getAllCourses({ limit: 12 });
        setCourses(coursesResponse.data || []);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] font-mono">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#8b5cf6] text-lg font-mono">
              <span className="text-[#6272a4]">{"// "}</span>Loading courses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e27] font-mono">
        <div className="flex items-center justify-center min-h-screen">
          <div className="terminal-window backdrop-blur-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e91e63]/10 flex items-center justify-center neon-border-pink">
                <AlertTriangle className="w-8 h-8 text-[#e91e63]" />
              </div>
              <h2 className="text-2xl font-bold text-[#e91e63] mb-2 font-mono">
                {"// Error"}
              </h2>
              <p className="text-[#6272a4] mb-6">{error}</p>
              <button
                className="group relative w-full"
                onClick={() => window.location.reload()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#00b4d8] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-8 py-3 bg-[#0a0e27] neon-border-purple rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-2">
                  <span className="text-[#00e676]">$</span>
                  <span className="text-[#8b5cf6]">retry</span>
                  <span className="text-[#6272a4]">()</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-purple backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg mb-6">
              <span className="text-[#8b5cf6] font-mono text-sm animate-pulse">●</span>
              <span className="text-[#8b5cf6] font-mono text-sm font-medium">
                Courses.load()
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-[#6272a4]">{"// "}</span>
              <span className="neon-text-purple">Structured Courses</span>
            </h1>
            <p className="text-[#6272a4] text-base max-w-2xl mx-auto font-mono">
              <span className="text-[#8b5cf6]">{"/* "}</span>
              Learn step-by-step with lessons, quizzes, and certificates
              <span className="text-[#8b5cf6]">{" */"}</span>
            </p>
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onClick={() => handleCourseClick(course._id)}
              />
            ))}
          </div>
        ) : (
          <div className="terminal-window backdrop-blur-xl p-12 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center neon-border-purple">
              <BookOpen className="w-10 h-10 text-[#8b5cf6]" />
            </div>
            <h3 className="text-2xl font-bold text-[#8b5cf6] mb-2 font-mono">
              {"// No courses found"}
            </h3>
            <p className="text-[#6272a4] font-mono">Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
