/**
 * Admin Functions
 * Utility functions for admin panel operations
 */

import { adminAPI } from '../../services/adminAPI';

// Type definitions
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalAdmins: number;
  totalTutorials: number;
  totalChats: number;
  totalCourses: number;
  totalEnrollments: number;
  newUsersLast30Days: number;
  suspensionRate: string;
  userGrowthRate: string;
  enrollmentGrowthRate: string;
  tutorialGrowthRate: string;
  chatGrowthRate: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Tutorial {
  _id: string;
  title: string;
  language: string;
  difficulty: string;
  concept: string;
  createdBy?: {
    name: string;
  };
  createdAt: string;
}

export interface AnalyticsData {
  totalExecutions: number;
  totalChats: number;
  totalProgress: number;
  languageStats: Array<{
    _id: string;
    count: number;
  }>;
}

export interface RecentActivity {
  type: 'user_signup' | 'tutorial_created' | 'content_updated' | 'course_created';
  text: string;
  timestamp: string;
}

// Dashboard functions
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await adminAPI.getDashboardStats();
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch stats');
};

// User management functions
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  search: string = '',
  role: string = '',
  status: string = ''
): Promise<{ users: User[]; total: number; pages: number }> => {
  const response = await adminAPI.getAllUsers(page, limit, search, role, status);
  if (response.success) {
    return {
      users: response.data,
      total: response.pagination.total,
      pages: response.pagination.pages,
    };
  }
  throw new Error(response.message || 'Failed to fetch users');
};

export const searchUsersByQuery = async (query: string): Promise<User[]> => {
  const response = await adminAPI.searchUsers(query);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to search users');
};

export const updateUserAccountStatus = async (
  userId: string,
  accountStatus: 'active' | 'suspended' | 'pending'
): Promise<User> => {
  const response = await adminAPI.updateUserStatus(userId, accountStatus);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to update user status');
};

export const changeUserAdminRole = async (userId: string, role: string): Promise<User> => {
  const response = await adminAPI.changeUserRole(userId, role);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to change user role');
};

export const removeUser = async (userId: string): Promise<{ message: string }> => {
  const response = await adminAPI.deleteUser(userId);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to delete user');
};

// Tutorial management functions
export const fetchTutorials = async (
  page: number = 1,
  limit: number = 10,
  language: string = '',
  search: string = ''
): Promise<{ tutorials: Tutorial[]; total: number; pages: number }> => {
  const response = await adminAPI.getAllTutorials(page, limit, language, search);
  if (response.success) {
    return {
      tutorials: response.data,
      total: response.pagination.total,
      pages: response.pagination.pages,
    };
  }
  throw new Error(response.message || 'Failed to fetch tutorials');
};

export const createNewTutorial = async (tutorialData: Record<string, unknown>): Promise<Tutorial> => {
  const response = await adminAPI.createTutorial(tutorialData);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to create tutorial');
};

export const updateTutorialContent = async (
  tutorialId: string,
  tutorialData: Record<string, unknown>
): Promise<Tutorial> => {
  const response = await adminAPI.updateTutorial(tutorialId, tutorialData);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to update tutorial');
};

export const removeTutorial = async (tutorialId: string): Promise<{ message: string }> => {
  const response = await adminAPI.deleteTutorial(tutorialId);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to delete tutorial');
};

// Analytics functions
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const response = await adminAPI.getAnalytics();
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch analytics');
};

export const fetchRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await adminAPI.getRecentActivity(limit);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || 'Failed to fetch recent activity');
};

// Utility functions
export const formatUserStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatUserRole = (role: string): string => {
  return role === 'admin' ? 'Administrator' : 'User';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateSuspensionPercentage = (suspended: number, total: number): string => {
  if (total === 0) return '0%';
  return ((suspended / total) * 100).toFixed(2) + '%';
};

