import { type CourseLesson } from "../../../services/adminCourseAPI";
import { Edit, Trash2, FileQuestion } from "lucide-react";

interface LessonListProps {
  lessons: CourseLesson[];
  loading: boolean;
  onEdit: (lesson: CourseLesson) => void;
  onDelete: (lessonId: string) => void;
}

export default function LessonList({ lessons, loading, onEdit, onDelete }: LessonListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading lessons...</p>
        </div>
      </div>
    );
  }

  const lessonsArray = Array.isArray(lessons) ? lessons : [];

  return (
    <div className="space-y-4">
      {lessonsArray.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first lesson</p>
        </div>
      ) : (
        lessonsArray.map((lesson) => (
          <div key={lesson._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{lesson.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Order: {lesson.order}</span>
                  <span>Difficulty: {lesson.difficulty}</span>
                  {lesson.duration > 0 && <span>Duration: {lesson.duration}min</span>}
                  {lesson.estimatedHours > 0 && <span>Hours: {lesson.estimatedHours}</span>}
                  {lesson.videoUrl && <span className="text-blue-600">Has Video</span>}
                  {lesson.codeExamples && lesson.codeExamples.length > 0 && (
                    <span className="text-green-600">{lesson.codeExamples.length} Code Examples</span>
                  )}
                  {lesson.practiceProblems && lesson.practiceProblems.length > 0 && (
                    <span className="text-orange-600">{lesson.practiceProblems.length} Practice Problems</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(lesson)}
                  className="px-3 py-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(lesson._id)}
                  className="px-3 py-1 text-red-600 hover:text-red-900 text-sm font-medium"
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
