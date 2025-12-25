import React, { useState, useRef, useEffect } from "react";

import {
  sendCodeChatMessage,
  getCodeChatHistory,
  clearCodeChats,
} from "../../../services/codeChatAPI";
import { formatMarkdownText } from "../../../utils/markdownFormatterHTML";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "error-help" | "problem-help" | "question" | "regular";
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

function AiAssistantPanel({
  code,
  language = "python",
  error,
  problems,
}: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="flex flex-col bg-gray-50 overflow-hidden max-h-screen h-full w-full">
      {/* Assistant Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div className="flex flex-col">
            <h2 className="font-semibold text-gray-900 text-sm">AI Tutor</h2>
            {code && code.trim() && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                ✓ Reading your code
              </span>
            )}
          </div>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {language.toUpperCase()}
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
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
                  ? "bg-blue-500 text-white"
                  : message.type === "error-help"
                  ? "bg-red-50 text-gray-800 border border-red-200"
                  : message.type === "problem-help"
                  ? "bg-yellow-50 text-gray-800 border border-yellow-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.isUser ? message.text : formatMarkdownText(message.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
        <div className="px-3 py-2 border-t-4 border-red-500 bg-red-100 flex flex-col gap-2 flex-shrink-0 shadow-md">
          <div className="text-xs text-red-900 font-semibold">
            Runtime Error Detected:
          </div>
          <button
            onClick={handleExplainError}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm py-2 px-3 rounded transition-colors font-bold flex items-center justify-center gap-1"
          >
            📍 Explain Error
          </button>
        </div>
      ) : problems && problems.length > 0 ? (
        <div className="px-3 py-2 border-t-4 border-yellow-500 bg-yellow-100 flex flex-col gap-2 flex-shrink-0 shadow-md">
          <div className="text-xs text-yellow-900 font-semibold">
            Syntax Problems Detected:
          </div>
          <button
            onClick={handleAskForHint}
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white text-sm py-2 px-3 rounded transition-colors font-bold flex items-center justify-center gap-1"
          >
            💡 Ask for Hint
          </button>
        </div>
      ) : null}

      {/* Clear Chat History Button */}
      {messages.length > 1 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex justify-center">
          <button
            onClick={handleClearHistory}
            disabled={isLoading}
            className="text-xs text-gray-500 hover:text-red-500 disabled:text-gray-300 transition-colors flex items-center gap-1"
            title="Clear chat history"
          >
            🗑️ Clear History
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 border-t border-gray-300 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
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
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="text-blue-600 hover:text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
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

export default AiAssistantPanel;

