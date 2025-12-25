import api from "./api";

// Course interface for type safety
export interface Course {
  _id: string;
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
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  sections: string[];
  totalSections: number;
  totalLessons: number;
  enrollmentCount: number;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  finalQuiz?: string;
}

export interface CourseSection {
  _id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons: string[];
  sectionQuiz?: string;
  estimatedHours: number;
  isLocked: boolean;
  unlockCondition?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  type: "section-quiz" | "final-quiz" | "practice-quiz";
  course?: string;
  section?: string;
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showAnswerExplanation: boolean;
  retakeAllowed: boolean;
  maxRetakes: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  _id?: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "coding";
  question: string;
  description?: string;
  order: number;
  options?: { text: string; isCorrect: boolean }[];
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  codingProblem?: {
    title: string;
    description: string;
    starterCode: string;
    language: string;
    testCases: { input: string; expectedOutput: string }[];
  };
  points: number;
  explanation?: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  input?: string;
  expectedOutput?: string;
  order?: number;
}

export interface CourseLesson {
  _id: string;
  section: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  videoUrl?: string;
  duration?: number;
  codeExamples?: CodeExample[];
  practiceProblems?: string[];
  notes?: string[];
  tips?: string[];
  resources?: Resource[];
  difficulty?: string;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

// Admin Course API
export const adminCourseAPI = {
  // Get all courses (with filters)
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    language?: string;
    category?: string;
    search?: string;
  }) => {
    const response = await api.get("/admin/courses", { params });
    return response.data;
  },

  // Get single course
  getCourse: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create new course
  createCourse: async (courseData: {
    title: string;
    description: string;
    shortDescription: string;
    language: string;
    category: string;
    difficulty?: string;
    estimatedHours?: number;
    certificateTemplate?: string;
    tags?: string[];
    prerequisites?: string[];
  }) => {
    const response = await api.post("/admin/courses", courseData);
    return response.data.data;
  },

  // Update course
  updateCourse: async (
    courseId: string,
    courseData: {
      title?: string;
      description?: string;
      shortDescription?: string;
      language?: string;
      category?: string;
      difficulty?: string;
      estimatedHours?: number;
      certificateTemplate?: string;
      tags?: string[];
      prerequisites?: string[];
    }
  ) => {
    const response = await api.put(`/admin/courses/${courseId}`, courseData);
    return response.data.data;
  },

  // Delete course
  deleteCourse: async (courseId: string) => {
    const response = await api.delete(`/admin/courses/${courseId}`);
    return response.data;
  },

  // Get course sections
  getCourseSections: async (courseId: string) => {
    const response = await api.get(`/admin/courses/${courseId}/sections`);
    return response.data?.data || [];
  },

  // Create section
  createSection: async (
    courseId: string,
    sectionData: {
      title: string;
      description?: string;
      order: number;
      estimatedHours?: number;
    }
  ) => {
    const response = await api.post(
      `/admin/courses/${courseId}/sections`,
      sectionData
    );
    return response.data.data;
  },

  // Update section
  updateSection: async (
    sectionId: string,
    sectionData: {
      title?: string;
      description?: string;
      order?: number;
      estimatedHours?: number;
    }
  ) => {
    const response = await api.put(
      `/admin/courses/sections/${sectionId}`,
      sectionData
    );
    return response.data.data;
  },

  // Delete section
  deleteSection: async (sectionId: string) => {
    const response = await api.delete(`/admin/courses/sections/${sectionId}`);
    return response.data;
  },

  // Create lesson
  createLesson: async (
    sectionId: string,
    lessonData: {
      title: string;
      description?: string;
      content: string;
      order: number;
      videoUrl?: string;
      duration?: number;
      codeExamples?: CodeExample[];
      practiceProblems?: string[];
      notes?: string[];
      tips?: string[];
      resources?: Resource[];
      difficulty?: string;
      estimatedHours?: number;
    }
  ) => {
    const response = await api.post(
      `/admin/courses/sections/${sectionId}/lessons`,
      lessonData
    );
    return response.data.data;
  },

  // Update lesson
  updateLesson: async (
    lessonId: string,
    lessonData: {
      title?: string;
      description?: string;
      content?: string;
      order?: number;
      videoUrl?: string;
      duration?: number;
      codeExamples?: CodeExample[];
      practiceProblems?: string[];
      notes?: string[];
      tips?: string[];
      resources?: Resource[];
      difficulty?: string;
      estimatedHours?: number;
    }
  ) => {
    const response = await api.put(
      `/admin/courses/lessons/${lessonId}`,
      lessonData
    );
    return response.data.data;
  },

  // Delete lesson
  deleteLesson: async (lessonId: string) => {
    const response = await api.delete(`/admin/courses/lessons/${lessonId}`);
    return response.data;
  },

  // Get section lessons
  getSectionLessons: async (sectionId: string) => {
    const response = await api.get(
      `/admin/courses/sections/${sectionId}/lessons`
    );
    return response.data.data;
  },

  // Quiz management
  createOrUpdateQuiz: async (quizData: {
    courseId?: string;
    sectionId?: string;
    title: string;
    description?: string;
    type: "section-quiz" | "final-quiz" | "practice-quiz";
    questions: QuizQuestion[];
    passingScore?: number;
    timeLimit?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showAnswerExplanation?: boolean;
    retakeAllowed?: boolean;
    maxRetakes?: number;
  }) => {
    // Use the course route for creating quizzes
    const url = `/admin/courses/${quizData.courseId}/quizzes`;
    const response = await api.post(url, quizData);
    return response.data.data;
  },

  updateQuiz: async (
    quizId: string,
    quizData: {
      title?: string;
      description?: string;
      questions?: QuizQuestion[];
      passingScore?: number;
      timeLimit?: number;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      showAnswerExplanation?: boolean;
      retakeAllowed?: boolean;
      maxRetakes?: number;
    }
  ) => {
    const response = await api.put(`/admin/courses/quizzes/${quizId}`, quizData);
    return response.data.data;
  },

  deleteQuiz: async (quizId: string) => {
    const response = await api.delete(`/admin/courses/quizzes/${quizId}`);
    return response.data;
  },

  getQuiz: async (quizId: string) => {
    const response = await api.get(`/admin/courses/quizzes/${quizId}`);
    return response.data.data;
  },

  // Publish/Unpublish course
  togglePublishCourse: async (courseId: string) => {
    const response = await api.patch(`/admin/courses/${courseId}/publish`);
    return response.data;
  },
};

export default adminCourseAPI;

