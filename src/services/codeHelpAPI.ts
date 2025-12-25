import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface CodeHelpRequest {
  error?: string;
  problem?: string;
  question?: string;
  code?: string;
  language?: string;
  attempt?: string;
}

export interface CodeHelpResponse {
  success: boolean;
  data: {
    explanation?: string;
    hint?: string;
    answer?: string;
  };
}

export const getErrorExplanation = async (error: string, code?: string, language?: string): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios.post<CodeHelpResponse>(
      `${API_BASE_URL}/api/codehelp/error-explanation`,
      { error, code, language },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.explanation || "";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get error explanation"
      );
    }
    throw error;
  }
};

export const getProblemHint = async (problem: string, code?: string, language?: string, attempt?: string): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios.post<CodeHelpResponse>(
      `${API_BASE_URL}/api/codehelp/problem-hint`,
      { problem, code, language, attempt },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.hint || "";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get hint"
      );
    }
    throw error;
  }
};

export const askCodeQuestion = async (question: string, code?: string, language?: string): Promise<string> => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios.post<CodeHelpResponse>(
      `${API_BASE_URL}/api/codehelp/ask-question`,
      { question, code, language },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.answer || "";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to get answer"
      );
    }
    throw error;
  }
};

