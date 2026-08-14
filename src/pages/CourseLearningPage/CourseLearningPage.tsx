import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import {
  getCourseById,
  getEnrollmentDetails,
  enrollInCourse,
  type Course,
  type CourseEnrollment,
  type CourseSection,
  type CourseLesson,
} from "../../functions/CourseFunctions/courseFunctions";
import CourseLessonViewer from "./components/CourseLessonViewer";
import QuizViewer from "./components/QuizViewer";
import CertificateViewer from "./components/CertificateViewer";
import AIChatAssistant from "../../components/AIChatAssistant/AIChatAssistant";
import viewTrackingAPI from "../../services/viewTrackingAPI";

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(
    null
  );
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"lesson" | "quiz" | "certificate">(
    "lesson"
  );
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  // Only the setter is used; the sidebar's open state is driven by CSS.
  const [, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setShowAIChat] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [lessonStartTime, setLessonStartTime] = useState<Date | null>(null);

  // Resizable sidebar state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [previousLeftWidth, setPreviousLeftWidth] = useState(320);
  const [isLeftResizing, setIsLeftResizing] = useState(false);
  const [isLeftMinimized, setIsLeftMinimized] = useState(false);

  // Resizable AI panel state
  const [aiPanelWidth, setAiPanelWidth] = useState(400);
  const [previousAiWidth, setPreviousAiWidth] = useState(400);
  const [isAiResizing, setIsAiResizing] = useState(false);
  const [isAiMinimized, setIsAiMinimized] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Used to scroll the actual lesson content area back to the top on Next/Prev.
  const lessonScrollRef = useRef<HTMLDivElement>(null);

  const scrollLessonToTop = () => {
    if (lessonScrollRef.current) {
      lessonScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Also scroll the window in case the layout overflows the viewport (mobile).
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        const courseResponse = await getCourseById(courseId);
        setCourse(courseResponse.data);
        setEnrollment(courseResponse.enrollment || null);

        // Track course view
        viewTrackingAPI
          .trackCourseView(courseId)
          .catch((err) => console.error("Failed to track view:", err));

        // Expand first section by default
        if (courseResponse.data.sections?.length > 0) {
          setExpandedSections([courseResponse.data.sections[0]._id]);

          // Auto-select first lesson if enrolled
          if (courseResponse.enrollment) {
            const firstSection = courseResponse.data.sections[0];
            if (firstSection.lessons?.length > 0) {
              setSelectedSection(firstSection);
              setSelectedLesson(firstSection.lessons[0]);
            }
          }
        }

        // Try to get detailed enrollment data
        if (courseResponse.enrollment) {
          try {
            const enrollmentResponse = await getEnrollmentDetails(courseId);
            setEnrollment(enrollmentResponse.data);
          } catch (err) {
            console.log("Using basic enrollment data");
          }
        }
      } catch (err: any) {
        console.error("Error loading course data:", err);
        setError(
          err.message || "Failed to load course. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  // Left sidebar resize handlers
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeftResizing(true);
  };

  const handleLeftMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;

    const minWidth = 250;
    const maxWidth = Math.min(containerRect.width * 0.4, 600);

    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    setLeftSidebarWidth(clampedWidth);
    setPreviousLeftWidth(clampedWidth);
  }, []);

  const handleLeftMouseUp = useCallback(() => {
    setIsLeftResizing(false);
  }, []);

  // AI panel resize handlers
  const handleAiMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAiResizing(true);
  };

  const handleAiMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    const minWidth = 250;
    const maxWidth = Math.min(containerRect.width * 0.4, 600);

    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    setAiPanelWidth(clampedWidth);
    setPreviousAiWidth(clampedWidth);
  }, []);

  const handleAiMouseUp = useCallback(() => {
    setIsAiResizing(false);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isLeftResizing) {
        handleLeftMouseMove(e);
      }
      if (isAiResizing) {
        handleAiMouseMove(e);
      }
    };

    const handleUp = () => {
      if (isLeftResizing) {
        handleLeftMouseUp();
      }
      if (isAiResizing) {
        handleAiMouseUp();
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    if (isLeftResizing || isAiResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [
    isLeftResizing,
    isAiResizing,
    handleLeftMouseMove,
    handleLeftMouseUp,
    handleAiMouseMove,
    handleAiMouseUp,
  ]);

  // Toggle functions
  const toggleLeftSidebar = () => {
    if (isLeftMinimized) {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxAllowedWidth = Math.min(containerRect.width * 0.4, 600);
        const targetWidth = Math.min(previousLeftWidth, maxAllowedWidth);
        const finalWidth = Math.max(250, targetWidth);

        setLeftSidebarWidth(finalWidth);
      }
    } else {
      setPreviousLeftWidth(leftSidebarWidth);
    }
    setIsLeftMinimized(!isLeftMinimized);
    setSidebarOpen(!isLeftMinimized);
  };

  const toggleAiPanel = () => {
    if (isAiMinimized) {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxAllowedWidth = Math.min(containerRect.width * 0.4, 600);
        const targetWidth = Math.min(previousAiWidth, maxAllowedWidth);
        const finalWidth = Math.max(250, targetWidth);

        setAiPanelWidth(finalWidth);
      }
    } else {
      setPreviousAiWidth(aiPanelWidth);
    }
    setIsAiMinimized(!isAiMinimized);
    setShowAIChat(!isAiMinimized);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonSelect = (section: CourseSection, lesson: CourseLesson) => {
    const lessonIndex = section.lessons.findIndex((l) => l._id === lesson._id);

    if (!isContentUnlocked(section, lessonIndex)) {
      showToast(
        "Please complete the previous content before accessing this lesson.",
        "warning"
      );
      return;
    }

    setLessonLoading(true);
    setSelectedSection(section);
    setSelectedLesson(lesson);
    setLessonStartTime(new Date());
    setViewMode("lesson");
    setLessonLoading(false);
  };

  const handleQuizSelect = (section: CourseSection) => {
    if (!isContentUnlocked(section)) {
      showToast(
        "Please complete all lessons in this section before taking the quiz.",
        "warning"
      );
      return;
    }

    setSelectedSection(section);
    setSelectedQuiz(section.sectionQuiz);
    setViewMode("quiz");
  };

  const handleFinalQuizSelect = () => {
    if (!course?.finalQuiz) return;

    if (!isFinalQuizUnlocked()) {
      showToast(
        "Complete all section quizzes before taking the final quiz.",
        "warning"
      );
      return;
    }

    setSelectedSection(null);
    setSelectedQuiz(course.finalQuiz);
    setViewMode("quiz");
  };

  const handleLessonComplete = async () => {
    if (!courseId || !selectedSection || !selectedLesson) return;

    try {
      // Mark lesson as complete via API
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Authentication required. Please log in again.", "error");
        return;
      }

      const timeSpentMinutes = lessonStartTime
        ? Math.floor((new Date().getTime() - lessonStartTime.getTime()) / 60000)
        : 0;

      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(
        `${apiBase}/courses/${courseId}/progress/lesson`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
            sectionId: selectedSection._id,
            lessonId: selectedLesson._id,
            timeSpentMinutes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete lesson");
      }

      const data = await response.json();
      setEnrollment(data.data);

      // Show success message
      showToast("Lesson completed successfully!", "success");
    } catch (err: any) {
      console.error("Error completing lesson:", err);
      showToast(
        err.message || "Failed to complete lesson. Please try again.",
        "error"
      );
    }
  };

  const handleNextLesson = () => {
    if (!course || !selectedSection || !selectedLesson) return;

    const currentSectionIndex = course.sections.findIndex(
      (s) => s._id === selectedSection._id
    );
    const currentLessonIndex = selectedSection.lessons.findIndex(
      (l) => l._id === selectedLesson._id
    );

    // Check if there's a next lesson in current section
    if (currentLessonIndex < selectedSection.lessons.length - 1) {
      handleLessonSelect(
        selectedSection,
        selectedSection.lessons[currentLessonIndex + 1]
      );
    } else if (selectedSection.sectionQuiz) {
      // Show section quiz after last lesson
      handleQuizSelect(selectedSection);
    } else if (currentSectionIndex < course.sections.length - 1) {
      // Move to first lesson of next section
      const nextSection = course.sections[currentSectionIndex + 1];
      if (nextSection.lessons?.length > 0) {
        handleLessonSelect(nextSection, nextSection.lessons[0]);
      }
    }
    scrollLessonToTop();
  };

  const handlePreviousLesson = () => {
    if (!course) return;

    if (viewMode === "quiz" && selectedQuiz?.type === "final-quiz") {
      const lastSection = course.sections[course.sections.length - 1];
      if (lastSection?.sectionQuiz) {
        handleQuizSelect(lastSection);
      } else if (lastSection?.lessons?.length) {
        handleLessonSelect(lastSection, lastSection.lessons[lastSection.lessons.length - 1]);
      }
      return;
    }

    if (!selectedSection) return;

    if (viewMode === "quiz") {
      // Go back to last lesson of section
      if (selectedSection.lessons?.length > 0) {
        handleLessonSelect(
          selectedSection,
          selectedSection.lessons[selectedSection.lessons.length - 1]
        );
      }
      return;
    }

    if (!selectedLesson) return;

    const currentSectionIndex = course.sections.findIndex(
      (s) => s._id === selectedSection._id
    );
    const currentLessonIndex = selectedSection.lessons.findIndex(
      (l) => l._id === selectedLesson._id
    );

    // Check if there's a previous lesson in current section
    if (currentLessonIndex > 0) {
      handleLessonSelect(
        selectedSection,
        selectedSection.lessons[currentLessonIndex - 1]
      );
    } else if (currentSectionIndex > 0) {
      // Move to last lesson of previous section
      const prevSection = course.sections[currentSectionIndex - 1];
      if (prevSection.lessons?.length > 0) {
        handleLessonSelect(
          prevSection,
          prevSection.lessons[prevSection.lessons.length - 1]
        );
      }
    }
    scrollLessonToTop();
  };

  const handleQuizComplete = async () => {
    // Reload course data to get updated progress
    if (!courseId) return;

    let refreshedEnrollment: CourseEnrollment | null = null;
    try {
      const courseResponse = await getCourseById(courseId);
      setEnrollment(courseResponse.enrollment || null);
      refreshedEnrollment = courseResponse.enrollment || null;

      if (courseResponse.enrollment) {
        const enrollmentResponse = await getEnrollmentDetails(courseId);
        setEnrollment(enrollmentResponse.data);
        refreshedEnrollment = enrollmentResponse.data;
      }
    } catch (err) {
      console.error("Error reloading course data:", err);
    }

    // Final quiz path: show certificate if issued, otherwise notify.
    if (selectedQuiz?.type === "final-quiz") {
      if (refreshedEnrollment?.certificateIssued) {
        setViewMode("certificate");
      } else {
        showToast(
          "Final quiz submitted. If all requirements are met, your certificate will appear here.",
          "success"
        );
      }
      return;
    }

    // Move to next section or show certificate
    if (!course || !selectedSection) return;

    const currentSectionIndex = course.sections.findIndex(
      (s) => s._id === selectedSection._id
    );

    if (currentSectionIndex < course.sections.length - 1) {
      // Move to next section
      const nextSection = course.sections[currentSectionIndex + 1];
      if (nextSection.lessons?.length > 0) {
        handleLessonSelect(nextSection, nextSection.lessons[0]);
      }
    } else {
      // Course completed - check for certificate
      if (refreshedEnrollment?.certificateIssued) {
        setViewMode("certificate");
      } else {
        showToast(
          "Course completed! Your certificate will be issued after admin approval.",
          "success"
        );
      }
    }
  };

  const handleBackClick = () => {
    navigate("/tutorials");
  };

  const handleEnroll = async () => {
    if (!courseId) return;

    try {
      await enrollInCourse(courseId);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to enroll in course", "error");
    }
  };

  const isLessonCompleted = (sectionId: string, lessonId: string): boolean => {
    if (!enrollment?.sectionProgress) return false;

    const sectionProgress = enrollment.sectionProgress.find(
      (sp: any) => String(sp.section) === String(sectionId)
    );
    if (!sectionProgress) return false;

    return sectionProgress.lessons.some(
      (lp: any) => String(lp.lesson) === String(lessonId) && lp.isCompleted
    );
  };

  const isSectionQuizCompleted = (sectionId: string): boolean => {
    if (!enrollment?.sectionProgress) return false;

    const sectionProgress = enrollment.sectionProgress.find(
      (sp: any) => String(sp.section) === String(sectionId)
    );
    return sectionProgress?.sectionQuizScore?.passed || false;
  };

  const isContentUnlocked = (
    section: CourseSection,
    lessonIndex?: number
  ): boolean => {
    if (!course) return false;

    const sectionIndex = course.sections.findIndex(
      (s) => s._id === section._id
    );

    // First section, first lesson is always unlocked
    if (
      sectionIndex === 0 &&
      (lessonIndex === undefined || lessonIndex === 0)
    ) {
      return true;
    }

    // Check if this is a lesson or quiz
    if (lessonIndex !== undefined) {
      // For lessons after the first one in first section
      if (lessonIndex > 0) {
        // Previous lesson must be completed
        const previousLesson = section.lessons[lessonIndex - 1];
        return isLessonCompleted(section._id, previousLesson._id);
      } else {
        // First lesson of a section - previous section quiz must be completed
        if (sectionIndex > 0) {
          const previousSection = course.sections[sectionIndex - 1];
          return isSectionQuizCompleted(previousSection._id);
        }
      }
    } else {
      // This is a section quiz - all lessons in section must be completed
      return section.lessons.every((lesson) =>
        isLessonCompleted(section._id, lesson._id)
      );
    }

    return true;
  };

  const isFinalQuizUnlocked = (): boolean => {
    if (!course?.sections?.length) return false;
    return course.sections.every((section) => isSectionQuizCompleted(section._id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-[#00b4d8] mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-[#6272a4] text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center bg-[#0d1230] border border-[#1a1f3e] rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <svg
            className="w-20 h-20 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-[#6272a4] mb-6">{error || "Course not found"}</p>
          <button
            className="bg-[#00b4d8] hover:bg-[#0096c7] text-[#0a0e27] px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
            onClick={() => navigate("/tutorials")}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If not enrolled, show enrollment page
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4">
        <div className="bg-[#0d1230] border border-[#1a1f3e] rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            {course.title}
          </h1>
          <p className="text-[#6272a4] mb-6">{course.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <span className="bg-[#1a1f3e] text-[#00b4d8] px-3 py-1 rounded-full text-sm font-medium border border-[#00b4d8]/30">
              {course.language.toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                course.difficulty === "beginner"
                  ? "bg-green-600"
                  : course.difficulty === "intermediate"
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            >
              {course.difficulty}
            </span>
            <span className="text-[#cbd5e1] flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {course.estimatedHours}h
            </span>
            <span className="text-[#cbd5e1] flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {course.sections?.length || 0} sections
            </span>
          </div>

          <button
            onClick={handleEnroll}
            className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-[#0a0e27] py-3 rounded-lg font-semibold transition-colors mb-4 cursor-pointer"
          >
            Enroll in Course
          </button>

          <button
            onClick={handleBackClick}
            className="w-full bg-[#1a1f3e] hover:bg-[#252b52] text-[#cbd5e1] py-3 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="flex h-screen bg-[#0a0e27] overflow-hidden overflow-x-hidden"
      >
        {/* AI Panel Toggle Button */}
        <button
          onClick={toggleAiPanel}
          className="absolute z-10 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-l-lg flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          style={{
            right: isAiMinimized ? "12px" : `${aiPanelWidth + 4}px`,
            top: "50vh",
            transform: "translateY(-50%)",
          }}
          title={isAiMinimized ? "Expand AI Chat" : "Minimize AI Chat"}
        >
          {isAiMinimized ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>

        {/* Left Sidebar Toggle Button */}
        <button
          onClick={toggleLeftSidebar}
          className="absolute z-10 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-r-lg flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          style={{
            left: isLeftMinimized ? "12px" : `${leftSidebarWidth + 4}px`,
            top: "50vh",
            transform: "translateY(-50%)",
          }}
          title={isLeftMinimized ? "Expand Sections" : "Minimize Sections"}
        >
          {isLeftMinimized ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
        </button>

        {/* Left Sidebar */}
        <div
          className="bg-[#0d1230] border-r border-[#1a1f3e] overflow-hidden flex flex-col transition-all duration-300"
          style={{
            width: isLeftMinimized ? "48px" : `${leftSidebarWidth}px`,
            minWidth: isLeftMinimized ? "48px" : "250px",
            maxWidth: isLeftMinimized ? "48px" : "600px",
          }}
        >
          {!isLeftMinimized && (
            <>
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Filter sections"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:border-[#00b4d8]"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                <div className="space-y-2">
                  {course.sections.map((section, sectionIdx) => {
                    const isExpanded = expandedSections.includes(section._id);
                    const filteredLessons = section.lessons.filter(
                      (lesson) =>
                        searchFilter === "" ||
                        lesson.title
                          .toLowerCase()
                          .includes(searchFilter.toLowerCase()) ||
                        section.title
                          .toLowerCase()
                          .includes(searchFilter.toLowerCase())
                    );

                    if (
                      searchFilter &&
                      filteredLessons.length === 0 &&
                      !section.title
                        .toLowerCase()
                        .includes(searchFilter.toLowerCase())
                    ) {
                      return null;
                    }

                    return (
                      <div key={section._id} className="mb-2">
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(section._id)}
                          className="w-full flex items-center p-3 bg-[#1a1f3e] hover:bg-[#252b52] rounded-lg text-sm font-semibold text-gray-100 transition-colors text-left"
                        >
                          <span className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"
                                }
                              />
                            </svg>
                            <span>
                              Section {sectionIdx + 1}: {section.title}
                            </span>
                          </span>
                        </button>

                        {/* Section Content */}
                        {isExpanded && (
                          <div className="mt-1 ml-4 space-y-1">
                            {filteredLessons.map((lesson, lessonIdx) => {
                              const isCompleted = isLessonCompleted(
                                section._id,
                                lesson._id
                              );
                              const isCurrent =
                                viewMode === "lesson" &&
                                selectedLesson?._id === lesson._id;
                              const isUnlocked = isContentUnlocked(
                                section,
                                lessonIdx
                              );

                              return (
                                <button
                                  key={lesson._id}
                                  onClick={() =>
                                    handleLessonSelect(section, lesson)
                                  }
                                  disabled={!isUnlocked}
                                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                                    isCurrent
                                      ? "bg-[#132844] border border-[#00b4d8]/40 text-[#7dd3fc] font-medium"
                                      : isCompleted
                                      ? "bg-[#0f2a1c] text-green-300 hover:bg-[#143523]"
                                      : !isUnlocked
                                      ? "text-gray-400 cursor-not-allowed opacity-60"
                                      : "text-gray-300 hover:bg-[#1a1f3e]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="flex-1 truncate flex items-center gap-2">
                                      {!isUnlocked ? (
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                      )}
                                      {lesson.title}
                                    </span>
                                    {isCompleted && (
                                      <svg
                                        className="w-4 h-4 text-green-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              );
                            })}

                            {/* Section Quiz */}
                            {section.sectionQuiz && (
                              <button
                                onClick={() => handleQuizSelect(section)}
                                disabled={!isContentUnlocked(section)}
                                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                                  viewMode === "quiz" &&
                                  selectedSection?._id === section._id
                                    ? "bg-[#132844] border border-[#00b4d8]/40 text-[#7dd3fc] font-medium"
                                    : isSectionQuizCompleted(section._id)
                                    ? "bg-[#0f2a1c] text-green-300 hover:bg-[#143523]"
                                    : !isContentUnlocked(section)
                                    ? "text-gray-400 cursor-not-allowed opacity-60"
                                    : "text-gray-300 hover:bg-[#1a1f3e]"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    {!isContentUnlocked(section) ? (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                        />
                                      </svg>
                                    )}
                                    <span>Section Quiz</span>
                                  </span>
                                  {isSectionQuizCompleted(section._id) && (
                                    <svg
                                      className="w-4 h-4 text-green-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Certificate */}
                  {course.finalQuiz && (
                    <button
                      onClick={handleFinalQuizSelect}
                      disabled={!isFinalQuizUnlocked()}
                      className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors mb-2 ${
                        viewMode === "quiz" && selectedQuiz?._id === course.finalQuiz?._id
                          ? "bg-[#132844] border border-[#00b4d8]/40 text-[#7dd3fc]"
                          : !isFinalQuizUnlocked()
                          ? "text-gray-400 cursor-not-allowed opacity-60"
                          : "bg-[#1a1f3e] text-[#cbd5e1] hover:bg-[#252b52]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {!isFinalQuizUnlocked() ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                            />
                          </svg>
                        )}
                        <span>Final Quiz</span>
                      </span>
                    </button>
                  )}

                  {enrollment.certificateIssued && (
                    <button
                      onClick={() => setViewMode("certificate")}
                      className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors ${
                        viewMode === "certificate"
                          ? "bg-[#132844] border border-[#00b4d8]/40 text-[#7dd3fc]"
                          : "bg-gradient-to-r from-[#2a2f15] to-[#3a220f] text-yellow-200 hover:shadow-md"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <span>View Certificate</span>
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 border-t border-gray-200">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {Math.round(enrollment.overallProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1f3e] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-[#00b4d8] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.overallProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Left Sidebar Resize Handle */}
        {!isLeftMinimized && (
          <div
            onMouseDown={handleLeftMouseDown}
            className="w-1 bg-[#1a1f3e] hover:bg-[#00b4d8] cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
              <div className="w-1 h-8 bg-[#6272a4] rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Lesson Content */}
          <div ref={lessonScrollRef} className="flex-1 overflow-y-auto hide-scrollbar overflow-x-hidden">
            {viewMode === "lesson" && selectedLesson ? (
              <>
                {/* Breadcrumb */}
                <div className="bg-[#0d1230] border-b border-[#1a1f3e] px-6 py-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <button
                      onClick={handleBackClick}
                      className="hover:text-[#00b4d8]"
                    >
                      Courses
                    </button>
                    <span className="mx-2">/</span>
                    <span className="hover:text-[#00b4d8] cursor-pointer">
                      {course.title}
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-200 font-medium">
                      {selectedSection?.title}
                    </span>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto p-8 overflow-x-hidden">
                  {lessonLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <svg
                        className="animate-spin h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    <CourseLessonViewer
                      lesson={selectedLesson}
                      section={selectedSection!}
                      onNext={handleNextLesson}
                      onPrevious={handlePreviousLesson}
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between bg-[#0d1230] rounded-xl shadow-lg p-6 border border-[#1a1f3e]">
                    <button
                      onClick={handlePreviousLesson}
                      disabled={
                        course.sections[0]._id === selectedSection?._id &&
                        selectedSection.lessons[0]._id === selectedLesson._id
                      }
                      className="px-6 py-3 bg-[#1a1f3e] hover:bg-[#252b52] text-[#cbd5e1] rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-4">
                      {!isLessonCompleted(
                        selectedSection!._id,
                        selectedLesson._id
                      ) ? (
                        <button
                          onClick={handleLessonComplete}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Mark Complete
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Completed
                        </div>
                      )}
                      <button
                        onClick={handleNextLesson}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        Next
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : viewMode === "quiz" && selectedQuiz ? (
              <QuizViewer
                courseId={courseId!}
                quizId={selectedQuiz._id}
                sectionId={selectedSection?._id || null}
                isFinalQuiz={selectedQuiz?.type === "final-quiz"}
                onComplete={handleQuizComplete}
                onBack={handlePreviousLesson}
              />
            ) : viewMode === "certificate" ? (
              <CertificateViewer
                enrollment={enrollment}
                course={course}
                onBackToCourse={handleBackClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-24 h-24 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <p className="text-lg">Select a lesson to begin learning</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Resize Handle */}
          {!isAiMinimized && (
            <div
              onMouseDown={handleAiMouseDown}
              className="w-1 bg-[#1a1f3e] hover:bg-[#00b4d8] cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                <div className="w-1 h-8 bg-[#6272a4] rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          )}

          {/* AI Chat Assistant */}
          <div
            className="border-l border-[#1a1f3e] bg-[#0a0e27] overflow-hidden flex flex-col relative flex-shrink-0 transition-all duration-300"
            style={{
              width: isAiMinimized ? "48px" : `${aiPanelWidth}px`,
              minWidth: isAiMinimized ? "48px" : "250px",
              maxWidth: isAiMinimized ? "48px" : "600px",
            }}
          >
            {!isAiMinimized && (
              <AIChatAssistant
                context="course"
                contextTitle={selectedSection?.title || course.title}
                contextId={selectedSection?._id || courseId}
                contentScope={selectedLesson?.content}
                disabled={viewMode === "quiz"}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseLearningPage;

