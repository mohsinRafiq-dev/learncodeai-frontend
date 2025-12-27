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

export default function CourseList({
  courses,
  loading,
  onEdit,
  onDelete,
  onManageSections,
  onTogglePublish,
}: CourseListProps) {
  if (loading) {
    return (
      <div className="bg-[#0d1230] rounded-lg border border-[#2a3050] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1230] rounded-lg border border-[#2a3050] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a3050]">
        <h2 className="text-lg font-medium text-gray-100">
          Courses ({courses.length})
        </h2>
      </div>

      <div className="divide-y divide-[#2a3050]">
        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Layers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-100 mb-2">
              No courses found
            </h3>
            <p className="text-gray-400">
              Get started by creating your first course
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="px-6 py-4 hover:bg-[#1a1f3e]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-100">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.isPublished
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    {course.isArchived && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700/30 text-gray-400">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {course.shortDescription}
                  </p>
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
                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-900/30"
                        : "text-green-400 hover:text-green-300 hover:bg-green-900/30"
                    }`}
                    title={
                      course.isPublished ? "Unpublish course" : "Publish course"
                    }
                  >
                    {course.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onManageSections(course)}
                    className="px-3 py-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => onEdit(course)}
                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#252a4a] rounded-md"
                    title="Edit course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(course._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md"
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
