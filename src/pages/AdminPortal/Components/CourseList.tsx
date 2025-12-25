import { type Course } from "../../../services/adminCourseAPI";
import { Edit, Trash2, Layers, Eye, EyeOff } from "lucide-react";

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onManageSections: (course: Course) => void;
  onTogglePublish: (courseId: string) => void;
}

export default function CourseList({ courses, loading, onEdit, onDelete, onManageSections, onTogglePublish }: CourseListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Courses ({courses.length})</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Get started by creating your first course</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    {course.isArchived && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.shortDescription}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{course.language}</span>
                    <span>{course.category}</span>
                    <span>{course.difficulty}</span>
                    <span>{course.estimatedHours}h</span>
                    <span>{course.totalSections} sections</span>
                    <span>{course.totalLessons} lessons</span>
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onTogglePublish(course._id)}
                    className={`p-2 rounded-md text-sm font-medium ${
                      course.isPublished
                        ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                        : "text-green-600 hover:text-green-900 hover:bg-green-50"
                    }`}
                    title={course.isPublished ? "Unpublish course" : "Publish course"}
                  >
                    {course.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onManageSections(course)}
                    className="px-3 py-1 text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => onEdit(course)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title="Edit course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(course._id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                    title="Delete course"
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
