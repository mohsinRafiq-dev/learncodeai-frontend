import { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { adminCourseAPI, type Course, type CourseSection, type CourseLesson } from "../../../services/adminCourseAPI";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import LessonList from "./LessonList";
import LessonForm from "./LessonForm";

interface LessonManagementProps {
  show: boolean;
  section: CourseSection;
  course: Course;
  onClose: () => void;
}

export default function LessonManagement({ show, section, course, onClose }: LessonManagementProps) {
  const [showLessonFormModal, setShowLessonFormModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [sectionLessons, setSectionLessons] = useState<CourseLesson[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    lessonId: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const fetchSectionLessons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCourseAPI.getSectionLessons(section._id);
      setSectionLessons(Array.isArray(response) ? response : []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch lessons";
      showToast(message, "error");
      console.error("Error fetching lessons:", error);
      setSectionLessons([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [section._id, showToast]);

  useEffect(() => {
    if (show) {
      fetchSectionLessons();
    }
  }, [show, fetchSectionLessons]);

  const resetLessonForm = () => {
    setEditingLesson(null);
  };

  const openLessonForm = (lesson?: CourseLesson) => {
    if (lesson) {
      setEditingLesson(lesson);
    } else {
      resetLessonForm();
    }
    setShowLessonFormModal(true);
  };

  const handleSaveLesson = async () => {
    showToast("Lesson saved successfully", "success");
    setShowLessonFormModal(false);
    resetLessonForm();
    fetchSectionLessons();
  };

  const handleDeleteLesson = async () => {
    if (!deleteConfirm.lessonId) return;

    try {
      setLoading(true);
      await adminCourseAPI.deleteLesson(deleteConfirm.lessonId);
      showToast("Lesson deleted successfully", "success");
      fetchSectionLessons();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete lesson";
      showToast(message, "error");
      console.error("Error deleting lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Admin Panel / Courses / {course.title} / {section.title} / Lesson Management
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Lessons - {section.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Lessons</h3>
                <p className="text-sm text-gray-500">Create and organize lesson content</p>
              </div>
              <button
                onClick={() => openLessonForm()}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </button>
            </div>

            <LessonList
              lessons={sectionLessons}
              loading={loading}
              onEdit={openLessonForm}
              onDelete={(lessonId) => setDeleteConfirm({ show: true, lessonId })}
            />

            {showLessonFormModal && (
              <LessonForm
                editingLesson={editingLesson}
                section={section}
                course={course}
                onSave={handleSaveLesson}
                onCancel={() => {
                  setShowLessonFormModal(false);
                  resetLessonForm();
                }}
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Close
          </button>
        </div>

        <ConfirmModal
          isOpen={deleteConfirm.show}
          title="Delete Lesson"
          message="Are you sure you want to delete this lesson? This action cannot be undone."
          confirmText="Delete Lesson"
          cancelText="Cancel"
          onConfirm={async () => {
            await handleDeleteLesson();
            setDeleteConfirm({ show: false, lessonId: null });
          }}
          onCancel={() => setDeleteConfirm({ show: false, lessonId: null })}
        />
      </div>
    </div>
  );
}
