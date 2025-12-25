import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { adminCourseAPI, type Course } from "../../../services/adminCourseAPI";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import CourseForm from "./CourseForm";
import SectionManagement from "./SectionManagement";

interface CourseManagementProps {
  onError?: (message: string) => void;
  highlightedCourseId?: string;
}

export default function CourseManagement({ highlightedCourseId }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    courseId: null as string | null,
  });

  // Section management state
  const [selectedCourseForSections, setSelectedCourseForSections] =
    useState<Course | null>(null);
  const [activeLanguageTab, setActiveLanguageTab] = useState("all");

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    language: "",
    category: "",
    difficulty: "",
    page: 1,
    limit: 10,
  });

  // Update filters when tab changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      language: activeLanguageTab === "all" ? "" : activeLanguageTab,
    }));
  }, [activeLanguageTab]);

  // Pagination
  // const [pagination, setPagination] = useState({
  //   total: 0,
  //   pages: 0,
  //   currentPage: 1,
  // });

  // Form data
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    shortDescription: string;
    language: string;
    category: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedHours: number;
    certificateTemplate: "standard" | "distinguished" | "excellence";
    tags: string[];
    prerequisites: string[];
  }>({
    title: "",
    description: "",
    shortDescription: "",
    language: "",
    category: "",
    difficulty: "beginner",
    estimatedHours: 0,
    certificateTemplate: "standard",
    tags: [],
    prerequisites: [],
  });

  const { showToast } = useToast();

  // Handle highlighting
  useEffect(() => {
    if (highlightedCourseId) {
      setHighlightedCourse(highlightedCourseId);
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedCourse(null);
      }, 3000);
    }
  }, [highlightedCourseId]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCourseAPI.getAllCourses(filters);
      setCourses(response.data);
      // setPagination(response.pagination);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch courses";
      showToast(message, "error");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchCourses();
  }, [filters, fetchCourses]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      language: "",
      category: "",
      difficulty: "beginner",
      estimatedHours: 0,
      certificateTemplate: "standard",
      tags: [],
      prerequisites: [],
    });
    setEditingCourse(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription,
      language: course.language,
      category: course.category,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      certificateTemplate: course.certificateTemplate,
      tags: course.tags || [],
      prerequisites: course.prerequisites || [],
    });
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSaveCourse = async () => {
    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.shortDescription ||
        !formData.language ||
        !formData.category
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      setLoading(true);

      if (editingCourse) {
        await adminCourseAPI.updateCourse(editingCourse._id, formData);
        showToast("Course updated successfully", "success");
      } else {
        await adminCourseAPI.createCourse(formData);
        showToast("Course created successfully", "success");
      }

      fetchCourses();
      setShowAddModal(false);
      resetForm();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save course";
      showToast(message, "error");
      console.error("Error saving course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setLoading(true);
      await adminCourseAPI.deleteCourse(courseId);
      showToast("Course deleted successfully", "success");
      fetchCourses();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete course";
      showToast(message, "error");
      console.error("Error deleting course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await adminCourseAPI.togglePublishCourse(courseId);
      showToast(
        response.message || "Course publish status updated successfully",
        "success"
      );
      fetchCourses();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to toggle course publish status";
      showToast(message, "error");
      console.error("Error toggling course publish status:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSectionModal = (course: Course) => {
    setSelectedCourseForSections(course);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Admin Panel / Courses
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Course Management
            </h1>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>
      </div>

      {/* Language Tabs and Filters */}
      <div className="bg-white border-b border-gray-200">
        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveLanguageTab("all")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeLanguageTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Languages
            </button>
            {["javascript", "python", "cpp"].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguageTab(lang)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeLanguageTab === lang
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang === "cpp"
                  ? "C++"
                  : lang === "csharp"
                  ? "C#"
                  : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Filters */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="data-science">Data Science</option>
              <option value="machine-learning">Machine Learning</option>
              <option value="devops">DevOps</option>
              <option value="security">Security</option>
              <option value="game-development">Game Development</option>
              <option value="blockchain">Blockchain</option>
              <option value="other">Other</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  TITLE
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  CATEGORY
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  DIFFICULTY
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  LANGUAGE
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  SECTIONS
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  STATUS
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ${
                      highlightedCourse === course._id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 border-r-4 border-r-blue-500 border-t-2 border-t-blue-400 border-b-2 border-b-blue-400 shadow-lg shadow-blue-200/50 animate-pulse' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {course.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {course.shortDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {course.category
                        .replace("-", " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          course.difficulty === "beginner"
                            ? "bg-green-50 text-green-700"
                            : course.difficulty === "intermediate"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {course.language === "cpp"
                        ? "C++"
                        : course.language === "csharp"
                        ? "C#"
                        : course.language.charAt(0).toUpperCase() +
                          course.language.slice(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {course.totalSections || 0} sections
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          course.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onTogglePublish(course._id)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {course.isPublished ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => openSectionModal(course)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              show: true,
                              courseId: course._id,
                            })
                          }
                          className="p-1.5 hover:bg-gray-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        {courses.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      <CourseForm
        show={showAddModal}
        editingCourse={editingCourse}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        onSave={handleSaveCourse}
        onCancel={() => {
          setShowAddModal(false);
          resetForm();
        }}
      />

      {/* Section Management Modal */}
      {selectedCourseForSections && (
        <SectionManagement
          course={selectedCourseForSections}
          onClose={() => {
            setSelectedCourseForSections(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will also delete all sections and lessons within this course."
        confirmText="Delete Course"
        cancelText="Cancel"
        onConfirm={async () => {
          if (deleteConfirm.courseId) {
            await handleDeleteCourse(deleteConfirm.courseId);
          }
          setDeleteConfirm({ show: false, courseId: null });
        }}
        onCancel={() => setDeleteConfirm({ show: false, courseId: null })}
      />
    </div>
  );
}

