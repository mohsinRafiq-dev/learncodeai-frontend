// Export all function modules for easy importing

// Authentication functions
export * from "./AuthFunctions/authFunctions";

// Admin functions
export * from "./AdminFunctions/adminFunctions";

// Tutorial functions (user-facing) - selective export to avoid naming conflict
export {
  fetchMainConcepts,
  fetchTutorialsByLanguageAndConcept,
  fetchTutorialById,
  saveTutorialToFavorites,
  getDifficultyColor,
  getLanguageEmoji,
  formatTutorialDate,
  getTutorialStatusText,
  type MainConcepts,
} from "./TutorialFunctions/tutorialFunctions";

// Course functions
export * from "./CourseFunctions/courseFunctions";
export type { Tutorial as TutorialItem } from "./TutorialFunctions/tutorialFunctions";

// Code execution functions
export * from "./CodeExecution/codeExecutionFunctions";

// Form handling functions
export * from "./FormFunctions/formFunctions";
export * from "./FormFunctions/contactFunctions";

// Navigation functions
export * from "./NavigationFunctions/navigationFunctions";

// Utility functions
export * from "./UtilityFunctions/utilityFunctions";

// Re-export commonly used functions with aliases for convenience
export {
  handleSignin as signin,
  handleSignup as signup,
  handleLogout as logout,
  handleOAuthLogin as oauthLogin,
} from "./AuthFunctions/authFunctions";

export {
  handleCodeExecution as executeCode,
  handleLanguageChange as changeLanguage,
} from "./CodeExecution/codeExecutionFunctions";

export {
  handleNavigation as navigate,
  redirectWithParams as redirect,
} from "./NavigationFunctions/navigationFunctions";

export {
  validateEmail,
  validatePassword,
  validateName,
} from "./AuthFunctions/authFunctions";

export {
  debounce,
  throttle,
  formatDate,
  copyToClipboard,
  getErrorMessage,
} from "./UtilityFunctions/utilityFunctions";

// Admin function aliases for convenience
export {
  fetchDashboardStats as getDashboardStats,
  fetchUsers as getUsers,
  searchUsersByQuery as searchUsers,
  updateUserAccountStatus as suspendUser,
  changeUserAdminRole as changeUserRole,
  removeUser as deleteUser,
  fetchTutorials as getTutorials,
  createNewTutorial as addTutorial,
  updateTutorialContent as editTutorial,
  removeTutorial as deleteTutorial,
  fetchAnalyticsData as getAnalytics,
} from "./AdminFunctions/adminFunctions";

