import React, { useState, useRef, useEffect } from "react";

import {
  sendCodeChatMessage,
  getCodeChatHistory,
  clearCodeChats,
} from "../../../services/codeChatAPI";
import { getCodeOptimization } from "../../../services/codeHelpAPI";
import { formatMarkdownText } from "../../../utils/markdownFormatterHTML";
import { useSettings } from "../../../contexts/PlatformSettingsContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "error-help" | "problem-help" | "question" | "optimization" | "regular";
}

interface AiAssistantPanelProps {
  code?: string;
  language?: string;
  error?: string;
  problems?: Array<{
    severity: "error" | "warning" | "info";
    message: string;
    line: number;
    column: number;
  }>;
}

function AiAssistantPanelInner({
  code,
  language = "python",
  error,
  problems,
}: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await getCodeChatHistory();

        if (history && history.length > 0) {
          // Convert saved chats to message format
          const loadedMessages: Message[] = [];
          history.forEach((chat) => {
            // Add user message
            loadedMessages.push({
              id: `user-${chat._id}`,
              text: chat.message,
              isUser: true,
              timestamp: new Date(chat.createdAt),
              type: chat.messageType as any,
            });
            // Add AI response
            loadedMessages.push({
              id: `ai-${chat._id}`,
              text: chat.response,
              isUser: false,
              timestamp: new Date(chat.createdAt),
              type: chat.messageType as any,
            });
          });
          setMessages(loadedMessages);
        } else {
          // Set initial greeting message if no history
          setMessages([
            {
              id: "1",
              text: "👋 Hi! I'm your AI coding tutor. I'll help you understand errors and guide you through problems. Ask me anything!",
              isUser: false,
              timestamp: new Date(),
              type: "regular",
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading code chat history:", err);
        // Fallback to initial greeting
        setMessages([
          {
            id: "1",
            text: "👋 Hi! I'm your AI coding tutor. I'll help you understand errors and guide you through problems. Ask me anything!",
            isUser: false,
            timestamp: new Date(),
            type: "regular",
          },
        ]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, []);

  const addMessage = (text: string, isUser: boolean, type?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      isUser,
      timestamp: new Date(),
      type: type as any,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleClearHistory = async () => {
    try {
      await clearCodeChats();
      setMessages([
        {
          id: "1",
          text: "Hi! I'm your coding assistant. I can help you understand your code, explain errors, and provide debugging hints. What can I help you with?",
          isUser: false,
          timestamp: new Date(),
          type: "regular",
        },
      ]);
    } catch (err) {
      console.error("Error clearing chat history:", err);
      // Optional: show error message to user
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if code exists
    if (!code || !code.trim()) {
      addMessage(
        "📝 I can see your editor is empty. Write some code first, and I'll be ready to help!",
        false,
        "regular"
      );
      setInputValue("");
      return;
    }

    const userMessage = inputValue;
    setInputValue("");
    addMessage(userMessage, true, "question");
    setIsLoading(true);

    try {
      const answer = await sendCodeChatMessage(
        {
          message: userMessage,
          code,
          language,
          error,
          problems,
        },
        "question"
      );
      addMessage(answer, false, "question");
    } catch (err) {
      addMessage(
        `Sorry, I couldn't help with that. ${
          err instanceof Error ? err.message : "Please try again."
        }`,
        false,
        "regular"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainError = async () => {
    if (!error) return;

    addMessage(`📍 Error: ${error}`, true, "error-help");
    setIsLoading(true);

    try {
      const explanation = await sendCodeChatMessage(
        {
          message: `Please explain this error: ${error}`,
          code,
          language,
          error,
          problems,
        },
        "error-help"
      );
      addMessage(explanation, false, "error-help");
    } catch (err) {
      addMessage(
        `Couldn't explain the error. ${
          err instanceof Error ? err.message : "Try again."
        }`,
        false,
        "regular"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskForHint = async () => {
    if (!problems || problems.length === 0) return;

    const problemText = problems
      .map((p) => `Line ${p.line}: ${p.message}`)
      .join(", ");

    addMessage(`❓ I need help with: ${problemText}`, true, "problem-help");
    setIsLoading(true);

    try {
      const hint = await sendCodeChatMessage(
        {
          message: `I need help with these problems: ${problemText}`,
          code,
          language,
          error,
          problems,
        },
        "problem-help"
      );
      addMessage(hint, false, "problem-help");
    } catch (err) {
      addMessage(
        `Couldn't provide a hint. ${
          err instanceof Error ? err.message : "Try again."
        }`,
        false,
        "regular"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeCode = async () => {
    if (!code || !code.trim()) {
      addMessage("Please write some code first before asking for optimization.", false, "regular");
      return;
    }

    addMessage("🚀 Please review my code and suggest optimizations.", true, "optimization");
    setIsLoading(true);

    try {
      const suggestions = await getCodeOptimization(code, language);
      addMessage(suggestions, false, "optimization");
    } catch (err) {
      addMessage(
        `Couldn't optimize the code at this time. ${
          err instanceof Error ? err.message : "Please try again later."
        }`,
        false,
        "regular"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#0d1230] overflow-hidden max-h-screen h-full w-full">
      {/* Assistant Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1a1f3e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div className="flex flex-col">
            <h2 className="font-semibold text-white text-sm">AI Tutor</h2>
            {code && code.trim() && (
              <span className="text-xs text-[#00e676] flex items-center gap-1">
                ✓ Reading your code
              </span>
            )}
          </div>
        </div>
        <span className="text-xs bg-[#8b5cf6]/20 text-[#a78bfa] px-2 py-1 rounded border border-[#8b5cf6]/30">
          {language.toUpperCase()}
        </span>
      </div>

      {/* Chat Area */}
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e27]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                message.isUser
                  ? "bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white"
                  : message.type === "error-help"
                  ? "bg-[#e91e63]/10 text-gray-200 border border-[#e91e63]/30"
                  : message.type === "problem-help"
                  ? "bg-[#ff9800]/10 text-gray-200 border border-[#ff9800]/30"
                  : message.type === "optimization"
                  ? "bg-[#00e676]/10 text-gray-200 border border-[#00e676]/30"
                  : "bg-[#1a1f3e] text-gray-200 border border-[#2a3050]"
              }`}
            >
              {message.isUser ? message.text : formatMarkdownText(message.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1f3e] rounded-lg px-4 py-2 border border-[#2a3050]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#00e676] rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Helper Buttons - Show when errors/problems exist */}
      {error && error.trim() ? (
        <div className="px-3 py-2 border-t-2 border-[#e91e63] bg-[#e91e63]/10 flex flex-col gap-2 flex-shrink-0">
          <div className="text-xs text-[#e91e63] font-semibold">
            Runtime Error Detected:
          </div>
          <button
            onClick={handleExplainError}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#e91e63] to-[#f06292] hover:from-[#c2185b] hover:to-[#e91e63] disabled:from-gray-600 disabled:to-gray-700 text-white text-sm py-2 px-3 rounded transition-colors font-bold flex items-center justify-center gap-1 shadow-lg shadow-pink-500/20"
          >
            📍 Explain Error
          </button>
        </div>
      ) : problems && problems.length > 0 ? (
        <div className="px-3 py-2 border-t-2 border-[#ff9800] bg-[#ff9800]/10 flex flex-col gap-2 flex-shrink-0">
          <div className="text-xs text-[#ff9800] font-semibold">
            Syntax Problems Detected:
          </div>
          <button
            onClick={handleAskForHint}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#ff9800] to-[#ffb74d] hover:from-[#f57c00] hover:to-[#ff9800] disabled:from-gray-600 disabled:to-gray-700 text-white text-sm py-2 px-3 rounded transition-colors font-bold flex items-center justify-center gap-1 shadow-lg shadow-orange-500/20"
          >
            💡 Ask for Hint
          </button>
        </div>
      ) : code && code.trim().length > 10 ? (
        <div className="px-3 py-2 border-t-2 border-[#00e676] bg-[#00e676]/10 flex flex-col gap-2 flex-shrink-0">
          <div className="text-xs text-[#00e676] font-semibold">
            Code Analysis Available:
          </div>
          <button
            onClick={handleOptimizeCode}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00c853] to-[#69f0ae] hover:from-[#00b248] hover:to-[#00c853] disabled:from-gray-600 disabled:to-gray-700 text-white text-sm py-2 px-3 rounded transition-colors font-bold flex items-center justify-center gap-1 shadow-lg shadow-green-500/20"
          >
            🚀 Optimize Code
          </button>
        </div>
      ) : null}

      {/* Clear Chat History Button */}
      {messages.length > 1 && (
        <div className="px-3 py-2 border-t border-[#1a1f3e] bg-[#0d1230] flex justify-center">
          <button
            onClick={handleClearHistory}
            disabled={isLoading}
            className="text-xs text-gray-500 hover:text-[#e91e63] disabled:text-gray-600 transition-colors flex items-center gap-1"
            title="Clear chat history"
          >
            🗑️ Clear History
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 border-t border-[#1a1f3e] bg-[#0d1230] flex-shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-[#1a1f3e] border border-[#2a3050] px-3 py-2 focus-within:ring-2 focus-within:ring-[#8b5cf6] focus-within:border-[#8b5cf6]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Ask anything about your code..."
            disabled={isLoading}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="text-[#00b4d8] hover:text-[#0096c7] disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            title="Send message"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Gate based on the platform-wide AI Assistant toggle. When admins flip it
// off, the editor panel hides for every user automatically.
type PanelProps = React.ComponentProps<typeof AiAssistantPanelInner>;
const AiAssistantPanel: React.FC<PanelProps> = (props) => {
  const { settings } = useSettings();
  if (!settings.features.aiAssistantEnabled) return null;
  return <AiAssistantPanelInner {...props} />;
};

export default AiAssistantPanel;
