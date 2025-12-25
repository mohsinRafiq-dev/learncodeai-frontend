import React, { useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchTutorialsByLanguageAndConcept,
  saveTutorial,
  unsaveTutorial,
  getSavedTutorials,
  type Tutorial,
} from "../../../functions/TutorialFunctions/tutorialFunctions";
import { useAuth } from "../../../hooks/useAuth";
import AIChatAssistant from "../../../components/AIChatAssistant/AIChatAssistant";
import { tutorialAPI } from "../../../services/tutorialAPI";
import { useToast } from "../../../contexts/ToastContext";
import { exportTutorialToPDF } from "../../../utils/pdfExport";
import viewTrackingAPI from "../../../services/viewTrackingAPI";

const TutorialsDetailPage: React.FC = () => {
  const { language } = useParams<{ language: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [tutorialLoading, setTutorialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingTutorial, setSavingTutorial] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Resizable sidebar state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320); // Default width in pixels
  const [previousLeftWidth, setPreviousLeftWidth] = useState(320);
  const [isLeftResizing, setIsLeftResizing] = useState(false);
  const [isLeftMinimized, setIsLeftMinimized] = useState(false);

  // Resizable AI panel state
  const [aiPanelWidth, setAiPanelWidth] = useState(400); // Default width in pixels
  const [previousAiWidth, setPreviousAiWidth] = useState(400);
  const [isAiResizing, setIsAiResizing] = useState(false);
  const [isAiMinimized, setIsAiMinimized] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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
  React.useEffect(() => {
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
  };

  const handleTutorialSelect = async (tutorial: Tutorial) => {
    try {
      setTutorialLoading(true);

      // Track view
      if (tutorial._id) {
        viewTrackingAPI
          .trackTutorialView(tutorial._id)
          .catch((err) => console.error("Failed to track view:", err));
      }

      // Always use the tutorial data we have since backend API is failing
      // The tutorials list should have all the data we need
      setSelectedTutorial(tutorial);

      // Check if tutorial is saved
      if (isAuthenticated) {
        try {
          const savedTutorials = await getSavedTutorials();
          const isCurrentTutorialSaved = savedTutorials.data?.some(
            (saved) => saved.tutorial?._id === tutorial._id
          );
          setIsSaved(!!isCurrentTutorialSaved);
        } catch (saveCheckError) {
          setIsSaved(false);
        }
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error("Error loading tutorial details:", err);
      // Still try to show the tutorial with whatever data we have
      setSelectedTutorial(tutorial);
      setError(null); // Clear any previous errors
    } finally {
      setTutorialLoading(false);
    }
  };

  React.useEffect(() => {
    const loadTutorials = async () => {
      if (!language) return;

      try {
        setLoading(true);
        setError(null);

        const tutorialsData = await fetchTutorialsByLanguageAndConcept(
          language,
          "all"
        );

        // If authenticated, also load user's created tutorials for this language
        let userCreatedTutorials: Tutorial[] = [];
        if (isAuthenticated) {
          try {
            const createdRes = await tutorialAPI.getUserCreatedTutorials();
            userCreatedTutorials = (createdRes.data || []).filter(
              (t: Tutorial) => t.language === language.toLowerCase()
            );
          } catch (err) {
            // Silently fail if user created tutorials can't be loaded
          }
        }

        // Combine pre-generated and user's created tutorials
        const allTutorials = [...userCreatedTutorials, ...tutorialsData];

        setTutorials(allTutorials);

        // Check if there's a specific tutorial to select from URL params
        const tutorialIdFromUrl = searchParams.get("tutorialId");
        const autoSelectId = localStorage.getItem("auto_select_tutorial");
        let tutorialToSelect = allTutorials[0]; // Default to first

        // Check for auto-select from localStorage (from global notification)
        if (autoSelectId) {
          const foundTutorial = allTutorials.find(
            (t) => t._id === autoSelectId
          );
          if (foundTutorial) {
            tutorialToSelect = foundTutorial;
            localStorage.removeItem("auto_select_tutorial");
          }
        } else if (tutorialIdFromUrl) {
          const foundTutorial = allTutorials.find(
            (t) => t._id === tutorialIdFromUrl
          );
          if (foundTutorial) {
            tutorialToSelect = foundTutorial;
          }
        }

        // Auto-select tutorial (either from URL or first one)
        if (allTutorials.length > 0 && tutorialToSelect) {
          setTutorialLoading(true);
          setSelectedTutorial(tutorialToSelect);

          // Check if tutorial is saved
          if (isAuthenticated) {
            try {
              const savedTutorials = await getSavedTutorials();
              const isCurrentTutorialSaved = savedTutorials.data?.some(
                (saved) => saved.tutorial?._id === tutorialToSelect._id
              );
              setIsSaved(!!isCurrentTutorialSaved);
            } catch (saveCheckError) {
              setIsSaved(false);
            }
          } else {
            setIsSaved(false);
          }
          setTutorialLoading(false);
        }
      } catch (err) {
        console.error("Error loading tutorials:", err);
        setError("Failed to load tutorials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadTutorials();
  }, [language, isAuthenticated, searchParams]);

  const handleBackClick = () => {
    navigate("/tutorials");
  };

  // Filter tutorials based on search input
  const filteredTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tutorial.concept?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tutorial.difficulty?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleGenerateAITutorial = () => {
    if (!isAuthenticated) {
      showToast("Please login to generate tutorials", "error");
      return;
    }
    setShowAIModal(true);
  };

  const handleGenerateTutorial = async () => {
    if (!aiTopicInput.trim()) {
      showToast("Please enter a topic name", "error");
      return;
    }

    if (!language) {
      showToast("Language not specified", "error");
      return;
    }

    // Close modal immediately and start generation
    setShowAIModal(false);
    const topic = aiTopicInput.trim();
    setAiTopicInput("");

    setIsGenerating(true);
    showToast(
      `Generating tutorial about "${topic}"... This may take 10-20 seconds.`,
      "info"
    );

    try {
      // Create the tutorial data - AI will generate the content on backend
      const tutorialData = {
        language: language.toLowerCase(),
        concept: topic,
        difficulty: "beginner",
        tags: ["AI-generated", "personal", language],
      };

      // Call the API to create the tutorial - backend will use OpenAI to generate content
      const response = await tutorialAPI.createTutorial(tutorialData);

      if (response.success) {
        const newTutorial = response.data;

        // Add the new tutorial to the list
        setTutorials((prev) => [newTutorial, ...prev]);

        // Store in localStorage for global notification
        localStorage.setItem(
          "ai_tutorial_success",
          JSON.stringify(newTutorial)
        );

        showToast("Tutorial generated successfully!", "success");
      } else {
        showToast("Failed to generate tutorial", "error");
      }
    } catch (error: unknown) {
      console.error("Error generating tutorial:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to generate tutorial"
          : "Failed to generate tutorial";
      showToast(errorMessage, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseAIModal = () => {
    setShowAIModal(false);
    setAiTopicInput("");
  };

  // Map tutorial language to editor language ID
  const mapLanguageToEditorId = (language: string): string => {
    const languageMap: { [key: string]: string } = {
      javascript: "javascript",
      js: "javascript",
      python: "python",
      py: "python",
      cpp: "cpp",
      "c++": "cpp",
    };
    return languageMap[language.toLowerCase()] || "python";
  };

  const handleNextTutorial = () => {
    if (!selectedTutorial || tutorials.length === 0) return;

    const currentIndex = tutorials.findIndex(
      (t) => t._id === selectedTutorial._id
    );
    if (currentIndex < tutorials.length - 1) {
      handleTutorialSelect(tutorials[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousTutorial = () => {
    if (!selectedTutorial || tutorials.length === 0) return;

    const currentIndex = tutorials.findIndex(
      (t) => t._id === selectedTutorial._id
    );
    if (currentIndex > 0) {
      handleTutorialSelect(tutorials[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveTutorial = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (!selectedTutorial?._id) return;

    try {
      setSavingTutorial(true);

      if (isSaved) {
        await unsaveTutorial(selectedTutorial._id);
        setIsSaved(false);
      } else {
        await saveTutorial(selectedTutorial._id);
        setIsSaved(true);
      }
    } catch (error: unknown) {
      console.error("Error saving/unsaving tutorial:", error);
      // If the error is "already saved", just update the UI state
      if (error instanceof Error && error.message?.includes("already saved")) {
        setIsSaved(true);
      } else {
        // Show error to user for other errors
        const message =
          error instanceof Error
            ? error.message
            : "Failed to save tutorial. Please try again.";
        alert(message);
      }
    } finally {
      setSavingTutorial(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading {language} tutorials...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div
        ref={containerRef}
        className="flex h-screen bg-gray-50 overflow-hidden overflow-x-hidden"
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
          title={isLeftMinimized ? "Expand Tutorials" : "Minimize Tutorials"}
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
          className="bg-white border-r border-gray-200 overflow-hidden flex flex-col transition-all duration-300"
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
                  placeholder="Filter tutorials"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                <div className="space-y-2">
                  {filteredTutorials.length > 0 ? (
                    filteredTutorials.map((tutorial) => {
                      const isPersonal =
                        tutorial.tags?.includes("personal") ||
                        tutorial.tags?.includes("AI-generated");
                      return (
                        <div
                          key={tutorial._id}
                          onClick={() => handleTutorialSelect(tutorial)}
                          className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                            selectedTutorial?._id === tutorial._id
                              ? "bg-blue-50 border border-blue-200 text-blue-800"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="font-medium mb-1 flex items-center gap-2">
                            <span>• {tutorial.title}</span>
                            {isPersonal && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                My
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <svg
                        className="w-12 h-12 mx-auto mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No tutorials found
                    </div>
                  )}
                </div>
              </div>

              {/* Generate with AI Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleGenerateAITutorial}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Left Sidebar Resize Handle */}
        {!isLeftMinimized && (
          <div
            onMouseDown={handleLeftMouseDown}
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
              <div className="w-1 h-8 bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Tutorial Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar overflow-x-hidden min-w-0">
            {selectedTutorial ? (
              <>
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200 px-6 py-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <button
                      onClick={handleBackClick}
                      className="hover:text-blue-600"
                    >
                      Home
                    </button>
                    <span className="mx-2">/</span>
                    <span className="hover:text-blue-600 cursor-pointer">
                      {selectedTutorial.language}
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">
                      {selectedTutorial.concept}
                    </span>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto p-8 overflow-x-hidden">
                  {tutorialLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <>
                      {/* Tutorial Header */}
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {selectedTutorial.title}
                        </h1>

                        {selectedTutorial.description && (
                          <p className="text-gray-700 mb-6">
                            {selectedTutorial.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {selectedTutorial.language.toUpperCase()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                                selectedTutorial.difficulty
                              )}`}
                            >
                              {selectedTutorial.difficulty}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <button
                              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-purple-50 text-purple-600 border border-purple-200 hover:shadow-md hover:bg-purple-100"
                              onClick={() =>
                                exportTutorialToPDF(selectedTutorial)
                              }
                              title="Export as PDF"
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
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              PDF
                            </button>
                            <button
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isSaved
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-blue-50 text-blue-600 border border-blue-200"
                              } ${
                                savingTutorial
                                  ? "opacity-60"
                                  : "hover:shadow-md"
                              }`}
                              onClick={handleSaveTutorial}
                              disabled={savingTutorial}
                            >
                              {isSaved ? (
                                <>
                                  <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Saved
                                </>
                              ) : (
                                <>
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
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                  Save
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Tutorial Content */}
                      {selectedTutorial.content &&
                        selectedTutorial.content.length > 0 && (
                          <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              Content
                            </h2>
                            <div className="prose prose-lg max-w-none bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
                              {selectedTutorial.content
                                .split("\n")
                                .map((line, index) => {
                                  // Render Markdown-style content as HTML
                                  if (line.startsWith("## ")) {
                                    return (
                                      <h2
                                        key={index}
                                        className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-6 mb-3 pb-2 border-b-2 border-purple-300"
                                      >
                                        {line.replace("## ", "")}
                                      </h2>
                                    );
                                  } else if (line.startsWith("### ")) {
                                    return (
                                      <h3
                                        key={index}
                                        className="text-xl font-semibold text-indigo-700 mt-4 mb-2 flex items-center gap-2"
                                      >
                                        <span className="text-indigo-500">
                                          ▸
                                        </span>
                                        {line.replace("### ", "")}
                                      </h3>
                                    );
                                  } else if (
                                    line.startsWith("- **") &&
                                    line.includes("**:")
                                  ) {
                                    const match =
                                      line.match(/- \*\*(.*?)\*\*:(.*)/);
                                    if (match) {
                                      return (
                                        <li
                                          key={index}
                                          className="ml-4 text-gray-700 bg-blue-50 py-2 px-3 rounded-md mb-2"
                                        >
                                          <strong className="text-blue-700">
                                            {match[1]}
                                          </strong>
                                          :
                                          <span className="text-gray-800">
                                            {match[2]}
                                          </span>
                                        </li>
                                      );
                                    }
                                    return (
                                      <li
                                        key={index}
                                        className="ml-4 text-gray-700 py-1"
                                      >
                                        {line.replace("- ", "")}
                                      </li>
                                    );
                                  } else if (line.startsWith("- ")) {
                                    return (
                                      <li
                                        key={index}
                                        className="ml-4 text-gray-700 py-1 hover:text-gray-900"
                                      >
                                        <span className="text-purple-500 mr-2">
                                          ●
                                        </span>
                                        {line.replace("- ", "")}
                                      </li>
                                    );
                                  } else if (line.trim() === "") {
                                    return <br key={index} />;
                                  } else if (line.includes("**")) {
                                    // Handle bold text
                                    const parts = line.split("**");
                                    return (
                                      <p
                                        key={index}
                                        className="text-gray-700 mb-2 leading-relaxed"
                                      >
                                        {parts.map((part, i) =>
                                          i % 2 === 1 ? (
                                            <strong
                                              key={i}
                                              className="text-gray-900 font-semibold"
                                            >
                                              {part}
                                            </strong>
                                          ) : (
                                            part
                                          )
                                        )}
                                      </p>
                                    );
                                  } else {
                                    return (
                                      <p
                                        key={index}
                                        className="text-gray-700 mb-2 leading-relaxed"
                                      >
                                        {line}
                                      </p>
                                    );
                                  }
                                })}
                            </div>
                          </div>
                        )}
                      {/* Code Examples */}
                      {selectedTutorial.codeExamples &&
                        selectedTutorial.codeExamples.length > 0 && (
                          <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                              </svg>
                              Code Examples
                            </h2>
                            {selectedTutorial.codeExamples.map(
                              (example, index) => (
                                <div key={index} className="mb-6">
                                  {example.description && (
                                    <p className="text-gray-700 mb-3 font-medium">
                                      {example.description}
                                    </p>
                                  )}
                                  <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg">
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                                      <span className="text-white text-sm font-medium">
                                        {example.title}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                                          onClick={() => {
                                            navigate("/editor", {
                                              state: {
                                                code: example.code,
                                                language: mapLanguageToEditorId(
                                                  selectedTutorial.language
                                                ),
                                              },
                                            });
                                          }}
                                        >
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
                                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span>Run Code</span>
                                        </button>
                                        <button
                                          className="flex items-center space-x-1 text-white text-sm hover:text-gray-300"
                                          onClick={() =>
                                            navigator.clipboard.writeText(
                                              example.code
                                            )
                                          }
                                        >
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
                                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                          </svg>
                                          <span>Copy</span>
                                        </button>
                                      </div>
                                    </div>
                                    <pre className="p-4 text-sm text-gray-100 overflow-x-auto hide-scrollbar max-w-full">
                                      <code className="break-words">
                                        {example.code}
                                      </code>
                                    </pre>
                                  </div>

                                  {/* Input/Output Section */}
                                  {(example.input ||
                                    example.expectedOutput) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                      {example.input && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                          <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                            Input:
                                          </h4>
                                          <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                                            {example.input}
                                          </pre>
                                        </div>
                                      )}
                                      {example.expectedOutput && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                          <h4 className="text-sm font-semibold text-green-900 mb-2">
                                            Expected Output:
                                          </h4>
                                          <pre className="text-sm text-green-800 whitespace-pre-wrap">
                                            {example.expectedOutput}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {/* Key Takeaways Box */}
                      {selectedTutorial.notes &&
                        selectedTutorial.notes.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 mb-8 border-2 border-blue-300 shadow-md">
                            <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                              <svg
                                className="w-6 h-6 text-indigo-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Key Takeaways
                            </h2>
                            <ul className="space-y-3">
                              {selectedTutorial.notes.map((note, index) => (
                                <li
                                  key={index}
                                  className="flex items-start bg-white rounded-lg p-3 shadow-sm"
                                >
                                  <span className="text-indigo-600 mr-3 text-lg font-bold">
                                    ✓
                                  </span>
                                  <span className="text-gray-800 font-medium">
                                    {note}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      {/* Tips Section */}
                      {selectedTutorial.tips &&
                        selectedTutorial.tips.length > 0 && (
                          <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <svg
                                className="w-6 h-6 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                              </svg>
                              Pro Tips
                            </h2>
                            <div className="space-y-3">
                              {selectedTutorial.tips.map((tip, index) => (
                                <div
                                  key={index}
                                  className="flex space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition-shadow"
                                >
                                  <div className="text-yellow-600 flex-shrink-0">
                                    <svg
                                      className="w-6 h-6"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-800 font-medium">
                                    {tip}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {/* Tags Section */}
                      {selectedTutorial.tags &&
                        selectedTutorial.tags.length > 0 && (
                          <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-pink-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                              {selectedTutorial.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-300 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                        <button
                          onClick={handlePreviousTutorial}
                          disabled={
                            !selectedTutorial ||
                            tutorials.findIndex(
                              (t) => t._id === selectedTutorial._id
                            ) === 0
                          }
                          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>←</span>
                          <span>Previous</span>
                        </button>
                        <button
                          onClick={handleNextTutorial}
                          disabled={
                            !selectedTutorial ||
                            tutorials.findIndex(
                              (t) => t._id === selectedTutorial._id
                            ) ===
                              tutorials.length - 1
                          }
                          className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>Next</span>
                          <span>→</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">👆</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Tutorial
                  </h2>
                  <p className="text-gray-600">
                    Choose a tutorial from the sidebar to get started
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Resize Handle */}
          {!isAiMinimized && (
            <div
              onMouseDown={handleAiMouseDown}
              className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                <div className="w-1 h-8 bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          )}

          {/* AI Assistant Panel */}
          <div
            className="bg-white flex-shrink-0 transition-all duration-300 overflow-hidden relative"
            style={{
              width: isAiMinimized ? "48px" : `${aiPanelWidth}px`,
              minWidth: isAiMinimized ? "48px" : "250px",
              maxWidth: isAiMinimized ? "48px" : "600px",
            }}
          >
            {!isAiMinimized && (
              <AIChatAssistant
                context="tutorial"
                contextTitle={selectedTutorial?.title}
                contextId={selectedTutorial?._id}
                contentScope={selectedTutorial?.content}
              />
            )}
          </div>
        </div>

        {/* AI Tutorial Generation Modal */}
        {showAIModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Generate Tutorial
                </h2>
                <button
                  onClick={handleCloseAIModal}
                  disabled={isGenerating}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-1">
                  Creating{" "}
                  <span className="font-semibold text-purple-600">
                    personal tutorial
                  </span>{" "}
                  for:{" "}
                  <span className="font-semibold text-gray-900">
                    {language?.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  This tutorial will be created for you and saved to your
                  account.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic / Concept Name
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !isGenerating &&
                    handleGenerateTutorial()
                  }
                  placeholder={`e.g., ${
                    language === "python"
                      ? "List Comprehensions"
                      : language === "javascript"
                      ? "Arrow Functions"
                      : "Pointers and References"
                  }`}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseAIModal}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTutorial}
                  disabled={isGenerating || !aiTopicInput.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Generate
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                  <span className="font-semibold">💡 Tip:</span> The AI will
                  generate a personal tutorial with examples and code snippets.
                  This tutorial will be saved to your account and you can edit
                  it anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TutorialsDetailPage;

