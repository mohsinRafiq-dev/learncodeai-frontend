import { type CourseSection } from "../../../services/adminCourseAPI";
import { Edit, Trash2, Layers, FileQuestion } from "lucide-react";

interface SectionListProps {
  sections: CourseSection[];
  loading: boolean;
  onEdit: (section: CourseSection) => void;
  onDelete: (sectionId: string) => void;
  onManageLessons: (section: CourseSection) => void;
  onManageQuiz: (section: CourseSection) => void;
}

export default function SectionList({ sections, loading, onEdit, onDelete, onManageLessons, onManageQuiz }: SectionListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading sections...</p>
        </div>
      </div>
    );
  }

  const sectionsArray = Array.isArray(sections) ? sections : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sections ({sectionsArray.length})</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {sectionsArray.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-500">Get started by creating your first section</p>
          </div>
        ) : (
          sectionsArray.map((section) => (
            <div key={section._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {section.lessons.length} lessons
                    </span>
                    {section.sectionQuiz && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Has Quiz
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{section.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Order: {section.order}</span>
                    <span>Hours: {section.estimatedHours}</span>
                    {section.isLocked && (
                      <span className="text-orange-600">Locked</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onManageLessons(section)}
                    className="px-3 py-1 text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Manage Lessons
                  </button>
                  <button
                    onClick={() => onManageQuiz(section)}
                    className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md"
                    title="Manage section quiz"
                  >
                    <FileQuestion className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(section)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title="Edit section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(section._id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
