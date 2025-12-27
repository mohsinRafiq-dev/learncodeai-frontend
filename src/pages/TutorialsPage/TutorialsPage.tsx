import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen } from "lucide-react";
import {
  fetchMainConcepts,
  type MainConcepts,
} from "../../functions/TutorialFunctions/tutorialFunctions";
import {
  getAllCourses,
  type Course,
} from "../../functions/CourseFunctions/courseFunctions";
import { getProfile } from "../../functions/ProfileFunctions/profileFunctions";
import { useAuth } from "../../hooks/useAuth";
import LanguageCard from "./Components/LanguageCard";
import CourseCard from "./Components/CourseCard";

const TutorialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mainConcepts, setMainConcepts] = useState<MainConcepts>({
    python: [],
    javascript: [],
    cpp: [],
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [userLanguages, setUserLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tutorials data
      const conceptsData = await fetchMainConcepts();
      setMainConcepts(conceptsData);

      // Load courses data
      const coursesResponse = await getAllCourses({ limit: 8 });
      setCourses(coursesResponse.data);

      // Load user profile to get programming languages (if authenticated)
      if (isAuthenticated) {
        try {
          const profileResponse = await getProfile();
          const languages = profileResponse.data.programmingLanguages || [];
          // Normalize language names to lowercase for comparison
          setUserLanguages(languages.map((lang: string) => lang.toLowerCase()));
        } catch (err) {
          console.error("Error loading user profile:", err);
          // Don't set error state, just continue without recommendations
        }
      }
    } catch (err) {
      console.error("Error loading page data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageClick = (language: string) => {
    navigate(`/tutorials/${language}`);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const getLanguages = () => {
    return Object.keys(mainConcepts) as (keyof MainConcepts)[];
  };

  const getTutorialCount = (language: keyof MainConcepts) => {
    return mainConcepts[language]?.length || 0;
  };

  const isRecommended = (language: string) => {
    const normalizedLang = language.toLowerCase();
    // Check if user has this language in their profile
    return userLanguages.some((userLang) => {
      // Handle common variations
      if (normalizedLang === "cpp" || normalizedLang === "c++") {
        return (
          userLang === "cpp" || userLang === "c++" || userLang.includes("c++")
        );
      }
      return userLang === normalizedLang || userLang.includes(normalizedLang);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] font-mono">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#00b4d8] text-lg font-mono">
              <span className="text-[#6272a4]">{"// "}</span>Loading
              tutorials...
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
              <button className="group relative w-full" onClick={loadPageData}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-8 py-3 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold hover:bg-[#1a1f3a] transition-all duration-300 flex items-center justify-center gap-2">
                  <span className="text-[#00e676]">$</span>
                  <span className="text-[#00b4d8]">try_again</span>
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
        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>

          <div className="relative z-10">
            {/* Terminal Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg mb-6">
              <span className="text-[#00b4d8] font-mono text-sm animate-pulse">
                ●
              </span>
              <span className="text-[#00b4d8] font-mono text-sm font-medium">
                Tutorials.init()
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-[#6272a4]">{"// "}</span>
              <span className="neon-text-cyan">Start Your</span>
              <br />
              <span className="neon-text-purple">Learning Journey</span>
            </h1>
            <p className="text-[#6272a4] text-base max-w-2xl mx-auto font-mono">
              <span className="text-[#00b4d8]">{"/* "}</span>
              Explore comprehensive tutorials and courses
              <span className="text-[#00b4d8]">{" */"}</span>
            </p>
          </div>
        </div>

        {/* Programming Languages Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-[#6272a4]">{"const "}</span>
            <span className="neon-text-green">languages</span>
            <span className="text-[#6272a4]">{" = ["}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {getLanguages().map((language) => (
              <LanguageCard
                key={language}
                language={language}
                tutorialCount={getTutorialCount(language)}
                isRecommended={isRecommended(language)}
                onClick={() => handleLanguageClick(language)}
              />
            ))}
          </div>

          <p className="text-center text-[#6272a4] mt-8 font-mono">{"];"}</p>
        </section>

        {/* Comprehensive Courses Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-center">
            <span className="text-[#6272a4]">{"const "}</span>
            <span className="neon-text-purple">courses</span>
            <span className="text-[#6272a4]">{" = ["}</span>
          </h2>
          <p className="text-center text-[#6272a4] mb-8 max-w-2xl mx-auto font-mono">
            <span className="text-[#00b4d8]">{"// "}</span>
            Deep dive into structured courses with lessons, quizzes, and
            certificates
          </p>

          {courses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onClick={() => handleCourseClick(course._id)}
                  />
                ))}
              </div>
              <p className="text-center text-[#6272a4] mt-8 font-mono">
                {"];"}
              </p>
            </>
          ) : (
            <div className="terminal-window backdrop-blur-xl p-12 max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#00b4d8]/10 flex items-center justify-center neon-border-cyan">
                <BookOpen className="w-10 h-10 text-[#00b4d8]" />
              </div>
              <h3 className="text-2xl font-bold text-[#00b4d8] mb-2 font-mono">
                {"// No courses yet"}
              </h3>
              <p className="text-[#6272a4] font-mono">
                Check back later for new courses!
              </p>
            </div>
          )}
        </section>

        {/* Footer Note */}
        <div className="text-center text-[#6272a4] text-sm max-w-3xl mx-auto pt-8 border-t border-[#00b4d8]/20 font-mono">
          <span className="text-[#00b4d8]">{"/* "}</span>
          Each course contains detailed theory, practical examples, code
          snippets, and quizzes
          <span className="text-[#00b4d8]">{" */"}</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage;
