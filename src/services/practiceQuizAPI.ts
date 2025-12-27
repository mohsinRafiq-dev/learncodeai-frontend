import api from "./api";

// Practice Quiz API for standalone quizzes
export const practiceQuizAPI = {
  // Generate AI quiz
  generateQuiz: async (data: {
    topic: string;
    language: string;
    difficulty?: string;
    questionCount?: number;
    includeCodeQuestions?: boolean;
  }) => {
    const response = await api.post("/practice-quizzes/generate", data);
    return response.data;
  },

  // Get all practice quizzes
  getAllQuizzes: async (params?: {
    language?: string;
    difficulty?: string;
    topic?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/practice-quizzes", { params });
    return response.data;
  },

  // Get specific quiz
  getQuiz: async (quizId: string) => {
    const response = await api.get(`/practice-quizzes/${quizId}`);
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (
    quizId: string,
    data: {
      answers: Record<string, string>;
      timeSpent?: number;
    }
  ) => {
    const response = await api.post(`/practice-quizzes/${quizId}/submit`, data);
    return response.data;
  },
};

// Types
export interface PracticeQuiz {
  _id: string;
  title: string;
  description?: string;
  language: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
  isAIGenerated: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  _id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "coding";
  question: string;
  description?: string;
  options?: Array<{ text: string; isCorrect?: boolean }>;
  acceptableAnswers?: string[];
  codingProblem?: {
    title: string;
    description: string;
    starterCode: string;
    language: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  };
  points: number;
  explanation?: string;
}

export interface QuizResult {
  questionId: string;
  question: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  points: number;
  codeOutput?: {
    totalTests: number;
    passedCount: number;
    failedCount: number;
    allPassed: boolean;
    testResults: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
      error?: string;
    }>;
  };
}

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  results: QuizResult[];
  performanceMetrics: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    scorePercentage: number;
    passed: boolean;
    timeSpent: number;
    averageTimePerQuestion: number;
  };
  quizTitle: string;
}

export default practiceQuizAPI;
