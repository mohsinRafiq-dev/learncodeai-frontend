/**
 * Profile Functions
 * API functions for user profile management, progress tracking, and enrollment management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug function to test token validity
export const testTokenValidity = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('🔍 Testing token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    
    if (!token) {
      console.log('❌ No token in localStorage');
      return false;
    }

    // Decode JWT to check expiration (simple base64 decode)
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      console.log('🔍 Token payload:', payload);
      console.log('🔍 Token expires at:', new Date(payload.exp * 1000));
      console.log('🔍 Current time:', new Date(now * 1000));
      console.log('🔍 Token expired?', payload.exp && payload.exp < now);
      
      if (payload.exp && payload.exp < now) {
        console.log('❌ Token has expired');
        return false;
      }
    } catch (decodeError) {
      console.log('⚠️ Could not decode token:', decodeError);
    }

    // Test with a simple auth endpoint
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('🔍 Auth test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token is valid, user:', data.user?.name);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Token invalid:', errorData.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Token test error:', error);
    return false;
  }
};

// Type definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  accountStatus: 'pending' | 'active' | 'suspended';
  
  // Profile Information
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  
  // Skills and Interests
  programmingLanguages?: string[];
  skills?: string[];
  interests?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Profile Completion
  isProfileComplete?: boolean;
  profileCompletionPromptShown?: boolean;
  
  preferences: {
    emailNotifications: boolean;
  };
  enrolledTutorials: string[];
  enrolledCourses: string[];
  savedCodes: string[];
  progress: string[];
  certificates: Certificate[];
  recentAIChats: Array<{
    message: string;
    response: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Certificate {
  _id: string;
  user: string;
  course: string;
  issuedAt: string;
  certificateId: string;
  skills: string[];
}

export interface CourseProgress {
  enrollmentId: string;
  course: {
    _id: string;
    title: string;
    description: string;
    language: string;
    difficulty: string;
    instructor?: {
      _id: string;
      name: string;
      profilePicture?: string;
    } | null;
    sections: Array<{
      _id: string;
      title: string;
      order: number;
    }>;
  };
  enrolledAt: string;
  progressPercentage: number;
  completedSections: number;
  totalSections: number;
  status: 'active' | 'paused' | 'completed' | 'withdrawn';
  lastAccessed: string;
  certificateEarned: boolean;
}

export interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  averageCourseProgress: number;
  totalTimeSpentMinutes: number;
  savedTutorials: number;
}

export interface EnrollmentDetails {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    language: string;
    difficulty: string;
    instructor?: {
      _id: string;
      name: string;
      profilePicture?: string;
    } | null;
    duration: number;
    price?: number;
    thumbnail?: string;
  };
  enrolledAt: string;
  status: string;
  progressPercentage: number;
  completedSections: number;
  totalSections: number;
  lastAccessed: string;
}

// ========== PROFILE MANAGEMENT ==========

// Get user profile
export const getProfile = async (): Promise<{
  success: boolean;
  message?: string;
  data: User;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData: {
  name?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  programmingLanguages?: string[];
  skills?: string[];
  interests?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  preferences?: Partial<User['preferences']>;
}): Promise<{
  success: boolean;
  message: string;
  data: User;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File): Promise<{
  success: boolean;
  data: {
    user: User;
    fileUrl: string;
  };
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await fetch(`${API_BASE_URL}/profile/upload-picture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Mark profile completion prompt as shown
 */
export const markPromptShown = async (): Promise<{
  success: boolean;
  data: User;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile/prompt-shown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking prompt as shown:', error);
    throw error;
  }
};

// ========== PROGRESS TRACKING ==========

// Get course progress
export const getCourseProgress = async (): Promise<{
  success: boolean;
  message?: string;
  data: CourseProgress[];
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile/progress/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get dashboard stats
export const getDashboardStats = async (): Promise<{
  success: boolean;
  message?: string;
  data: DashboardStats;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ========== ENROLLMENT MANAGEMENT ==========

// Get user enrollments
export const getUserEnrollments = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  message?: string;
  data: EnrollmentDetails[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE_URL}/profile/enrollments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw error;
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (
  enrollmentId: string,
  status: 'active' | 'paused' | 'withdrawn'
): Promise<{
  success: boolean;
  message: string;
  data: EnrollmentDetails;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/profile/enrollments/${enrollmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

// ========== UTILITY FUNCTIONS ==========

// Format time duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

// Format completion percentage
export const formatProgress = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

// Get avatar URL or initials
export const getAvatarDisplay = (user: User): string => {
  if (user.profilePicture) {
    return user.profilePicture;
  }
  return user.name.charAt(0).toUpperCase();
};

// Get difficulty color class
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get language emoji
export const getLanguageEmoji = (language: string): string => {
  switch (language?.toLowerCase()) {
    case 'python':
      return '🐍';
    case 'javascript':
      return '🟨';
    case 'cpp':
      return '⚡';
    case 'sql':
      return '🗃️';
    case 'rust':
      return '🦀';
    case 'haskell':
      return 'λ';
    default:
      return '💻';
  }
};

// ========== SAVED TUTORIALS ==========

export interface SavedTutorial {
  _id: string;
  savedAt: string;
  tutorial: {
    _id: string;
    title: string;
    description: string;
    language: string;
    concept: string;
    difficulty: string;
  };
}

/**
 * Get user's saved tutorials for profile page
 */
export const getSavedTutorials = async (): Promise<{
  success: boolean;
  message?: string;
  data: SavedTutorial[];
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/tutorials/user/saved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching saved tutorials:', error);
    throw error;
  }
};
