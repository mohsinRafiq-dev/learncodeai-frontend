import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Brain,
  Play,
  Trophy,
  Filter,
  Plus,
  Sparkles,
  Code,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Timer,
  Target,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import practiceQuizAPI, {
  type PracticeQuiz,
  type QuizQuestion,
  type QuizSubmissionResult,
} from "../../services/practiceQuizAPI";

// Quiz Timer Component
const QuizTimer: React.FC<{
  timeLimit: number;
  onTimeUp: () => void;
  isActive: boolean;
}> = ({ timeLimit, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 60;
  const isCritical = timeLeft <= 30;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
        isCritical
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : isLow
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-[#1a1f3e] text-cyan-400"
      }`}
    >
      <Timer className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

// Generate Quiz Modal
const GenerateQuizModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onGenerate: (data: {
    topic: string;
    language: string;
    difficulty: string;
    questionCount: number;
    includeCodeQuestions: boolean;
  }) => void;
  isGenerating: boolean;
}> = ({ show, onClose, onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("beginner");
  const [questionCount, setQuestionCount] = useState(5);
  const [includeCodeQuestions, setIncludeCodeQuestions] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-[#2a3050]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate AI Quiz</h2>
              <p className="text-sm text-gray-400">
                Create a custom quiz with AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic / Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Array Methods, Recursion, OOP Concepts"
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    difficulty === level
                      ? "bg-purple-600 text-white"
                      : "bg-[#1a1f3e] text-gray-400 hover:text-white border border-[#2a3050]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {/* Include Code Questions */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeCode"
              checked={includeCodeQuestions}
              onChange={(e) => setIncludeCodeQuestions(e.target.checked)}
              className="w-5 h-5 rounded border-[#2a3050] bg-[#1a1f3e] text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="includeCode" className="text-gray-300">
              Include coding challenges (with code execution)
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-[#2a3050] flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-[#1a1f3e] text-gray-300 rounded-lg font-medium hover:bg-[#252b4a] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onGenerate({
                topic,
                language,
                difficulty,
                questionCount,
                includeCodeQuestions,
              })
            }
            disabled={!topic.trim() || isGenerating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Quiz Card Component
const QuizCard: React.FC<{
  quiz: PracticeQuiz;
  onStart: () => void;
}> = ({ quiz, onStart }) => {
  const difficultyColors = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const languageColors = {
    python: "text-yellow-400",
    javascript: "text-yellow-300",
    cpp: "text-blue-400",
  };

  return (
    <div className="bg-[#0d1230] border border-[#2a3050] rounded-xl p-6 hover:border-purple-500/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {quiz.isAIGenerated && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs rounded-full border ${
              difficultyColors[quiz.difficulty as keyof typeof difficultyColors]
            }`}
          >
            {quiz.difficulty}
          </span>
        </div>
        <span
          className={`font-mono text-sm ${
            languageColors[quiz.language as keyof typeof languageColors]
          }`}
        >
          {quiz.language.toUpperCase()}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
        {quiz.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {quiz.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          {quiz.questionCount} questions
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {quiz.timeLimit} min
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          {quiz.passingScore}% to pass
        </span>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        Start Quiz
      </button>
    </div>
  );
};

// Main QuizzesPage Component
const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // State
  const [quizzes, setQuizzes] = useState<PracticeQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    language: "",
    difficulty: "",
  });

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<{
    quiz: any;
    questions: QuizQuestion[];
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(
    null
  );

  // Load quizzes
  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await practiceQuizAPI.getAllQuizzes({
        language: filters.language || undefined,
        difficulty: filters.difficulty || undefined,
        limit: 20,
      });
      setQuizzes(response.data?.quizzes || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      showToast("Failed to load quizzes", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Generate quiz handler
  const handleGenerateQuiz = async (data: {
    topic: string;
    language: string;
    difficulty: string;
    questionCount: number;
    includeCodeQuestions: boolean;
  }) => {
    if (!isAuthenticated) {
      showToast("Please login to generate quizzes", "error");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await practiceQuizAPI.generateQuiz(data);

      if (response.success) {
        showToast("Quiz generated successfully!", "success");
        setShowGenerateModal(false);
        loadQuizzes();

        // Optionally start the quiz immediately
        if (response.data) {
          handleStartQuiz(response.data);
        }
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      showToast(
        error.response?.data?.message || "Failed to generate quiz",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Start quiz
  const handleStartQuiz = async (quiz: PracticeQuiz) => {
    if (!isAuthenticated) {
      showToast("Please login to take quizzes", "error");
      navigate("/signin");
      return;
    }

    try {
      const response = await practiceQuizAPI.getQuiz(quiz._id);
      if (response.success && response.data) {
        setActiveQuiz({
          quiz: response.data,
          questions: response.data.questions || [],
        });
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuizStartTime(new Date());
        setQuizResult(null);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      showToast("Failed to load quiz", "error");
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Check if all questions are answered
    const unanswered = activeQuiz.questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const timeSpent = quizStartTime
        ? Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000)
        : 0;

      const response = await practiceQuizAPI.submitQuiz(activeQuiz.quiz._id, {
        answers,
        timeSpent,
      });

      if (response.success) {
        setQuizResult(response.data);
        showToast(
          response.data.passed
            ? "Congratulations! You passed! 🎉"
            : "Keep practicing! You can do better! 💪",
          response.data.passed ? "success" : "info"
        );
      }
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      showToast(
        error.response?.data?.message || "Failed to submit quiz",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Time up handler
  const handleTimeUp = useCallback(() => {
    showToast("Time's up! Submitting your quiz...", "warning");
    handleSubmitQuiz();
  }, [answers, activeQuiz]);

  // Close quiz
  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setQuizResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Render quiz results
  if (quizResult && activeQuiz) {
    return (
      <div className="min-h-screen bg-[#0a0e27] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div
            className={`rounded-2xl p-8 mb-8 ${
              quizResult.passed
                ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30"
                : "bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30"
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {quizResult.passed ? "🎉" : "📚"}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {quizResult.passed ? "Congratulations!" : "Keep Learning!"}
              </h2>
              <p className="text-gray-300 mb-6">
                {quizResult.passed
                  ? "You passed the quiz!"
                  : "Don't give up - practice makes perfect!"}
              </p>

              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                <div className="bg-[#0a0e27]/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Score</p>
                  <p
                    className={`text-3xl font-bold ${
                      quizResult.passed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {quizResult.score}%
                  </p>
                </div>
                <div className="bg-[#0a0e27]/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Correct</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {quizResult.performanceMetrics.correctAnswers}/
                    {quizResult.performanceMetrics.totalQuestions}
                  </p>
                </div>
                <div className="bg-[#0a0e27]/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {Math.floor(quizResult.performanceMetrics.timeSpent / 60)}:
                    {String(
                      quizResult.performanceMetrics.timeSpent % 60
                    ).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Question Results
            </h3>
            <div className="space-y-4">
              {quizResult.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-xl border ${
                    result.isCorrect
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-red-900/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white flex-1">
                      {index + 1}. {result.question}
                    </h4>
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      Your answer:{" "}
                      <span
                        className={
                          result.isCorrect ? "text-green-400" : "text-red-400"
                        }
                      >
                        {result.userAnswer || "(No answer)"}
                      </span>
                    </p>
                    {!result.isCorrect && (
                      <p className="text-gray-400">
                        Correct answer:{" "}
                        <span className="text-green-400">
                          {result.correctAnswer}
                        </span>
                      </p>
                    )}
                    {result.explanation && (
                      <p className="text-cyan-400 mt-2 p-3 bg-[#0a0e27] rounded-lg">
                        💡 {result.explanation}
                      </p>
                    )}
                  </div>

                  {/* Code execution results */}
                  {result.codeOutput && (
                    <div className="mt-4 p-3 bg-[#0a0e27] rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">
                        Test Results: {result.codeOutput.passedCount}/
                        {result.codeOutput.totalTests} passed
                      </p>
                      <div className="space-y-2">
                        {result.codeOutput.testResults?.map((test, i) => (
                          <div
                            key={i}
                            className={`text-xs p-2 rounded ${
                              test.passed
                                ? "bg-green-900/30 text-green-300"
                                : "bg-red-900/30 text-red-300"
                            }`}
                          >
                            <p>Input: {test.input}</p>
                            <p>Expected: {test.expectedOutput}</p>
                            <p>Got: {test.actualOutput || test.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCloseQuiz}
              className="flex-1 py-3 bg-[#1a1f3e] text-gray-300 rounded-lg font-medium hover:bg-[#252b4a] transition-colors"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => {
                setQuizResult(null);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setQuizStartTime(new Date());
              }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render active quiz
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#0a0e27] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {activeQuiz.quiz.title}
              </h2>
              {activeQuiz.quiz.timeLimit > 0 && (
                <QuizTimer
                  timeLimit={activeQuiz.quiz.timeLimit}
                  onTimeUp={handleTimeUp}
                  isActive={true}
                />
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-[#1a1f3e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Question {currentQuestionIndex + 1} of{" "}
                {activeQuiz.questions.length}
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  currentQuestion.type === "coding"
                    ? "bg-purple-500/20 text-purple-400"
                    : currentQuestion.type === "multiple-choice"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {currentQuestion.type.replace("-", " ")}
              </span>
              <span className="text-sm text-gray-400">
                {currentQuestion.points} points
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answer Options based on type */}
            {(currentQuestion.type === "multiple-choice" ||
              currentQuestion.type === "true-false") && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                      answers[currentQuestion._id] === option.text
                        ? "bg-purple-500/20 border-purple-500"
                        : "bg-[#1a1f3e] border-[#2a3050] hover:border-purple-500/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion._id}
                      value={option.text}
                      checked={answers[currentQuestion._id] === option.text}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion._id, e.target.value)
                      }
                      className="mr-4 w-5 h-5 text-purple-600 bg-[#0a0e27] border-[#2a3050]"
                    />
                    <span className="text-gray-200">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <input
                type="text"
                value={answers[currentQuestion._id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion._id, e.target.value)
                }
                placeholder="Enter your answer..."
                className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}

            {currentQuestion.type === "coding" && (
              <div>
                {currentQuestion.codingProblem?.description && (
                  <p className="text-gray-400 mb-4">
                    {currentQuestion.codingProblem.description}
                  </p>
                )}
                <textarea
                  value={
                    answers[currentQuestion._id] ||
                    currentQuestion.codingProblem?.starterCode ||
                    ""
                  }
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id, e.target.value)
                  }
                  placeholder="Write your code here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
                {currentQuestion.codingProblem?.testCases && (
                  <div className="mt-4 p-4 bg-[#0a0e27] rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">
                      Sample Test Cases:
                    </p>
                    {currentQuestion.codingProblem.testCases
                      .slice(0, 2)
                      .map((tc, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-500 mb-1 font-mono"
                        >
                          Input: {tc.input} → Output: {tc.expectedOutput}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-[#1a1f3e] text-gray-300 rounded-lg font-medium hover:bg-[#252b4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex-1 flex justify-center gap-2 overflow-x-auto py-2">
              {activeQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    index === currentQuestionIndex
                      ? "bg-purple-600 text-white"
                      : answers[activeQuiz.questions[index]._id]
                      ? "bg-green-600/50 text-white"
                      : "bg-[#1a1f3e] text-gray-400 hover:bg-[#252b4a]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(activeQuiz.questions.length - 1, prev + 1)
                  )
                }
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render quiz list
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] overflow-hidden bg-[#0a0e27] flex items-center">
        {/* Matrix Rain */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute text-[#00e676] font-mono text-xs hidden md:block"
              style={{
                left: `${i * 8.3}%`,
                animation: `matrix-fall-optimized ${
                  3 + Math.random() * 2
                }s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {Array.from({ length: 15 }, () =>
                String.fromCharCode(33 + Math.floor(Math.random() * 94))
              ).join("\n")}
            </div>
          ))}
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 circuit-pattern"></div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse delay-1000"></div>

        {/* Floating Code Symbols */}
        <div className="hidden lg:block absolute left-[8%] top-[20%] animate-float">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <div className="text-[#00b4d8] font-mono text-2xl">✓</div>
          </div>
        </div>
        <div className="hidden lg:block absolute right-[8%] top-[25%] animate-float delay-300">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <div className="text-[#8b5cf6] font-mono text-2xl">?</div>
          </div>
        </div>
        <div className="hidden lg:block absolute left-[12%] bottom-[25%] animate-float delay-500">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <Brain className="w-6 h-6 text-[#00e676]" />
          </div>
        </div>
        <div className="hidden lg:block absolute right-[12%] bottom-[30%] animate-float delay-700">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <Trophy className="w-6 h-6 text-[#e91e63]" />
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="scanline-effect absolute inset-0 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg shadow-lg mb-6">
            <span className="text-[#00b4d8] font-mono text-sm animate-pulse">
              ●
            </span>
            <span className="text-[#00b4d8] font-mono text-sm font-medium">
              AI-Powered Assessment
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono mb-6">
            <span className="text-[#6272a4]">{"/* "}</span>
            <span className="text-[#00b4d8]">Practice</span>
            <span className="text-white">.</span>
            <span className="text-[#8b5cf6]">Test</span>
            <span className="text-white">.</span>
            <span className="text-[#00e676]">Master</span>
            <span className="text-[#6272a4]">{" */"}</span>
          </h1>

          {/* Subtitle */}
          <div className="max-w-3xl mx-auto space-y-2 mb-8">
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> AI-generated quizzes
              tailored to your level
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Real-time code
              execution & instant feedback
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Track your progress &
              improve your skills
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow">
              <div className="text-3xl sm:text-4xl font-bold neon-text-cyan font-mono">
                <Brain className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"AI Quizzes"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-300">
              <div className="text-3xl sm:text-4xl font-bold neon-text-purple font-mono">
                <Code className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"Code Tests"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-500">
              <div className="text-3xl sm:text-4xl font-bold neon-text-green font-mono">
                <Trophy className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"Achievements"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={filters.language}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, language: e.target.value }))
                }
                className="pl-10 pr-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Languages</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
              }
              className="px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                showToast("Please login to generate quizzes", "error");
                navigate("/signin");
                return;
              }
              setShowGenerateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Quiz
          </button>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading quizzes...</p>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              No quizzes available
            </h3>
            <p className="text-gray-500 mb-6">
              Be the first to generate an AI-powered quiz!
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onStart={() => handleStartQuiz(quiz)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generate Quiz Modal */}
      <GenerateQuizModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateQuiz}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default QuizzesPage;
