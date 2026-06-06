import React, { useState, useEffect } from "react";
import {
  sendMessage as sendChatMessage,
  clearChats,
  getChatHistory,
} from "../../services/chatAPI";
import { formatMarkdownText } from "../../utils/markdownFormatterHTML";
import { useSettings } from "../../contexts/PlatformSettingsContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatAssistantProps {
  context?: string; // e.g., "course" or "tutorial"
  contextTitle?: string; // The course/tutorial title
  contextId?: string; // The course/tutorial ID
  contentScope?: string; // The actual content of the current section/tutorial
  disabled?: boolean; // Disable chat during quiz
}

const AIChatAssistantInner: React.FC<AIChatAssistantProps> = ({
  context = "learning",
  contextTitle,
  contextId,
  contentScope,
  disabled = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm your AI assistant. Ask me anything about ${
        contextTitle || "JavaScript variables"
      }.`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load chat history on mount or when context changes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const history = await getChatHistory(context, contextId);

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
            });
            // Add AI response
            loadedMessages.push({
              id: `ai-${chat._id}`,
              text: chat.response,
              isUser: false,
              timestamp: new Date(chat.createdAt),
            });
          });
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        // Fall back to initial greeting
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [context, contextId]);

  const handleSend = async () => {
    if (!inputValue.trim() || disabled) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const questionText = inputValue;
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const aiResponseText = await sendChatMessage({
        message: questionText,
        context: context as "course" | "tutorial",
        contextId,
        contextTitle,
        contentScope,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setInputValue(question);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const aiResponseText = await sendChatMessage({
        message: question,
        context: context as "course" | "tutorial",
        contextId,
        contextTitle,
        contentScope,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1230] border-l border-[#1a1f3e] overflow-hidden relative">
      {disabled && (
        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
          <div className="bg-[#1a1f3e] rounded-lg p-6 text-center shadow-xl border border-[#2a3050]">
            <svg
              className="w-12 h-12 text-gray-500 mx-auto mb-3"
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
            <p className="text-gray-300 font-medium">AI Assistant Disabled</p>
            <p className="text-sm text-gray-500 mt-1">
              Complete the quiz to re-enable
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1f3e]">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-200 text-sm">AI Assistant</h2>
          <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
            </span>
            24/7
          </span>
        </div>
        <button
          onClick={async () => {
            if (window.confirm("Are you sure you want to clear all chats?")) {
              try {
                await clearChats();
                setMessages([
                  {
                    id: "1",
                    text: `Hi! I'm your AI assistant. Ask me anything about ${
                      contextTitle || "JavaScript variables"
                    }.`,
                    isUser: false,
                    timestamp: new Date(),
                  },
                ]);
                setError(null);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Failed to clear chats"
                );
              }
            }
          }}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 cursor-pointer"
          title="Clear all chats"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-[#0a0e27]">
        {messages.map((message) => (
          <div key={message.id} className="overflow-x-hidden">
            {!message.isUser && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div className="flex-1 bg-[#1a1f3e] rounded-lg px-4 py-3 text-sm text-gray-100 break-words overflow-hidden border border-[#2a3050]">
                  {formatMarkdownText(message.text)}
                </div>
              </div>
            )}
            {message.isUser && (
              <div className="flex justify-end overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg px-4 py-3 text-sm max-w-[80%] break-words overflow-hidden">
                  {message.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Suggested Questions - Show only initially */}
        {messages.length === 1 && !isTyping && (
          <div className="space-y-2 mt-4">
            <button
              onClick={() =>
                handleSuggestedQuestion(
                  "What's the difference between 'let' and 'const'?"
                )
              }
              className="w-full text-left text-sm text-cyan-400 bg-[#1a1f3e] hover:bg-[#2a3050] border border-cyan-500/50 rounded-full px-4 py-2 transition-colors cursor-pointer"
            >
              What's the difference between 'let' and 'const'?
            </button>
            <button
              onClick={() =>
                handleSuggestedQuestion('Explain "scope" with an example.')
              }
              className="w-full text-left text-sm text-cyan-400 bg-[#1a1f3e] hover:bg-[#2a3050] border border-cyan-500/50 rounded-full px-4 py-2 transition-colors cursor-pointer"
            >
              Explain "scope" with an example.
            </button>
          </div>
        )}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="bg-[#1a1f3e] rounded-lg px-4 py-3 border border-[#2a3050]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0d1230] border-t border-[#1a1f3e]">
        <div className="flex items-center space-x-2 bg-[#1a1f3e] rounded-lg border border-[#2a3050] focus-within:border-purple-500 pr-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={disabled}
            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none text-gray-200 placeholder-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping || disabled}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors flex-shrink-0 cursor-pointer"
            title="Send message"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper that respects the platform-wide AI Assistant toggle. When the admin
// disables AI from Settings → Feature Toggles, every consumer of this
// component renders nothing — no further changes needed at call sites.
const AIChatAssistant: React.FC<AIChatAssistantProps> = (props) => {
  const { settings } = useSettings();
  if (!settings.features.aiAssistantEnabled) return null;
  return <AIChatAssistantInner {...props} />;
};

export default AIChatAssistant;
