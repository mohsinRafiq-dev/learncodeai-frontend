import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tutorial } from "../../functions/TutorialFunctions/tutorialFunctions";

/**
 * Global notification component that appears on any page
 * when an AI tutorial generation completes
 */
const AITutorialSuccessNotification: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for pending tutorial notification
    const checkForTutorial = () => {
      const tutorialData = localStorage.getItem("ai_tutorial_success");
      if (tutorialData) {
        try {
          const parsedTutorial = JSON.parse(tutorialData) as Tutorial;
          setTutorial(parsedTutorial);
          setShowModal(true);
          // Clear from localStorage
          localStorage.removeItem("ai_tutorial_success");
        } catch (error) {
          console.error("Error parsing tutorial data:", error);
          localStorage.removeItem("ai_tutorial_success");
        }
      }
    };

    // Check immediately
    checkForTutorial();

    // Also listen for storage events (in case generation completes in another tab)
    window.addEventListener("storage", checkForTutorial);

    // Poll every second for updates
    const interval = setInterval(checkForTutorial, 1000);

    return () => {
      window.removeEventListener("storage", checkForTutorial);
      clearInterval(interval);
    };
  }, []);

  const handleViewTutorial = () => {
    if (tutorial) {
      // Navigate to the tutorial detail page with the tutorial
      navigate(`/tutorials/${tutorial.language}`);

      // Store tutorial ID to auto-select it
      localStorage.setItem("auto_select_tutorial", tutorial._id);

      setShowModal(false);
      setTutorial(null);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTutorial(null);
  };

  if (!showModal || !tutorial) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-opacity-20 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-4 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
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
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Tutorial Generated Successfully! 🎉
        </h3>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">
          Your AI-generated tutorial about{" "}
          <span className="font-semibold text-purple-600">
            "{tutorial.concept}"
          </span>{" "}
          is ready.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleViewTutorial}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
          >
            View Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorialSuccessNotification;

