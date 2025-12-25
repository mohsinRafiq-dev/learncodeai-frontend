import React from "react";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CourseLesson, CourseSection } from "../../../functions/CourseFunctions/courseFunctions";

interface CourseLessonViewerProps {
  lesson: CourseLesson;
  section: CourseSection;
  onNext: () => void;
  onPrevious: () => void;
}

const CourseLessonViewer: React.FC<CourseLessonViewerProps> = ({
  lesson,
  onNext,
  onPrevious,
}) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLanguageForSyntax = (lang?: string) => {
    const langMap: { [key: string]: string } = {
      cpp: "cpp",
      "c++": "cpp",
      python: "python",
      javascript: "javascript",
      js: "javascript",
    };
    return langMap[lang?.toLowerCase() || ""] || "cpp";
  };

  return (
    <>
      {/* Lesson Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

        {lesson.description && (
          <p className="text-gray-700 mb-6">{lesson.description}</p>
        )}

        <div className="flex gap-2">
          {lesson.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty}
            </span>
          )}
          {lesson.duration && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              ⏱️ {lesson.duration} min
            </span>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      {lesson.content && lesson.content.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Content
          </h2>
          <div className="prose prose-lg max-w-none bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} className="lesson-content" />
          </div>
        </div>
      )}

      {/* Code Examples */}
      {lesson.codeExamples && lesson.codeExamples.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Code Examples
          </h2>
          {lesson.codeExamples.map((example, index) => (
            <div key={index} className="mb-6">
              {example.description && (
                <p className="text-gray-700 mb-3 font-medium">{example.description}</p>
              )}
              <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                  <span className="text-white text-sm font-medium">{example.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      onClick={() => {
                        navigate("/editor", {
                          state: {
                            code: example.code,
                            language: getLanguageForSyntax(example.language),
                          },
                        });
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Run Code</span>
                    </button>
                    <button
                      className="flex items-center space-x-1 text-white text-sm hover:text-gray-300"
                      onClick={() => navigator.clipboard.writeText(example.code)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <SyntaxHighlighter
                  language={getLanguageForSyntax(example.language)}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: "1.5rem", fontSize: "0.9rem" }}
                  showLineNumbers
                >
                  {example.code}
                </SyntaxHighlighter>
              </div>

              {/* Input/Output Section */}
              {(example.input || example.expectedOutput) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {example.input && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Input:</h4>
                      <pre className="text-sm text-blue-800 whitespace-pre-wrap">{example.input}</pre>
                    </div>
                  )}
                  {example.expectedOutput && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">Expected Output:</h4>
                      <pre className="text-sm text-green-800 whitespace-pre-wrap">{example.expectedOutput}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {lesson.tips && lesson.tips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            Pro Tips
          </h2>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 shadow-md">
            <ul className="space-y-3">
              {lesson.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">▸</span>
                  <span className="text-gray-700 text-lg">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {lesson.notes && lesson.notes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            Important Notes
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
            <ul className="space-y-3">
              {lesson.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">●</span>
                  <span className="text-gray-700 text-lg">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Resources Section */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Additional Resources
          </h2>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <span className="text-2xl">
                    {resource.type === 'documentation' ? '📖' : resource.type === 'video' ? '🎥' : '🔗'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                    <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                  </div>
                  <span className="text-purple-600">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lesson-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .lesson-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .lesson-content p {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #4b5563;
          margin-bottom: 1rem;
        }
        .lesson-content ul {
          list-style-type: disc;
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        .lesson-content li {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        .lesson-content strong {
          font-weight: 600;
          color: #1f2937;
        }
        .lesson-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #dc2626;
        }
        .lesson-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .lesson-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </>
  );
};

export default CourseLessonViewer;

