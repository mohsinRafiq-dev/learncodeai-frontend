import { useLocation } from "react-router-dom";
import AiAssistantPanel from "./Components/AiAssistantPanel";
import CodeEditor from "./Components/CodeEditor";
import React, { useState, useRef, useCallback, useEffect } from "react";

// Side-by-side editor + AI panel layout that collapses to a tab switcher
// on screens narrower than ~1024px (Tailwind's `lg` breakpoint).
function EditorPage() {
  const location = useLocation();
  const [editorState, setEditorState] = useState({
    code: "",
    language: "python",
    error: "",
    problems: [] as any[],
  });

  // Gentle scroll prevention without interfering with page layout
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Desktop AI panel resize state
  const [aiPanelWidth, setAiPanelWidth] = useState(400);
  const [previousWidth, setPreviousWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track viewport so we can switch between mobile (tabs) and desktop (split)
  const [isDesktop, setIsDesktop] = useState(
    typeof window === "undefined" ? true : window.innerWidth >= 1024
  );
  // Mobile-only: which panel is currently showing
  const [activePanel, setActivePanel] = useState<"editor" | "ai">("editor");

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const state = location.state as {
    code?: string;
    language?: string;
  } | null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    const minWidth = 250;
    const maxWidth = Math.min(containerRect.width * 0.6, 800);
    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    setAiPanelWidth(clampedWidth);
    setPreviousWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => isResizing && handleMouseMove(e);
    const handleUp = () => isResizing && handleMouseUp();
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    if (isResizing) {
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
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Keep AI panel within bounds when desktop window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      if (!isMinimized && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxAllowedWidth = Math.min(containerRect.width * 0.6, 800);
        if (aiPanelWidth > maxAllowedWidth) {
          const newWidth = Math.max(250, maxAllowedWidth);
          setAiPanelWidth(newWidth);
          setPreviousWidth(newWidth);
        }
      }
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [aiPanelWidth, isMinimized]);

  const toggleMinimize = () => {
    if (isMinimized) {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxAllowedWidth = Math.min(containerRect.width * 0.6, 800);
        const targetWidth = Math.min(previousWidth, maxAllowedWidth);
        setAiPanelWidth(Math.max(250, targetWidth));
      }
    } else {
      setPreviousWidth(aiPanelWidth);
    }
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0a0e27]"
    >
      {/* Mobile-only tab switcher */}
      <div className="lg:hidden flex items-center bg-[#0d1230] border-b border-[#1a1f3e] px-2 py-2 gap-2 flex-shrink-0">
        <button
          onClick={() => setActivePanel("editor")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activePanel === "editor"
              ? "bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setActivePanel("ai")}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activePanel === "ai"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Code editor — full width on mobile when active; flexible on desktop */}
      <div
        className={`${
          isDesktop || activePanel === "editor" ? "flex" : "hidden"
        } flex-1 min-w-0 min-h-0 overflow-hidden`}
      >
        <CodeEditor
          initialCode={state?.code}
          initialLanguage={state?.language}
          onStateChange={setEditorState}
        />
      </div>

      {/* Resize handle — desktop only */}
      {isDesktop && !isMinimized && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:block w-1 bg-[#1a1f3e] hover:bg-[#00b4d8] cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-8 bg-[#8b5cf6] rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}

      {/* AI panel */}
      <div
        className={`relative bg-[#0d1230] lg:border-l border-[#1a1f3e] transition-all duration-300 ${
          isDesktop ? "flex-shrink-0" : "flex-1 min-h-0"
        } ${
          // mobile: show only when active. desktop: always show, but respect minimize
          !isDesktop && activePanel !== "ai" ? "hidden" : "flex"
        } flex-col`}
        style={
          isDesktop
            ? {
                width: isMinimized
                  ? "48px"
                  : `${Math.min(aiPanelWidth, window.innerWidth * 0.6)}px`,
                minWidth: isMinimized ? "48px" : "250px",
                maxWidth: isMinimized ? "48px" : "800px",
              }
            : undefined
        }
      >
        {/* Minimize / Maximize toggle — desktop only */}
        {isDesktop && (
          <button
            onClick={toggleMinimize}
            className="absolute top-2 left-2 z-10 w-8 h-8 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] hover:from-[#7c3aed] hover:to-[#8b5cf6] text-white rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-200 transform hover:scale-105 hover:shadow-purple-500/40"
            title={isMinimized ? "Expand AI Chat" : "Minimize AI Chat"}
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
                d={isMinimized ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        )}

        {(!isDesktop || !isMinimized) && (
          <AiAssistantPanel
            code={editorState.code}
            language={editorState.language}
            error={editorState.error}
            problems={editorState.problems}
          />
        )}
      </div>
    </div>
  );
}

export default EditorPage;
