import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      `${API_BASE_URL}/api/aichat/message`,
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
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to send message to AI chat"
      );
    }
    throw error;
  }
};

export const clearChats = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    
    await axios.delete(
      `${API_BASE_URL}/api/aichat/clear`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to clear chats"
      );
    }
    throw error;
  }
};

export const getChatHistory = async (context?: string, contextId?: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const params = new URLSearchParams();
    if (context) params.append('context', context);
    if (contextId) params.append('contextId', contextId);

    const response = await axios.get<{ success: boolean; data: any[] }>(
      `${API_BASE_URL}/api/aichat/history${params.toString() ? '?' + params.toString() : ''}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch chat history"
      );
    }
    throw error;
  }
};

