import { useLocation } from "react-router-dom";
import AiAssistantPanel from "./Components/AiAssistantPanel";
import CodeEditor from "./Components/CodeEditor";
import React, { useState, useRef, useCallback } from "react";

function EditorPage() {
  const location = useLocation();
  const [editorState, setEditorState] = useState({
    code: "",
    language: "python",
    error: "",
    problems: [] as any[],
  });

  // Gentle scroll prevention without interfering with page layout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Resizable AI panel state
  const [aiPanelWidth, setAiPanelWidth] = useState(400); // Default width in pixels
  const [previousWidth, setPreviousWidth] = useState(400); // Store width when minimized
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    
    // Set min/max width constraints
    const minWidth = 250;
    const maxWidth = Math.min(containerRect.width * 0.6, 800); // Max 60% of container or 800px
    
    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    setAiPanelWidth(clampedWidth);
    setPreviousWidth(clampedWidth); // Store as previous width
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse event listeners
  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isResizing) {
        handleMouseMove(e);
      }
    };

    const handleUp = () => {
      if (isResizing) {
        handleMouseUp();
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle window resize to keep AI panel within bounds
  React.useEffect(() => {
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

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [aiPanelWidth, isMinimized]);

  const toggleMinimize = () => {
    if (isMinimized) {
      // When expanding, restore previous width but validate against current screen size
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxAllowedWidth = Math.min(containerRect.width * 0.6, 800);
        const targetWidth = Math.min(previousWidth, maxAllowedWidth);
        const finalWidth = Math.max(250, targetWidth); // Ensure minimum width
        
        setAiPanelWidth(finalWidth);
      }
    } else {
      // When minimizing, store current width
      setPreviousWidth(aiPanelWidth);
    }
    setIsMinimized(!isMinimized);
  };

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden">
      {/* Code Editor - takes remaining space */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <CodeEditor 
          initialCode={state?.code}
          initialLanguage={state?.language}
          onStateChange={setEditorState}
        />
      </div>
      
      {/* Resize Handle */}
      {!isMinimized && (
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-150 relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}
      
      {/* AI Panel with toggle button */}
      <div 
        className={`relative bg-gray-50 transition-all duration-300 flex-shrink-0 ${
          isMinimized ? 'w-12' : ''
        }`}
        style={{ 
          width: isMinimized ? '48px' : `${Math.min(aiPanelWidth, window.innerWidth * 0.6)}px`,
          minWidth: isMinimized ? '48px' : '250px',
          maxWidth: isMinimized ? '48px' : '800px'
        }}
      >
        {/* Minimize/Maximize Toggle */}
        <button
          onClick={toggleMinimize}
          className="absolute top-2 left-2 z-10 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
          title={isMinimized ? "Expand AI Chat" : "Minimize AI Chat"}
        >
          {isMinimized ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        
        {!isMinimized && (
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

