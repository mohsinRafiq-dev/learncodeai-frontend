import React, { useState, useRef, useEffect } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  handleLanguageChange,
  languageOptions,
  getDefaultCodeForLanguage,
} from "../../../functions";
import { codeAPI } from "../../../services/api";
import { snippetAPI, type CodeSnippet } from "../../../services/snippetAPI";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import {
  checkPythonSyntax,
  checkJavaScriptSyntax,
  checkCppSyntax,
  type ValidationError,
} from "../../../utils/codeValidation";

// Local Storage keys for code persistence
const STORAGE_KEYS = {
  CODE: "LearnCode AI_editor_code",
  LANGUAGE: "LearnCode AI_editor_language",
  INPUT: "LearnCode AI_editor_input",
};

// Functions for localStorage persistence
const saveCodeToStorage = (code: string, language: string, input: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CODE, code);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    localStorage.setItem(STORAGE_KEYS.INPUT, input);
  } catch (error) {
    console.warn("Failed to save code to localStorage:", error);
  }
};

const loadCodeFromStorage = () => {
  try {
    return {
      code: localStorage.getItem(STORAGE_KEYS.CODE),
      language: localStorage.getItem(STORAGE_KEYS.LANGUAGE),
      input: localStorage.getItem(STORAGE_KEYS.INPUT),
    };
  } catch (error) {
    console.warn("Failed to load code from localStorage:", error);
    return { code: null, language: null, input: null };
  }
};

const clearCodeFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CODE);
    localStorage.removeItem(STORAGE_KEYS.LANGUAGE);
    localStorage.removeItem(STORAGE_KEYS.INPUT);
  } catch (error) {
    console.warn("Failed to clear code from localStorage:", error);
  }
};

export interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onStateChange?: (state: {
    code: string;
    language: string;
    error: string;
    problems: any[];
  }) => void;
}

export default function CodeEditor({
  initialCode,
  initialLanguage,
  onStateChange,
}: CodeEditorProps) {
  // Load from localStorage if no initial values provided
  const savedData = loadCodeFromStorage();
  const getInitialCode = () => {
    if (initialCode) return initialCode;
    if (savedData.code) return savedData.code;
    return getDefaultCodeForLanguage(
      initialLanguage || savedData.language || "python"
    );
  };
  const getInitialLanguage = () => {
    if (initialLanguage) return initialLanguage;
    if (savedData.language) return savedData.language;
    return "python";
  };
  const getInitialInput = () => {
    return savedData.input || "";
  };

  // --- Your Existing State and Refs ---
  const [code, setCode] = useState(getInitialCode());
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(getInitialLanguage());
  const [input, setInput] = useState(getInitialInput());
  const outputEndRef = useRef<HTMLDivElement>(null);

  // --- New State for Tabs ---
  const [activeTab, setActiveTab] = useState<"output" | "input" | "problems">(
    "output"
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState("code");

  // --- Monaco Editor Enhanced Features ---
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [wordWrap, setWordWrap] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // --- Bottom Panel Resize State ---
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const [isBottomPanelMinimized, setIsBottomPanelMinimized] = useState(false);
  const [isBottomResizing, setIsBottomResizing] = useState(false);
  const bottomPanelRef = useRef<HTMLDivElement>(null);

  // --- State for Error Detection ---
  const [problems, setProblems] = useState<
    Array<{
      severity: "error" | "warning" | "info";
      message: string;
      line: number;
      column: number;
    }>
  >([]);
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monacoRef = useRef<Monaco | null>(null);

  // --- State for Saved Snippets ---
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    snippetId: string | null;
  }>({
    show: false,
    snippetId: null,
  });

  // --- Load Snippets on Mount ---
  useEffect(() => {
    if (isAuthenticated) {
      loadSnippets();
    }
  }, [isAuthenticated]);

  // --- Prevent auto-scroll on mount ---
  useEffect(() => {
    // Gentle scroll correction after mount
    const timer = setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // --- Show recovery notification if code was loaded from localStorage ---
  useEffect(() => {
    const savedData = loadCodeFromStorage();
    if (
      !initialCode &&
      savedData.code &&
      savedData.code !==
        getDefaultCodeForLanguage(savedData.language || "python")
    ) {
      showToast("💾 Code recovered from previous session", "info");
    }
  }, []);

  // --- Update parent component with code changes in real-time ---
  useEffect(() => {
    // Notify parent of code changes immediately
    onStateChange?.({ code, language, error: "", problems });
  }, [code, language, problems, onStateChange]);

  // --- Save code to localStorage whenever it changes ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCodeToStorage(code, language, input);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [code, language, input]);

  const loadSnippets = async () => {
    try {
      setLoadingSnippets(true);
      const result = await snippetAPI.getUserSnippets();
      setSnippets(result.data);
    } catch (error) {
      console.error("Error loading snippets:", error);
    } finally {
      setLoadingSnippets(false);
    }
  };

  const handleSaveSnippet = async () => {
    if (!saveTitle.trim()) return;

    try {
      await snippetAPI.createSnippet({
        title: saveTitle.trim(),
        language,
        code,
        output,
      });
      setSaveTitle("");
      setShowSaveModal(false);
      await loadSnippets();
      showToast("Code snippet saved successfully!", "success");
    } catch (error) {
      console.error("Error saving snippet:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save snippet",
        "error"
      );
    }
  };

  const handleLoadSnippet = async (snippet: CodeSnippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setOutput(snippet.output || "");
    setShowSnippetsPanel(false);
    clearCodeFromStorage(); // Clear since we're intentionally loading new code
    showToast("Code snippet loaded!", "success");
  };

  const confirmDeleteSnippet = (id: string) => {
    setDeleteConfirm({ show: true, snippetId: id });
  };

  const handleDeleteSnippet = async () => {
    if (!deleteConfirm.snippetId) return;

    try {
      await snippetAPI.deleteSnippet(deleteConfirm.snippetId);
      await loadSnippets();
      showToast("Snippet deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting snippet:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to delete snippet",
        "error"
      );
    } finally {
      setDeleteConfirm({ show: false, snippetId: null });
    }
  };

  // --- Your Existing Functions (Unchanged) ---
  const runCode = async () => {
    setLoading(true);
    setOutput("");
    setActiveTab("output");

    try {
      const codeNeedsInput =
        code.includes("input(") ||
        code.includes("cin >>") ||
        code.includes("process.stdin");

      if (!input.trim() && codeNeedsInput) {
        setOutput(
          "⚠ Your code requires input!\n\nPlease provide input in the 'Input' tab.\nEach input should be on a separate line.\n\nExample:\nAlice\n25"
        );
        setLoading(false);
        return;
      }

      const result = await codeAPI.executeCode(code, language, input);

      if (result.success) {
        setOutput(result.data?.output || "No output");
        // Notify parent of state
        onStateChange?.({ code, language, error: "", problems });
      } else {
        const errorMsg = result.error || "Execution failed";
        setOutput(errorMsg);
        // Notify parent of error
        onStateChange?.({ code, language, error: errorMsg, problems });
      }
    } catch (error: unknown) {
      const executionError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMsg =
        executionError?.response?.data?.message ||
        "Error: Failed to execute code. Please try again.";
      setOutput(errorMsg);
      // Notify parent of error
      onStateChange?.({ code, language, error: errorMsg, problems });
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (newLanguage: string) => {
    handleLanguageChange(newLanguage, setLanguage, setCode);
    setOutput("");
    setProblems([]);
    clearCodeFromStorage(); // Clear since we're intentionally changing language
  };

  // Handle Monaco Editor mount
  const handleEditorDidMount = (
    editor: monacoType.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco's JavaScript validation
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      checkJs: true,
      strict: false, // Less strict for code playground
    });

    // Add custom actions and keyboard shortcuts
    addCustomActions(editor, monaco);

    // Validate on initial mount
    validateCode(code, language, monaco, editor);
  };

  // Validate code and update markers
  const validateCode = async (
    code: string,
    lang: string,
    monaco: Monaco,
    editor: monacoType.editor.IStandaloneCodeEditor
  ) => {
    const model = editor.getModel();
    if (!model) return;

    const markers: monacoType.editor.IMarkerData[] = [];
    const newProblems: typeof problems = [];

    try {
      let errors: ValidationError[] = [];

      if (lang === "python") {
        errors = checkPythonSyntax(code);
        // For Python/C++, we set our own markers
        errors.forEach((error) => {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: error.message,
            startLineNumber: error.line,
            startColumn: error.column,
            endLineNumber: error.line,
            endColumn: error.column + 10,
          });
        });
        monaco.editor.setModelMarkers(model, "owner", markers);
      } else if (lang === "javascript") {
        // For JavaScript, get Monaco's built-in validation results
        errors = await checkJavaScriptSyntax(code, editor);
        // Don't set markers manually - Monaco handles this automatically
      } else if (lang === "cpp") {
        errors = checkCppSyntax(code);
        // For Python/C++, we set our own markers
        errors.forEach((error) => {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: error.message,
            startLineNumber: error.line,
            startColumn: error.column,
            endLineNumber: error.line,
            endColumn: error.column + 10,
          });
        });
        monaco.editor.setModelMarkers(model, "owner", markers);
      }

      // Update problems panel for all languages
      errors.forEach((error) => {
        newProblems.push({
          severity: "error",
          message: error.message,
          line: error.line,
          column: error.column,
        });
      });
    } catch (e) {
      console.error("Validation error:", e);
    }

    setProblems(newProblems);
  };

  // Re-validate when code or language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const timeoutId = setTimeout(() => {
        validateCode(code, language, monacoRef.current!, editorRef.current!);
      }, 500); // Debounce validation

      return () => clearTimeout(timeoutId);
    }
  }, [code, language]);

  // Format code based on language
  const formatCode = async () => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    try {
      if (language === "javascript") {
        // Use Monaco's built-in JavaScript formatter
        await editor.getAction("editor.action.formatDocument")?.run();
      } else if (language === "python") {
        // Custom Python formatting
        const currentCode = editor.getValue();
        const formattedCode = formatPythonCode(currentCode);
        if (formattedCode !== currentCode) {
          editor.setValue(formattedCode);
        }
      } else if (language === "cpp") {
        // Custom C++ formatting
        const currentCode = editor.getValue();
        const formattedCode = formatCppCode(currentCode);
        if (formattedCode !== currentCode) {
          editor.setValue(formattedCode);
        }
      }
    } catch (error) {
      console.error("Error formatting code:", error);
    }
  };

  // Python code formatter
  const formatPythonCode = (code: string): string => {
    const lines = code.split("\n");
    const formattedLines: string[] = [];
    const indentSize = 4; // 4 spaces per indent level
    let consecutiveEmptyLines = 0;
    const maxConsecutiveEmptyLines = 2; // Allow max 2 consecutive empty lines
    
    // Track the actual indentation from the original code
    // This preserves the user's intended structure
    const getIndentLevel = (line: string): number => {
      const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
      return Math.floor(leadingSpaces / indentSize);
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Handle empty lines - limit consecutive empty lines
      if (!trimmed) {
        consecutiveEmptyLines++;
        if (consecutiveEmptyLines <= maxConsecutiveEmptyLines) {
          formattedLines.push("");
        }
        return;
      }

      // Reset empty line counter when we hit content
      consecutiveEmptyLines = 0;

      // Get the original indent level
      const originalIndent = getIndentLevel(line);
      
      // Apply the original indent (preserving structure)
      const indent = " ".repeat(originalIndent * indentSize);
      formattedLines.push(indent + trimmed);
    });

    // Remove trailing empty lines but keep one
    while (
      formattedLines.length > 1 &&
      formattedLines[formattedLines.length - 1] === ""
    ) {
      formattedLines.pop();
    }

    // Ensure file ends with single newline
    if (
      formattedLines.length > 0 &&
      formattedLines[formattedLines.length - 1] !== ""
    ) {
      formattedLines.push("");
    }

    return formattedLines.join("\n");
  };

  // C++ code formatter
  const formatCppCode = (code: string): string => {
    const lines = code.split("\n");
    const formattedLines: string[] = [];
    let indentLevel = 0;
    const indentSize = 4; // 4 spaces per indent level
    let consecutiveEmptyLines = 0;
    const maxConsecutiveEmptyLines = 1; // Allow max 1 consecutive empty line for C++

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Handle empty lines - limit consecutive empty lines
      if (!trimmed) {
        consecutiveEmptyLines++;
        if (consecutiveEmptyLines <= maxConsecutiveEmptyLines) {
          formattedLines.push("");
        }
        return;
      }

      // Reset empty line counter when we hit content
      consecutiveEmptyLines = 0;

      // Preserve preprocessor directives without modification
      if (trimmed.startsWith("#")) {
        formattedLines.push(trimmed);
        return;
      }

      // Decrease indent for closing braces
      if (trimmed.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Apply current indent
      const indent = " ".repeat(indentLevel * indentSize);
      formattedLines.push(indent + trimmed);

      // Increase indent for opening braces and certain keywords
      if (
        trimmed.endsWith("{") ||
        trimmed.match(/^(if|else|for|while|do|switch)\b.*[^{]$/)
      ) {
        indentLevel += 1;
      }

      // Handle special cases
      if (trimmed.match(/^(case|default)\b/)) {
        // Case statements might need special handling
      }
    });

    // Remove trailing empty lines but keep one
    while (
      formattedLines.length > 1 &&
      formattedLines[formattedLines.length - 1] === ""
    ) {
      formattedLines.pop();
    }

    // Ensure file ends with single newline
    if (
      formattedLines.length > 0 &&
      formattedLines[formattedLines.length - 1] !== ""
    ) {
      formattedLines.push("");
    }

    return formattedLines.join("\n");
  };

  // Monaco Editor feature handlers
  const changeTheme = (newTheme: string) => {
    setEditorTheme(newTheme);
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(newTheme);
    }
  };

  const toggleWordWrap = () => {
    const newWrap = !wordWrap;
    setWordWrap(newWrap);
    if (editorRef.current) {
      editorRef.current.updateOptions({
        wordWrap: newWrap ? "on" : "off",
      });
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(8, Math.min(32, fontSize + delta));
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: newSize,
      });
    }
  };

  const toggleMinimap = () => {
    const newMinimap = !showMinimap;
    setShowMinimap(newMinimap);
    if (editorRef.current) {
      editorRef.current.updateOptions({
        minimap: { enabled: newMinimap },
      });
    }
  };

  // Bottom Panel Resize Handlers
  const handleBottomResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBottomResizing(true);
  };

  const handleBottomResize = React.useCallback((e: MouseEvent) => {
    if (!bottomPanelRef.current) return;

    const containerRect =
      bottomPanelRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const newHeight = containerRect.bottom - e.clientY;
    const minHeight = 100;
    const maxHeight = containerRect.height * 0.7; // Max 70% of container height

    const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    setBottomPanelHeight(clampedHeight);
  }, []);

  const handleBottomResizeEnd = React.useCallback(() => {
    setIsBottomResizing(false);
  }, []);

  // Bottom panel resize event listeners
  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isBottomResizing) {
        handleBottomResize(e);
      }
    };

    const handleUp = () => {
      if (isBottomResizing) {
        handleBottomResizeEnd();
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    if (isBottomResizing) {
      document.body.style.cursor = "row-resize";
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
  }, [isBottomResizing, handleBottomResize, handleBottomResizeEnd]);

  const toggleBottomPanel = () => {
    setIsBottomPanelMinimized(!isBottomPanelMinimized);
  };

  // Add custom keyboard shortcuts
  const addCustomActions = (
    editor: monacoType.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    // Add custom keyboard shortcuts
    editor.addAction({
      id: "increase-font-size",
      label: "Increase Font Size",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal],
      run: () => changeFontSize(2),
    });

    editor.addAction({
      id: "decrease-font-size",
      label: "Decrease Font Size",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus],
      run: () => changeFontSize(-2),
    });

    editor.addAction({
      id: "toggle-word-wrap",
      label: "Toggle Word Wrap",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      run: () => toggleWordWrap(),
    });
  };

  const handleImportCode = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,.py,.cpp,.c,.h,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setCode(content);

          // Auto-select language based on file extension
          const fileName = file.name.toLowerCase();
          if (fileName.endsWith(".js")) {
            setLanguage("javascript");
          } else if (fileName.endsWith(".py")) {
            setLanguage("python");
          } else if (
            fileName.endsWith(".cpp") ||
            fileName.endsWith(".c") ||
            fileName.endsWith(".h")
          ) {
            setLanguage("cpp");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCode = () => {
    setExportFileName("code");
    setShowExportModal(true);
  };

  const confirmExport = () => {
    const fileExtensions: { [key: string]: string } = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
    };
    const extension = fileExtensions[language] || "txt";

    if (!exportFileName.trim()) return;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName.trim()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div 
      className="flex flex-col h-full w-full" 
      style={{ scrollBehavior: "auto" }}
    >
      <div
        className="flex flex-col flex-1 bg-gray-50 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="px-3 py-1 rounded bg-white text-gray-900 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languageOptions.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* More Options Button */}
            <button
              onClick={() => setShowOptionsModal(true)}
              title="Editor Options"
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-1"
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              More Options
            </button>

            {/* Format Button */}
            <button
              onClick={formatCode}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Format Code (Ctrl+Shift+F)"
            >
              Format
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setShowSnippetsPanel(!showSnippetsPanel)}
                  title="My Saved Code"
                  className="px-3 py-1 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-1 relative"
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
                      d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                    />
                  </svg>
                  Saved ({snippets.length})
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  title="Save Code"
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center gap-1"
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save
                </button>
              </>
            )}
            <button
              onClick={runCode}
              disabled={loading}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Run
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCode(getDefaultCodeForLanguage(language));
                clearCodeFromStorage(); // Clear localStorage when intentionally resetting
                showToast("Code reset to default template", "info");
              }}
              title="Reset Code"
              className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
        <div style={{ flexGrow: 1, minHeight: 0 }}>
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            theme={editorTheme}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              wordWrap: wordWrap ? "on" : "off",
              minimap: { enabled: showMinimap },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              tabCompletion: "on",
              wordBasedSuggestions: "off",
              parameterHints: { enabled: true },
              folding: true,
              showFoldingControls: "always",
              matchBrackets: "always",
              renderWhitespace: "boundary",
              renderControlCharacters: false,
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "off",
              smoothScrolling: false,
              scrollbar: {
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
                alwaysConsumeMouseWheel: false,
              },
              // Prevent initial focus and selection
              selectOnLineNumbers: false,
              selectionHighlight: true,
              occurrencesHighlight: "off",
              // Disable animations that might cause scroll
              disableLayerHinting: true,
              find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: "never",
              },
              lineNumbers: "on",
              renderLineHighlight: "all",
            }}
          />
        </div>
      </div>

      {/* Resize Handle for Bottom Panel */}
      {!isBottomPanelMinimized && (
        <div
          onMouseDown={handleBottomResizeStart}
          className="h-1 bg-gray-300 hover:bg-blue-500 cursor-row-resize flex-shrink-0 transition-colors duration-150 relative group"
        >
          <div className="absolute inset-x-0 -top-1 -bottom-1 flex items-center justify-center">
            <div className="h-1 w-8 bg-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}

      {/* Bottom: Output/Input Panel */}
      <div
        ref={bottomPanelRef}
        className={`flex flex-col bg-gray-50 border-t border-gray-300 transition-all duration-300 ${
          isBottomPanelMinimized ? "h-10" : ""
        }`}
        style={{
          height: isBottomPanelMinimized ? "40px" : `${bottomPanelHeight}px`,
          minHeight: isBottomPanelMinimized ? "40px" : "100px",
        }}
      >
        {/* Tab Headers with Minimize/Maximize Button */}
        <div className="flex items-center justify-between px-4 border-b border-gray-300 flex-shrink-0">
          <div className="flex gap-1">
            {!isBottomPanelMinimized && (
              <>
                <button
                  onClick={() => setActiveTab("output")}
                  className={`px-4 py-2 text-sm ${
                    activeTab === "output"
                      ? "text-gray-900 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActiveTab("input")}
                  className={`px-4 py-2 text-sm ${
                    activeTab === "input"
                      ? "text-gray-900 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Input
                </button>
                <button
                  onClick={() => setActiveTab("problems")}
                  className={`px-4 py-2 text-sm flex items-center gap-1 ${
                    activeTab === "problems"
                      ? "text-gray-900 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Problems
                  {problems.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {problems.length}
                    </span>
                  )}
                </button>
              </>
            )}
            {isBottomPanelMinimized && (
              <span className="text-sm text-gray-600 py-2">
                Output Panel -{activeTab === "output" && "Output"}
                {activeTab === "input" && "Input"}
                {activeTab === "problems" && `Problems (${problems.length})`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Minimize/Maximize Toggle */}
            <button
              onClick={toggleBottomPanel}
              className="w-8 h-8 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              title={isBottomPanelMinimized ? "Expand Panel" : "Minimize Panel"}
            >
              {isBottomPanelMinimized ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Action buttons for active tab */}
          <div className="flex items-center gap-2">
            {!isBottomPanelMinimized && activeTab === "output" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (output) {
                      navigator.clipboard.writeText(output);
                      showToast("Output copied to clipboard!", "success");
                    } else {
                      showToast("No output to copy", "warning");
                    }
                  }}
                  title="Copy Output"
                  className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded transition-colors"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setOutput("");
                    showToast("Output cleared", "info");
                  }}
                  title="Clear Output"
                  className="text-gray-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Panel Content */}
        {!isBottomPanelMinimized && (
          <div className="flex-1 p-3 overflow-auto bg-white">
            {activeTab === "output" ? (
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                {output || "Your code's output will be displayed here."}
                <div ref={outputEndRef} />
              </pre>
            ) : activeTab === "input" ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full p-2 rounded bg-white text-gray-900 border border-gray-300 resize-none text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Provide all inputs here (one per line)..."
              />
            ) : (
              <div className="h-full">
                {/* Header Section */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-700" />
                      <h3 className="text-base font-semibold text-gray-900">
                        Problems
                      </h3>
                    </div>
                    <div
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        problems.length === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {problems.length === 0
                        ? "No issues"
                        : `${problems.length} ${
                            problems.length === 1 ? "issue" : "issues"
                          }`}
                    </div>
                  </div>
                </div>

                {/* Problems List */}
                {problems.length > 0 ? (
                  <div className="space-y-2">
                    {problems.map((problem, index) => (
                      <div
                        key={index}
                        className={`group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                          problem.severity === "error"
                            ? "bg-red-50 border-red-200 hover:bg-red-100"
                            : problem.severity === "warning"
                            ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        }`}
                        onClick={() => {
                          if (editorRef.current) {
                            editorRef.current.revealLineInCenter(problem.line);
                            editorRef.current.setPosition({
                              lineNumber: problem.line,
                              column: problem.column,
                            });
                            editorRef.current.focus();
                          }
                        }}
                      >
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 mt-0.5 ${
                            problem.severity === "error"
                              ? "text-red-600"
                              : problem.severity === "warning"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        >
                          {problem.severity === "error" ? (
                            <XCircle className="w-5 h-5" />
                          ) : problem.severity === "warning" ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Info className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {problem.message}
                            </p>
                            <span
                              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded ${
                                problem.severity === "error"
                                  ? "bg-red-200 text-red-800"
                                  : problem.severity === "warning"
                                  ? "bg-amber-200 text-amber-800"
                                  : "bg-blue-200 text-blue-800"
                              }`}
                            >
                              {problem.severity.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-600 font-mono">
                              Ln {problem.line}, Col {problem.column}
                            </span>
                            <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                              Click to jump →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-100 rounded-full p-4 mb-4">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      No Problems Found
                    </h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Your code looks good! No syntax errors detected.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* More Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editor Options
            </h3>

            {/* Theme Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={editorTheme}
                onChange={(e) => changeTheme(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vs-light">Light</option>
                <option value="vs-dark">Dark</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>

            {/* Font Size Controls */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeFontSize(-2)}
                  title="Decrease Font Size (Ctrl+-)"
                  className="px-3 py-2 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 flex items-center"
                >
                  A-
                </button>
                <span className="text-sm text-gray-700 min-w-[3rem] text-center font-medium">
                  {fontSize}px
                </span>
                <button
                  onClick={() => changeFontSize(2)}
                  title="Increase Font Size (Ctrl+=)"
                  className="px-3 py-2 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 flex items-center"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Word Wrap Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Wrap
              </label>
              <button
                onClick={toggleWordWrap}
                className={`w-full px-4 py-2 rounded font-medium flex items-center justify-center gap-2 ${
                  wordWrap
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
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
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
                {wordWrap ? "Enabled" : "Disabled"}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Word wrap breaks long lines to fit within the editor width
                instead of scrolling horizontally. This makes reading code
                easier without horizontal scrolling.
              </p>
            </div>

            {/* Minimap Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimap
              </label>
              <button
                onClick={toggleMinimap}
                className={`w-full px-4 py-2 rounded font-medium flex items-center justify-center gap-2 ${
                  showMinimap
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
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
                    d="M9 19V6l6-6v13l-6 6z"
                  />
                </svg>
                {showMinimap ? "Visible" : "Hidden"}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                The minimap shows a small overview of your code on the right
                side, helping you navigate large files quickly.
              </p>
            </div>

            {/* Import/Export Section */}
            <div className="mb-4 border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Code Management
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleImportCode();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import
                </button>
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleExportCode();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Export
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Import code from a file or export your current code to download.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save Code Snippet
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveSnippet()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter snippet title"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Language: {language.toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveTitle("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSnippet}
                disabled={!saveTitle.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Snippets Panel */}
      {showSnippetsPanel && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                My Saved Code
              </h3>
              <button
                onClick={() => setShowSnippetsPanel(false)}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="flex-1 overflow-y-auto p-4">
              {loadingSnippets ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : snippets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                  <p className="text-lg font-medium">No saved code yet</p>
                  <p className="text-sm mt-1">
                    Save your code snippets to access them later
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snippets.map((snippet) => (
                    <div
                      key={snippet._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {snippet.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                            {snippet.language.toUpperCase()}
                          </span>
                          <span>
                            {new Date(snippet.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleLoadSnippet(snippet)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => confirmDeleteSnippet(snippet._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Code Snippet"
        message="Are you sure you want to delete this code snippet? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDeleteSnippet}
        onCancel={() => setDeleteConfirm({ show: false, snippetId: null })}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Export Code
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename (without extension)
              </label>
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmExport()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter filename"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                File will be saved as: {exportFileName || "code"}.
                {language === "javascript"
                  ? "js"
                  : language === "python"
                  ? "py"
                  : "cpp"}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                disabled={!exportFileName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

