import { useState, useEffect, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { adminCourseAPI, type Course, type CourseSection, type Quiz } from "../../../services/adminCourseAPI";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import SectionList from "./SectionList";
import SectionForm from "./SectionForm";
import LessonManagement from "./LessonManagement";
import QuizForm from "./QuizForm";

interface SectionManagementProps {
  course: Course;
  onClose: () => void;
}

export default function SectionManagement({ course, onClose }: SectionManagementProps) {
  const sectionContainerRef = useRef<HTMLDivElement>(null);
  const [showSectionFormModal, setShowSectionFormModal] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    description: "",
    estimatedHours: 0,
    order: 0,
  });
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    sectionId: null as string | null,
  });

  const { showToast } = useToast();

  // Fetch course sections
  const fetchCourseSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCourseAPI.getCourseSections(course._id);
      setCourseSections(Array.isArray(response) ? response : []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch sections";
      showToast(message, "error");
      console.error("Error fetching sections:", error);
      setCourseSections([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }, [course._id, showToast]);

  useEffect(() => {
    fetchCourseSections();
  }, [fetchCourseSections]);

  // Scroll to sections when component mounts
  useEffect(() => {
    if (sectionContainerRef.current) {
      setTimeout(() => {
        sectionContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, []);

  const resetSectionForm = () => {
    setSectionFormData({
      title: "",
      description: "",
      estimatedHours: 0,
      order: courseSections.length, // Default to next order
    });
    setEditingSection(null);
  };

  const openSectionForm = (section?: CourseSection) => {
    if (section) {
      setSectionFormData({
        title: section.title,
        description: section.description || "",
        estimatedHours: section.estimatedHours,
        order: section.order,
      });
      setEditingSection(section);
    } else {
      resetSectionForm();
    }
    setShowSectionFormModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionFormData.title || !sectionFormData.description) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingSection) {
        await adminCourseAPI.updateSection(editingSection._id, sectionFormData);
        showToast("Section updated successfully", "success");
      } else {
        await adminCourseAPI.createSection(course._id, sectionFormData);
        showToast("Section created successfully", "success");
      }

      fetchCourseSections();
      setShowSectionFormModal(false);
      resetSectionForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save section";
      showToast(message, "error");
      console.error("Error saving section:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteConfirm.sectionId) return;

    try {
      setLoading(true);
      await adminCourseAPI.deleteSection(deleteConfirm.sectionId);
      showToast("Section deleted successfully", "success");
      fetchCourseSections();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete section";
      showToast(message, "error");
      console.error("Error deleting section:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLessonModal = (section: CourseSection) => {
    setSelectedSection(section);
    setShowLessonModal(true);
  };

  const openQuizModal = async (section: CourseSection) => {
    setSelectedSection(section);
    
    // If section has a quiz, fetch the full quiz data
    if (section.sectionQuiz) {
      try {
        setLoading(true);
        // Handle both string ID and object cases
        const quizId = typeof section.sectionQuiz === 'string' ? section.sectionQuiz : section.sectionQuiz._id;
        
        if (quizId) {
          const quizData = await adminCourseAPI.getQuiz(quizId);
          setEditingQuiz(quizData);
        } else {
          // If we already have the full quiz object, use it directly
          setEditingQuiz(typeof section.sectionQuiz === 'object' ? section.sectionQuiz : null);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        showToast('Failed to load quiz data', 'error');
        // If fetching fails but we have the quiz object, use it
        if (typeof section.sectionQuiz === 'object') {
          setEditingQuiz(section.sectionQuiz);
        } else {
          setEditingQuiz(null);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setEditingQuiz(null);
    }
    
    setShowQuizModal(true);
  };

  const handleQuizSave = async () => {
    setShowQuizModal(false);
    setEditingQuiz(null);
    setSelectedSection(null);
    fetchCourseSections();
  };

  const handleQuizCancel = () => {
    setShowQuizModal(false);
    setEditingQuiz(null);
    setSelectedSection(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manage Sections - {course.title}</h2>
          <p className="text-sm text-gray-600">Create and organize course sections</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openSectionForm()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Section List */}
      <div ref={sectionContainerRef}>
        <SectionList
          sections={courseSections}
          loading={loading}
          onEdit={openSectionForm}
          onDelete={(sectionId) => setDeleteConfirm({ show: true, sectionId })}
          onManageLessons={openLessonModal}
          onManageQuiz={openQuizModal}
        />
      </div>

      {/* Section Form Modal */}
      <SectionForm
        show={showSectionFormModal}
        editingSection={editingSection}
        formData={sectionFormData}
        setFormData={setSectionFormData}
        loading={loading}
        onSave={handleSaveSection}
        onCancel={() => {
          setShowSectionFormModal(false);
          resetSectionForm();
        }}
      />

      {/* Quiz Form Modal */}
      {showQuizModal && selectedSection && (
        <QuizForm
          show={showQuizModal}
          section={selectedSection}
          editingQuiz={editingQuiz}
          onSave={handleQuizSave}
          onCancel={handleQuizCancel}
        />
      )}

      {/* Lesson Management Modal */}
      {selectedSection && (
        <LessonManagement
          show={showLessonModal}
          section={selectedSection}
          course={course}
          onClose={() => setShowLessonModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone and will also delete all lessons within this section."
        confirmText="Delete Section"
        cancelText="Cancel"
        onConfirm={async () => {
          await handleDeleteSection();
          setDeleteConfirm({ show: false, sectionId: null });
        }}
        onCancel={() => setDeleteConfirm({ show: false, sectionId: null })}
      />
    </div>
  );
}
