import React, { useState, useEffect } from "react";
import {
  getQuizDetails,
  submitQuizAnswers,
  type Quiz,
} from "../../../functions/CourseFunctions/courseFunctions";

interface QuizViewerProps {
  courseId: string;
  quizId?: string;
  sectionId: string | null;
  isFinalQuiz: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const QuizViewer: React.FC<QuizViewerProps> = ({
  courseId,
  quizId,
  sectionId,
  isFinalQuiz,
  onComplete,
  onBack,
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      console.log('QuizViewer - quizId:', quizId);
      if (!quizId) {
        setError("Quiz not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getQuizDetails(quizId);
        console.log('Quiz response:', response);
        console.log('Quiz data:', response.data);
        // Support both shapes:
        // 1) { success: true, data: { quiz: {...} } }
        // 2) { success: true, data: {...} } (quiz object directly in data)
        const quizData = response.data?.quiz ?? response.data;
        console.log('Resolved quiz object:', quizData);
        console.log('Resolved quiz questions:', quizData?.questions);
        setQuiz(quizData || null);
      } catch (err: any) {
        console.error("Error loading quiz:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || !quizId) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (q) => !answers[q._id]
    );

    if (unansweredQuestions.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitQuizAnswers(
        quizId,
        courseId,
        sectionId,
        answers
      );

      console.log('Quiz submitted successfully:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      alert(err.message || "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This quiz could not be loaded."}
          </p>
          <button
            onClick={onBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show results if quiz has been submitted
  if (result) {
    const passed = result.passed;

    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Results Header */}
        <div
          className={`rounded-2xl shadow-lg p-8 border mb-6 ${
            passed
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? "Congratulations!" : "Keep Learning"}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {passed
                ? "You passed the quiz!"
                : "You didn't pass this time, but don't give up!"}
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div>
                <p className="text-sm text-gray-600">Your Score</p>
                <p className="text-4xl font-bold text-gray-900">
                  {result.score}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Passing Score</p>
                <p className="text-4xl font-bold text-gray-900">
                  {quiz.passingScore}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Attempts</p>
                <p className="text-4xl font-bold text-gray-900">
                  {result.attemptCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Question Results
          </h3>
          <div className="space-y-6">
            {result.results.map((questionResult: any, index: number) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${
                  questionResult.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex-1">
                    {index + 1}. {questionResult.question}
                  </h4>
                  <span
                    className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      questionResult.isCorrect
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {questionResult.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Your Answer:</span>{" "}
                  {questionResult.userAnswer}
                </p>
                {questionResult.explanation && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Explanation:</span>{" "}
                    {questionResult.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!passed && (
            <button
              onClick={handleRetake}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Retake Quiz
            </button>
          )}
          {passed && (
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Certificate Notice for Final Quiz */}
        {passed && isFinalQuiz && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-medium mb-2">
              🏆 Certificate Pending
            </p>
            <p className="text-yellow-700 text-sm">
              Your certificate is being generated and will be available for
              download after admin approval.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Quiz Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz?.title}</h1>
        {quiz?.description && (
          <p className="text-gray-600">{quiz.description}</p>
        )}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <span>
            <strong>{quiz?.questions?.length || 0}</strong> Questions
          </span>
          <span>
            Passing Score: <strong>{quiz?.passingScore}%</strong>
          </span>
          {quiz?.timeLimit && (
            <span>
              Time Limit: <strong>{quiz.timeLimit} minutes</strong>
            </span>
          )}
        </div>
      </div>

      {/* Quiz Questions */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
        <div className="space-y-8">
          {quiz.questions && quiz.questions.length > 0 ? quiz.questions.map((question, index) => (
            <div key={question._id} className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                {index + 1}. {question.question}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({question.points} {question.points === 1 ? "point" : "points"})
                </span>
              </h3>

              {/* Multiple Choice / True-False */}
              {(question.type === "multiple-choice" ||
                question.type === "true-false") && (
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                        answers[question._id] === option.text
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question._id}
                        value={option.text}
                        checked={answers[question._id] === option.text}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        className="mt-1 mr-3"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {question.type === "short-answer" && (
                <input
                  type="text"
                  value={answers[question._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question._id, e.target.value)
                  }
                  placeholder="Enter your answer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              )}

              {/* Coding Question */}
              {question.type === "coding" && (
                <textarea
                  value={answers[question._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question._id, e.target.value)
                  }
                  placeholder="Write your code here..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
              )}
            </div>
          )) : (
            <p className="text-gray-600">No questions available for this quiz.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizViewer;

