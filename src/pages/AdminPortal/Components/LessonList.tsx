import { type CourseLesson } from "../../../services/adminCourseAPI";
import { FileQuestion } from "lucide-react";

interface LessonListProps {
  lessons: CourseLesson[];
  loading: boolean;
  onEdit: (lesson: CourseLesson) => void;
  onDelete: (lessonId: string) => void;
}

export default function LessonList({
  lessons,
  loading,
  onEdit,
  onDelete,
}: LessonListProps) {
  if (loading) {
    return (
      <div className="bg-[#0d1230] rounded-lg border border-[#2a3050] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading lessons...</p>
        </div>
      </div>
    );
  }

  const lessonsArray = Array.isArray(lessons) ? lessons : [];

  return (
    <div className="space-y-4">
      {lessonsArray.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#2a3050] rounded-lg">
          <FileQuestion className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            No lessons yet
          </h3>
          <p className="text-gray-400 mb-4">
            Get started by adding your first lesson
          </p>
        </div>
      ) : (
        lessonsArray.map((lesson) => (
          <div
            key={lesson._id}
            className="border border-[#2a3050] rounded-lg p-4 bg-[#0d1230] hover:bg-[#1a1f3e]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-100">
                  {lesson.title}
                </h4>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Order: {lesson.order}</span>
                  <span>Difficulty: {lesson.difficulty}</span>
                  {(lesson.duration ?? 0) > 0 && (
                    <span>Duration: {lesson.duration}min</span>
                  )}
                  {(lesson.estimatedHours ?? 0) > 0 && (
                    <span>Hours: {lesson.estimatedHours}</span>
                  )}
                  {lesson.videoUrl && (
                    <span className="text-blue-400">Has Video</span>
                  )}
                  {lesson.codeExamples && lesson.codeExamples.length > 0 && (
                    <span className="text-green-400">
                      {lesson.codeExamples.length} Code Examples
                    </span>
                  )}
                  {lesson.practiceProblems &&
                    lesson.practiceProblems.length > 0 && (
                      <span className="text-orange-400">
                        {lesson.practiceProblems.length} Practice Problems
                      </span>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(lesson)}
                  className="px-3 py-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(lesson._id)}
                  className="px-3 py-1 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
