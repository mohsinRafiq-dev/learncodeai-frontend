import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface CodeChatMessage {
  message: string;
  code?: string;
  language?: string;
  error?: string;
  problems?: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
  }>;
}

export interface CodeChatResponse {
  success: boolean;
  data: {
    response: string;
  };
}

export interface CodeChatHistory {
  _id: string;
  message: string;
  response: string;
  messageType: 'question' | 'error-help' | 'problem-help' | 'regular';
  createdAt: string;
  code?: string;
  language?: string;
}

// Send a message to the code editor AI assistant
export const sendCodeChatMessage = async (messageData: CodeChatMessage, messageType: string = 'question'): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios.post<CodeChatResponse>(
      `${API_BASE_URL}/api/codechat/message`,
      { ...messageData, messageType },
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
        error.response?.data?.message || "Failed to send message to code AI chat"
      );
    }
    throw error;
  }
};

// Get code chat history
export const getCodeChatHistory = async (): Promise<CodeChatHistory[]> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios.get<{ success: boolean; data: CodeChatHistory[] }>(
      `${API_BASE_URL}/api/codechat/history`,
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
        error.response?.data?.message || "Failed to fetch code chat history"
      );
    }
    throw error;
  }
};

// Clear code chat history
export const clearCodeChats = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    
    await axios.delete(
      `${API_BASE_URL}/api/codechat/clear`,
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
        error.response?.data?.message || "Failed to clear code chats"
      );
    }
    throw error;
  }
};
