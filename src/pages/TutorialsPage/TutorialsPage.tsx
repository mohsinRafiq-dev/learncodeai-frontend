import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMainConcepts,
  getLanguageEmoji,
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
    return userLanguages.some(userLang => {
      // Handle common variations
      if (normalizedLang === 'cpp' || normalizedLang === 'c++') {
        return userLang === 'cpp' || userLang === 'c++' || userLang.includes('c++');
      }
      return userLang === normalizedLang || userLang.includes(normalizedLang);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Loading tutorials and courses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border-2 border-gray-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              onClick={loadPageData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Start Your Learning Journey
          </h1>
          <p className="text-gray-600 text-base">
            Explore comprehensive tutorials in programming languages
            <br />
            and data structures to advance your coding skills.
          </p>
        </div>

        {/* Programming Languages Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Programming Languages
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {getLanguages().map((language) => (
              <LanguageCard
                key={language}
                language={language}
                emoji={getLanguageEmoji(language)}
                tutorialCount={getTutorialCount(language)}
                isRecommended={isRecommended(language)}
                onClick={() => handleLanguageClick(language)}
              />
            ))}
          </div>
        </section>

        {/* Comprehensive Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Comprehensive Courses
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Deep dive into structured courses with lessons, quizzes, and certificates
          </p>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onClick={() => handleCourseClick(course._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center bg-gray-50 rounded-2xl shadow-md p-12 border-2 border-gray-200 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No courses available yet
              </h3>
              <p className="text-gray-600">Check back later for new courses!</p>
            </div>
          )}
        </section>

        {/* Footer Note */}
        <div className="text-center text-gray-600 text-sm max-w-3xl mx-auto pt-8 border-t border-gray-200">
          Each Course contains detailed theory, practical examples, code
          snippets, and quizzes
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage;

