import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourseById,
  getEnrollmentDetails,
  enrollInCourse,
  completeLessonProgress,
  type Course,
  type CourseEnrollment,
  type CourseSection,
  type CourseLesson,
} from "../../functions/CourseFunctions/courseFunctions";
import LessonViewer from "./components/LessonViewer";
import QuizViewer from "./components/QuizViewer";
import CertificateViewer from "./components/CertificateViewer";
import AIChatAssistant from "../../components/AIChatAssistant/AIChatAssistant";

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current navigation state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"lesson" | "quiz" | "certificate">(
    "lesson"
  );
  const [showAIChat, setShowAIChat] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load course and enrollment data
  const loadCourseData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const courseResponse = await getCourseById(courseId);
      setCourse(courseResponse.data);
      setEnrollment(courseResponse.enrollment || null);

      // Try to get detailed enrollment data if enrolled
      if (courseResponse.enrollment) {
        try {
          const enrollmentResponse = await getEnrollmentDetails(courseId);
          setEnrollment(enrollmentResponse.data);
        } catch (err) {
          // Using basic enrollment data from course response
        }
      }
    } catch (err: any) {
      console.error("Error loading course data:", err);
      setError(err.message || "Failed to load course. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!courseId || enrolling) return;

    try {
      setEnrolling(true);
      const response = await enrollInCourse(courseId);

      if (response.success) {
        await loadCourseData();
        alert('Successfully enrolled in the course!');
      }
    } catch (err: unknown) {
      console.error("Error enrolling in course:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course. Please try again.';
      alert(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  // Handle lesson completion
  const handleLessonComplete = async () => {
    if (!course || !courseId || !enrollment) return;

    const currentSection = course.sections[currentSectionIndex];
    const currentLesson = currentSection.lessons[currentLessonIndex];

    try {
      const response = await completeLessonProgress(
        courseId,
        currentSection._id,
        currentLesson._id
      );
      setEnrollment(response.data);

      // Move to next lesson or quiz
      handleNext();
    } catch (err) {
      console.error("Error completing lesson:", err);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!course) return;

    const currentSection = course.sections[currentSectionIndex];

    if (viewMode === "lesson") {
      // Check if there are more lessons in current section
      if (currentLessonIndex < currentSection.lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      } else {
        // Move to section quiz if exists
        if (currentSection.sectionQuiz) {
          setViewMode("quiz");
        } else {
          // Move to next section
          if (currentSectionIndex < course.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentLessonIndex(0);
          } else {
            // Course completed, show final quiz or certificate
            if (course.finalQuiz) {
              setViewMode("quiz");
            } else {
              setViewMode("certificate");
            }
          }
        }
      }
    } else if (viewMode === "quiz") {
      // After section quiz, move to next section
      if (currentSectionIndex < course.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentLessonIndex(0);
        setViewMode("lesson");
      } else {
        // Show certificate after final quiz
        setViewMode("certificate");
      }
    }
  };

  const handlePrevious = () => {
    if (!course) return;

    if (viewMode === "quiz") {
      // Go back to last lesson of section
      const currentSection = course.sections[currentSectionIndex];
      setCurrentLessonIndex(currentSection.lessons.length - 1);
      setViewMode("lesson");
    } else if (viewMode === "lesson") {
      if (currentLessonIndex > 0) {
        setCurrentLessonIndex(currentLessonIndex - 1);
      } else if (currentSectionIndex > 0) {
        // Move to previous section's last lesson
        setCurrentSectionIndex(currentSectionIndex - 1);
        const prevSection = course.sections[currentSectionIndex - 1];
        setCurrentLessonIndex(prevSection.lessons.length - 1);
      }
    }
  };

  const handleSectionSelect = (
    sectionIndex: number,
    lessonIndex: number = 0
  ) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentLessonIndex(lessonIndex);
    setViewMode("lesson");
  };

  const handleShowSectionQuiz = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setViewMode("quiz");
  };

  const handleShowFinalQuiz = () => {
    setViewMode("quiz");
  };

  const handleQuizComplete = async () => {
    // Reload enrollment to get updated progress
    console.log('Quiz completed - reloading course data...');
    await loadCourseData();
    console.log('Course data reloaded after quiz completion');
    
    // Force a re-fetch to ensure we have the latest data
    setTimeout(async () => {
      await loadCourseData();
      console.log('Second reload completed');
    }, 500);
    
    // For final quiz, show certificate view
    if (course && currentSectionIndex >= course.sections.length) {
      console.log('Final quiz completed - showing certificate');
      setViewMode('certificate');
    } else {
      handleNext();
    }
  };

  // Check if lesson is completed
  const isLessonCompleted = (sectionId: string, lessonId: string): boolean => {
    if (!enrollment) return false;

    const sectionProgress = enrollment.sectionProgress?.find(
      (sp: any) => sp.section === sectionId
    );

    if (!sectionProgress) return false;

    return sectionProgress.lessons.some(
      (lp: any) => lp.lesson === lessonId && lp.isCompleted
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Course
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Course not found"}
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => navigate("/tutorials")}
          >
            Back to Tutorials
          </button>
        </div>
      </div>
    );
  }

  // Show course details if not enrolled
  if (!enrollment) {
    return (
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => navigate("/tutorials")}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-2"
            >
              ← Back to Tutorials
            </button>
            <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{course.language.toUpperCase()}</p>
          </div>

          {/* Course Overview in Sidebar */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Structure</h3>
              <div className="space-y-2">
                {course.sections.map((section: CourseSection, idx: number) => (
                  <div key={section._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {idx + 1}. {section.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {section.lessons.length} lessons
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll Button in Sidebar */}
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          </div>
        </div>

        {/* Main Content - Course Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {course.language.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                  course.difficulty === 'beginner' ? 'bg-green-600' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-8 text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="font-medium">{course.estimatedHours}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📚</span>
                  <span className="font-medium">{course.sections?.length || 0} sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium">{course.category}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                  {course.instructor?.profilePicture ? (
                    <img
                      src={course.instructor.profilePicture}
                      alt={course.instructor.name || 'Instructor'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-600 font-bold text-lg">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-semibold text-gray-900">{course.instructor?.name || 'Unknown Instructor'}</p>
                </div>
              </div>
            </div>

            {/* Course Content Preview */}
            {course.sections && course.sections.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                <div className="space-y-4">
                  {course.sections.map((section: CourseSection, index: number) => (
                    <div
                      key={section._id}
                      className="border border-gray-200 rounded-xl p-6 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {index + 1}. {section.title}
                        </h3>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {section.lessons?.length || 0} lessons
                        </span>
                      </div>
                      {section.description && (
                        <p className="text-gray-600 mt-2">{section.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Chat */}
        {showAIChat && (
          <div className="w-96 flex-shrink-0 border-l border-gray-200">
            <AIChatAssistant context="course" contextTitle={course?.title} />
          </div>
        )}

        {!showAIChat && (
          <button
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          >
            💬
          </button>
        )}
      </div>
    );
  }

  // Check if sections have lessons
  const hasLessons = course.sections.some((section: CourseSection) => 
    section.lessons && section.lessons.length > 0
  );

  if (!hasLessons) {
    console.warn("No lessons found in course sections");
  }

  const currentSection = course.sections[currentSectionIndex];
  const currentLesson =
    viewMode === "lesson" ? currentSection?.lessons[currentLessonIndex] : null;

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar - Course Navigation */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-80"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex-1">
              <button
                onClick={() => navigate("/tutorials")}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-2"
              >
                ← Back to Tutorials
              </button>
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {course.title}
              </h2>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {enrollment.overallProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Course Content Navigation */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            {course.sections.map(
              (section: CourseSection, sectionIdx: number) => (
                <div key={section._id} className="mb-4">
                  <div className="font-semibold text-gray-900 mb-2">
                    Section {sectionIdx + 1}: {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.lessons.map(
                      (lesson: CourseLesson, lessonIdx: number) => {
                        const isCompleted = isLessonCompleted(
                          section._id,
                          lesson._id
                        );
                        const isCurrent =
                          viewMode === "lesson" &&
                          sectionIdx === currentSectionIndex &&
                          lessonIdx === currentLessonIndex;

                        return (
                          <button
                            key={lesson._id}
                            onClick={() =>
                              handleSectionSelect(sectionIdx, lessonIdx)
                            }
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              isCurrent
                                ? "bg-indigo-100 text-indigo-700 font-medium"
                                : isCompleted
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex-1 truncate">
                                {lesson.title}
                              </span>
                              {isCompleted && <span className="ml-2">✓</span>}
                            </div>
                          </button>
                        );
                      }
                    )}
                    {section.sectionQuiz && (
                      <button
                        onClick={() => handleShowSectionQuiz(sectionIdx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          viewMode === "quiz" &&
                          sectionIdx === currentSectionIndex
                            ? "bg-indigo-100 text-indigo-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">📝</span>
                          Section Quiz
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Final Quiz */}
            {course.finalQuiz && (
              <div className="mb-4">
                <button
                  onClick={handleShowFinalQuiz}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    viewMode === "quiz" &&
                    currentSectionIndex === course.sections.length
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">🎯</span>
                    Final Quiz
                  </span>
                </button>
              </div>
            )}

            {/* Certificate */}
            {enrollment.status === "completed" && (
              <div className="mb-4">
                <button
                  onClick={() => setViewMode("certificate")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    viewMode === "certificate"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">🏆</span>
                    Certificate
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "lesson" && currentLesson && (
            <LessonViewer
              lesson={currentLesson}
              section={currentSection}
              onComplete={handleLessonComplete}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isCompleted={isLessonCompleted(
                currentSection._id,
                currentLesson._id
              )}
              canGoPrevious={currentSectionIndex > 0 || currentLessonIndex > 0}
              canGoNext={true}
            />
          )}

          {viewMode === "quiz" && (
            <QuizViewer
              courseId={courseId!}
              quizId={
                currentSectionIndex < course.sections.length
                  ? currentSection.sectionQuiz?._id
                  : course.finalQuiz?._id
              }
              sectionId={
                currentSectionIndex < course.sections.length
                  ? currentSection._id
                  : null
              }
              isFinalQuiz={currentSectionIndex >= course.sections.length}
              onComplete={handleQuizComplete}
              onBack={handlePrevious}
            />
          )}

          {viewMode === "certificate" && (
            <CertificateViewer
              enrollment={enrollment}
              course={course}
              onBackToCourse={() => navigate(`/courses/${courseId}`)}
            />
          )}
        </div>
      </div>

      {/* AI Chat Assistant */}
      {showAIChat && (
        <div className="w-96 flex-shrink-0 border-l border-gray-200">
          <AIChatAssistant
            context="course-learning"
            contextTitle={course?.title}
          />
          <button
            onClick={() => setShowAIChat(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      )}

      {!showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default CourseLearningPage;

