import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  adminCourseAPI,
  type CourseSection,
  type Quiz,
  type QuizQuestion,
} from "../../../services/adminCourseAPI";
import { useToast } from "../../../contexts/ToastContext";

interface QuizFormProps {
  show: boolean;
  section: CourseSection;
  editingQuiz?: Quiz | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuizForm({
  show,
  section,
  editingQuiz,
  onSave,
  onCancel,
}: QuizFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    shuffleOptions: true,
    showAnswerExplanation: true,
    retakeAllowed: true,
    maxRetakes: 3,
    questions: [] as QuizQuestion[],
  });

  const { showToast } = useToast();

  useEffect(() => {
    if (editingQuiz) {
      setFormData({
        title: editingQuiz.title,
        description: editingQuiz.description || "",
        passingScore: editingQuiz.passingScore,
        timeLimit: editingQuiz.timeLimit,
        shuffleQuestions: editingQuiz.shuffleQuestions,
        shuffleOptions: editingQuiz.shuffleOptions,
        showAnswerExplanation: editingQuiz.showAnswerExplanation,
        retakeAllowed: editingQuiz.retakeAllowed,
        maxRetakes: editingQuiz.maxRetakes,
        questions: editingQuiz.questions,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        passingScore: 70,
        timeLimit: 15,
        shuffleQuestions: true,
        shuffleOptions: true,
        showAnswerExplanation: true,
        retakeAllowed: true,
        maxRetakes: 3,
        questions: [],
      });
    }
  }, [editingQuiz, show]);

  const addQuestion = () => {
    const currentQuestions = formData.questions || [];
    const newQuestion: QuizQuestion = {
      type: "multiple-choice",
      question: "",
      description: "",
      order: currentQuestions.length + 1,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      points: 1,
      explanation: "",
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...currentQuestions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q, i) =>
        i === index ? { ...q, ...updates } : q
      ),
    }));
  };

  const deleteQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || [])
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 })),
    }));
  };

  const addOption = (questionIndex: number) => {
    updateQuestion(questionIndex, {
      options: [
        ...(formData.questions[questionIndex].options || []),
        { text: "", isCorrect: false },
      ],
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => {
    const question = formData.questions[questionIndex];
    const updatedOptions =
      question.options?.map((opt, i) =>
        i === optionIndex ? { ...opt, text } : opt
      ) || [];
    updateQuestion(questionIndex, { options: updatedOptions });
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    const question = formData.questions[questionIndex];
    const updatedOptions =
      question.options?.map((opt, i) => ({
        ...opt,
        isCorrect: i === optionIndex,
      })) || [];
    updateQuestion(questionIndex, { options: updatedOptions });
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const question = formData.questions[questionIndex];
    const updatedOptions =
      question.options?.filter((_, i) => i !== optionIndex) || [];
    updateQuestion(questionIndex, { options: updatedOptions });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast("Quiz title is required", "error");
      return;
    }

    if (!formData.questions || formData.questions.length === 0) {
      showToast("At least one question is required", "error");
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.question.trim()) {
        showToast(`Question ${i + 1} text is required`, "error");
        return;
      }

      if (
        question.type === "multiple-choice" ||
        question.type === "true-false"
      ) {
        if (!question.options || question.options.length < 2) {
          showToast(`Question ${i + 1} must have at least 2 options`, "error");
          return;
        }

        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          showToast(
            `Question ${i + 1} must have a correct answer selected`,
            "error"
          );
          return;
        }

        const hasEmptyOptions = question.options.some(
          (opt) => !opt.text.trim()
        );
        if (hasEmptyOptions) {
          showToast(`Question ${i + 1} has empty option text`, "error");
          return;
        }
      }
    }

    try {
      setLoading(true);

      const quizData = {
        ...formData,
        sectionId: section._id,
        courseId: section.course,
        type: "section-quiz" as const,
      };

      if (editingQuiz) {
        await adminCourseAPI.updateQuiz(editingQuiz._id, formData);
        showToast("Quiz updated successfully", "success");
      } else {
        await adminCourseAPI.createOrUpdateQuiz(quizData);
        showToast("Quiz created successfully", "success");
      }

      onSave();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save quiz";
      showToast(message, "error");
      console.error("Error saving quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editingQuiz ? "Edit Quiz" : "Create Quiz"} - {section.title}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passingScore: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Retakes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxRetakes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRetakes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter quiz description"
              />
            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shuffleQuestions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shuffleQuestions: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Shuffle Questions
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shuffleOptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shuffleOptions: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Shuffle Options
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.showAnswerExplanation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      showAnswerExplanation: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Show Answer Explanations
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.retakeAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retakeAllowed: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow Retakes
                </span>
              </label>
            </div>

            {/* Questions Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Questions ({(formData.questions || []).length})
                </h3>
                <button
                  onClick={addQuestion}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {(formData.questions || []).map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900">
                        Question {questionIndex + 1}
                      </h4>
                      <button
                        onClick={() => deleteQuestion(questionIndex)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                type: e.target.value as QuizQuestion["type"],
                                options:
                                  e.target.value === "true-false"
                                    ? [
                                        { text: "True", isCorrect: false },
                                        { text: "False", isCorrect: false },
                                      ]
                                    : question.options,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="multiple-choice">
                              Multiple Choice
                            </option>
                            <option value="true-false">True/False</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                points: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              question: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Enter your question"
                        />
                      </div>

                      {/* Options for multiple choice and true/false */}
                      {(question.type === "multiple-choice" ||
                        question.type === "true-false") && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Answer Options
                            </label>
                            {question.type === "multiple-choice" && (
                              <button
                                onClick={() => addOption(questionIndex)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              >
                                Add Option
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={option.isCorrect}
                                  onChange={() =>
                                    setCorrectOption(questionIndex, optionIndex)
                                  }
                                  className="flex-shrink-0"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  readOnly={question.type === "true-false"}
                                />
                                {question.type === "multiple-choice" &&
                                  question.options &&
                                  question.options.length > 2 && (
                                    <button
                                      onClick={() =>
                                        deleteOption(questionIndex, optionIndex)
                                      }
                                      className="p-1 text-red-600 hover:text-red-800"
                                      title="Delete option"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              explanation: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Explain the correct answer"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.questions || formData.questions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : editingQuiz
              ? "Update Quiz"
              : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

