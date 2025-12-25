/**
 * Course Functions
 * Utility functions for user-facing course operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  language: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  price?: number;
  instructor: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  sections: CourseSection[];
  finalQuiz?: Quiz;
  thumbnail?: string;
  totalLessons: number;
  totalSections: number;
  enrollmentCount: number;
  completedCount: number;
  averageRating: number;
  ratingCount: number;
  isPublished: boolean;
  isArchived: boolean;
  certificateTemplate: 'standard' | 'distinguished' | 'excellence';
  tags: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
  sectionQuiz?: Quiz;
}

export interface CourseLesson {
  _id: string;
  title: string;
  description?: string;
  content: string;
  type?: 'video' | 'text' | 'code' | 'quiz';
  videoUrl?: string;
  duration?: number;
  codeExample?: string; // Legacy support
  codeExamples?: Array<{
    _id?: string;
    title: string;
    description?: string;
    code: string;
    language?: string;
    input?: string;
    expectedOutput?: string;
    order?: number;
  }>;
  practiceProblems?: string[];
  notes?: string[];
  tips?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours?: number;
  order: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  type: 'section-quiz' | 'final-quiz';
  passingScore: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'coding';
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: number;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  explanation?: string;
  points: number;
}

export interface CourseEnrollment {
  _id: string;
  course: string | Course;
  user: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped' | 'on-hold';
  completionDate?: string;
  certificateIssued: boolean;
  certificate?: string;
  sectionProgress?: Array<{
    section: string;
    isCompleted: boolean;
    completedAt?: string;
    lessons: Array<{
      lesson: string;
      isCompleted: boolean;
      completedAt?: string;
    }>;
    sectionQuizScore?: {
      score: number;
      passed: boolean;
      attemptCount: number;
    };
  }>;
  overallProgress: number;
  finalQuizScore?: {
    quizId: string;
    score: number;
    maxScore: number;
    attemptCount: number;
    lastAttemptAt: string;
    passed: boolean;
  };
  lastAccessedAt: string;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

// Get all courses with optional filters
export const getAllCourses = async (filters?: {
  language?: string;
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}): Promise<PaginationResponse<Course>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.language) queryParams.append('language', filters.language);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/courses?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get courses by language
export const getCoursesByLanguage = async (
  language: string,
  page = 1,
  limit = 10
): Promise<PaginationResponse<Course>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/language/${language}?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses by language:', error);
    throw error;
  }
};

// Get a single course by ID
export const getCourseById = async (id: string): Promise<{
  success: boolean;
  data: Course;
  enrollment?: CourseEnrollment;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw error;
  }
};

// Enroll in a course (requires authentication)
export const enrollInCourse = async (courseId: string): Promise<{
  success: boolean;
  message: string;
  enrollment?: CourseEnrollment;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// Get user's enrolled courses (requires authentication)
export const getUserEnrolledCourses = async (): Promise<{
  success: boolean;
  data: CourseEnrollment[];
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/user/enrolled`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

// Get enrollment details for a specific course (requires authentication)
export const getEnrollmentDetails = async (courseId: string): Promise<{
  success: boolean;
  data: CourseEnrollment;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollment`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    throw error;
  }
};

// Complete a lesson (update progress)
export const completeLessonProgress = async (
  courseId: string,
  sectionId: string,
  lessonId: string
): Promise<{
  success: boolean;
  message: string;
  data: CourseEnrollment;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress/lesson`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, sectionId, lessonId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Submit quiz answers
export const submitQuizAnswers = async (
  quizId: string,
  courseId: string,
  sectionId: string | null,
  answers: Record<string, string>
): Promise<{
  success: boolean;
  message: string;
  data: {
    enrollmentId: string;
    score: number;
    maxScore: number;
    passed: boolean;
    attemptCount: number;
    results: Array<{
      questionId: string;
      question: string;
      userAnswer: string;
      isCorrect: boolean;
      explanation?: string;
      points: number;
    }>;
    certificate: string | null;
  };
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quizId, courseId, sectionId, answers }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Quiz submission error:', errorData);
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

// Get quiz details
export const getQuizDetails = async (quizId: string): Promise<{
  success: boolean;
  data: {
    quiz: Quiz;
    previousScore?: any;
    canRetake?: boolean;
  };
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/courses/quizzes/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    throw error;
  }
};

// Get user certificates
export const getUserCertificates = async (): Promise<{
  success: boolean;
  data: unknown[];
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/admin/courses/user/certificates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// Get certificate by ID
export const getCertificateById = async (certificateId: string): Promise<{
  success: boolean;
  data: unknown;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Fetching certificate with ID:', certificateId);
    const url = `${API_BASE_URL}/admin/courses/certificates/${certificateId}`;
    console.log('Certificate fetch URL:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Certificate response status:', response.status);
    console.log('Certificate response headers:', {
      contentType: response.headers.get('Content-Type'),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('Certificate fetch error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Certificate data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

// Get available course languages (utility function)
export const getAvailableLanguages = async (): Promise<string[]> => {
  try {
    const courses = await getAllCourses({ limit: 1000 }); // Get all courses to extract languages
    const languages = [...new Set(courses.data.map(course => course.language))];
    return languages.sort();
  } catch (error) {
    console.error('Error fetching available languages:', error);
    return ['python', 'javascript', 'cpp']; // Fallback to default languages
  }
};

// Get course statistics
export const getCourseStats = async (courseId: string): Promise<{
  totalEnrollments: number;
  averageProgress: number;
  completionRate: number;
}> => {
  try {
    // This would need to be implemented in the backend
    // For now, return mock data
    console.log('Getting stats for course:', courseId); // Use the parameter to avoid warning
    return {
      totalEnrollments: 0,
      averageProgress: 0,
      completionRate: 0,
    };
  } catch (error) {
    console.error('Error fetching course stats:', error);
    throw error;
  }
};
