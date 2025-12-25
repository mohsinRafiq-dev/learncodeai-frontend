/**
 * Storage Utilities for secure localStorage management
 * Filters sensitive data before storing user information
 */

interface FullUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: "active" | "suspended" | "pending";
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  // Sensitive fields to exclude
  password?: string;
  emailVerificationOTP?: string;
  emailVerificationOTPExpires?: string;
  passwordResetOTP?: string;
  passwordResetOTPExpires?: string;
  googleId?: string;
  githubId?: string;
  // Large arrays to exclude
  enrolledCourses?: unknown[];
  enrolledTutorials?: unknown[];
  certificates?: unknown[];
  savedCodes?: unknown[];
  progress?: unknown[];
  recentAIChats?: unknown[];
  // Other unnecessary fields
  bio?: string;
  dateOfBirth?: string;
  github?: string;
  linkedin?: string;
  location?: string;
  website?: string;
  skills?: unknown[];
  interests?: unknown[];
  experience?: string;
  programmingLanguages?: unknown[];
  preferences?: Record<string, unknown>;
  profileCompletionPromptShown?: boolean;
  isProfileComplete?: boolean;
  lastLogin?: string;
  __v?: number;
}

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: "active" | "suspended" | "pending";
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter user data to only include necessary fields for localStorage
 * Removes sensitive and large data
 */
export const filterSensitiveUserData = (user: FullUser): SafeUser => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    isEmailVerified: user.isEmailVerified,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Safely store user data in localStorage
 * Automatically filters sensitive information
 */
export const storageSafeUser = (storageKey: string, user: FullUser | SafeUser | Record<string, unknown>): void => {
  const safeUser = filterSensitiveUserData(user as FullUser);
  localStorage.setItem(storageKey, JSON.stringify(safeUser));
};

/**
 * Retrieve user data from localStorage
 */
export const getStoredUser = (storageKey: string): SafeUser | null => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as SafeUser;
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    return null;
  }
};

/**
 * Clear sensitive auth data from localStorage
 */
export const clearAuthStorage = (tokenKey: string, userKey: string): void => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

