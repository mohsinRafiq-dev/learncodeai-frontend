import axios from "axios";

// Match the rest of the codebase: VITE_API_URL already includes `/api`.
// All paths below append the endpoint without re-prefixing `/api`.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Turn an axios error into a clear, user-facing message. Distinguishes the
// common failure modes so the chat UI never just says "error".
const aiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401)
      return "Your session expired. Please sign out and sign in again.";
    if (status === 429)
      return "You're sending messages too fast. Wait a moment and try again.";
    if (status && status >= 500)
      return "The AI service is temporarily unavailable. Please try again shortly.";
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

export interface ChatMessage {
  message: string;
  context?: "course" | "tutorial";
  contextId?: string;
  contextTitle?: string;
  contentScope?: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    response: string;
  };
}

export const sendMessage = async (messageData: ChatMessage): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");

    const response = await axios.post<ChatResponse>(
      `${API_BASE_URL}/aichat/message`,
      messageData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.response;
  } catch (error) {
    throw new Error(aiErrorMessage(error, "Failed to send message to AI chat"));
  }
};

export const clearChats = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");

    await axios.delete(`${API_BASE_URL}/aichat/clear`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to clear chats"
      );
    }
    throw error;
  }
};

export const getChatHistory = async (
  context?: string,
  contextId?: string
): Promise<any[]> => {
  try {
    const token = localStorage.getItem("authToken");

    const params = new URLSearchParams();
    if (context) params.append("context", context);
    if (contextId) params.append("contextId", contextId);

    const response = await axios.get<{ success: boolean; data: any[] }>(
      `${API_BASE_URL}/aichat/history${
        params.toString() ? "?" + params.toString() : ""
      }`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    // History is non-critical — failing to load it should NOT break the chat.
    // Return empty so the assistant still works for new messages.
    console.warn("getChatHistory failed:", aiErrorMessage(error, "history load failed"));
    return [];
  }
};
