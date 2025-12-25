import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  adminCourseAPI,
  type Course,
  type CourseSection,
  type CourseLesson,
  type CodeExample,
  type Resource,
} from "../../../services/adminCourseAPI";
import { useToast } from "../../../contexts/ToastContext";

interface LessonFormProps {
  editingLesson: CourseLesson | null;
  section: CourseSection;
  course: Course;
  onSave: () => void;
  onCancel: () => void;
}

export default function LessonForm({
  editingLesson,
  section,
  course,
  onSave,
  onCancel,
}: LessonFormProps) {
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    description: "",
    content: "",
    order: 1,
    videoUrl: "",
    duration: 0,
    codeExamples: [] as CodeExample[],
    practiceProblems: [] as string[],
    notes: [] as string[],
    tips: [] as string[],
    resources: [] as Resource[],
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    estimatedHours: 0,
  });
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (editingLesson) {
      setLessonFormData({
        title: editingLesson.title,
        description: editingLesson.description || "",
        content: editingLesson.content,
        order: editingLesson.order,
        videoUrl: editingLesson.videoUrl || "",
        duration: editingLesson.duration || 0,
        codeExamples: editingLesson.codeExamples || [],
        practiceProblems: editingLesson.practiceProblems || [],
        notes: editingLesson.notes || [],
        tips: editingLesson.tips || [],
        resources: editingLesson.resources || [],
        difficulty: (editingLesson.difficulty as "beginner" | "intermediate" | "advanced") || "beginner",
        estimatedHours: editingLesson.estimatedHours || 0,
      });
    } else {
      // Reset for new lesson
      setLessonFormData({
        title: "",
        description: "",
        content: "",
        order: 1,
        videoUrl: "",
        duration: 0,
        codeExamples: [],
        practiceProblems: [],
        notes: [],
        tips: [],
        resources: [],
        difficulty: "beginner",
        estimatedHours: 0,
      });
    }
  }, [editingLesson]);

  // Code example handlers
  const addCodeExample = () => {
    setLessonFormData({
      ...lessonFormData,
      codeExamples: [
        ...lessonFormData.codeExamples,
        { language: "", title: "", code: "", description: "" },
      ],
    });
  };

  const removeCodeExample = (index: number) => {
    setLessonFormData({
      ...lessonFormData,
      codeExamples: lessonFormData.codeExamples.filter((_, i) => i !== index),
    });
  };

  const updateCodeExample = (index: number, field: keyof CodeExample, value: string) => {
    const updated = [...lessonFormData.codeExamples];
    updated[index] = { ...updated[index], [field]: value };
    setLessonFormData({ ...lessonFormData, codeExamples: updated });
  };

  // Notes handlers
  const addNote = () => {
    setLessonFormData({
      ...lessonFormData,
      notes: [...lessonFormData.notes, ""],
    });
  };

  const removeNote = (index: number) => {
    setLessonFormData({
      ...lessonFormData,
      notes: lessonFormData.notes.filter((_, i) => i !== index),
    });
  };

  const updateNote = (index: number, value: string) => {
    const updated = [...lessonFormData.notes];
    updated[index] = value;
    setLessonFormData({ ...lessonFormData, notes: updated });
  };

  // Tips handlers
  const addTip = () => {
    setLessonFormData({
      ...lessonFormData,
      tips: [...lessonFormData.tips, ""],
    });
  };

  const removeTip = (index: number) => {
    setLessonFormData({
      ...lessonFormData,
      tips: lessonFormData.tips.filter((_, i) => i !== index),
    });
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...lessonFormData.tips];
    updated[index] = value;
    setLessonFormData({ ...lessonFormData, tips: updated });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingLesson) {
        await adminCourseAPI.updateLesson(editingLesson._id, lessonFormData);
        showToast("Lesson updated successfully", "success");
      } else {
        await adminCourseAPI.createLesson(section._id, lessonFormData);
        showToast("Lesson created successfully", "success");
      }
      onSave();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save lesson";
      showToast(message, "error");
      console.error("Error saving lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Admin Panel / Courses / {course.title} / {section.title} / {editingLesson ? "Edit" : "Create New"}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingLesson ? "Edit Lesson" : "Create New Lesson"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading || !lessonFormData.title.trim() || !lessonFormData.content.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingLesson ? "Update Lesson" : "Create Lesson"}
            </button>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Lesson Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter Lesson Title"
                  value={lessonFormData.title}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of the lesson"
                  value={lessonFormData.description}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Difficulty *
                </label>
                <select
                  value={lessonFormData.difficulty}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      difficulty: e.target.value as "beginner" | "intermediate" | "advanced",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lesson Order *
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonFormData.order}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={lessonFormData.estimatedHours}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      estimatedHours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.0"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={lessonFormData.videoUrl}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      videoUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lessonFormData.duration}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Middle Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Lesson Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lesson Content *
                </label>
                <textarea
                  placeholder="Enter the main lesson content..."
                  value={lessonFormData.content}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={12}
                />
              </div>

              {/* Code Examples */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Code Examples
                  </label>
                  <button
                    type="button"
                    onClick={addCodeExample}
                    className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200"
                  >
                    + Add Example
                  </button>
                </div>
                <div className="space-y-3">
                  {lessonFormData.codeExamples.map((example, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Example {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCodeExample(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Language</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            value={example.language}
                            onChange={(e) => updateCodeExample(index, 'language', e.target.value)}
                            placeholder="e.g., JavaScript"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            value={example.title}
                            onChange={(e) => updateCodeExample(index, 'title', e.target.value)}
                            placeholder="Example title"
                          />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">Code</label>
                        <textarea
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                          rows={4}
                          value={example.code}
                          onChange={(e) => updateCodeExample(index, 'code', e.target.value)}
                          placeholder="Enter code..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Description</label>
                        <textarea
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          rows={2}
                          value={example.description}
                          onChange={(e) => updateCodeExample(index, 'description', e.target.value)}
                          placeholder="Optional description..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Notes
                  </label>
                  <button
                    type="button"
                    onClick={addNote}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200"
                  >
                    + Add Note
                  </button>
                </div>
                <div className="space-y-2">
                  {lessonFormData.notes.map((note, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        value={note}
                        onChange={(e) => updateNote(index, e.target.value)}
                        placeholder="Add a note..."
                      />
                      <button
                        type="button"
                        onClick={() => removeNote(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Tips
                  </label>
                  <button
                    type="button"
                    onClick={addTip}
                    className="px-3 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 border border-yellow-200"
                  >
                    + Add Tip
                  </button>
                </div>
                <div className="space-y-2">
                  {lessonFormData.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        value={tip}
                        onChange={(e) => updateTip(index, e.target.value)}
                        placeholder="Add a helpful tip..."
                      />
                      <button
                        type="button"
                        onClick={() => removeTip(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Resources
                </label>
                <textarea
                  placeholder="Add resources (format: Title: URL, one per line)"
                  value={lessonFormData.resources.map(r => `${r.title}: ${r.url}`).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    const resources = lines.map(line => {
                      const [title, url] = line.split(': ').map(s => s.trim());
                      return { title: title || '', url: url || '', type: 'link' };
                    }).filter(r => r.title && r.url);
                    setLessonFormData({ ...lessonFormData, resources });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Format: Resource Title: https://example.com (one per line)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !lessonFormData.title.trim() || !lessonFormData.content.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? "Saving..." : editingLesson ? "Update Lesson" : "Create Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

