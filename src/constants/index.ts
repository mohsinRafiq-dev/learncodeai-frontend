// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/me',
  GOOGLE_OAUTH: '/auth/google',
  GITHUB_OAUTH: '/auth/github',
  CODE_EXECUTE: '/code/execute',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup', 
  EDITOR: '/editor',
  OAUTH_SUCCESS: '/auth/success',
  EMAIL_VERIFICATION: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TUTORIALS: '/tutorials',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TUTORIALS: '/admin/tutorials',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;

// Admin roles
export const ADMIN_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Account status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ADMIN_DASHBOARD_LIMIT: 20,
} as const;

// Language options
export const LANGUAGES = {
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  CPP: 'cpp',
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
