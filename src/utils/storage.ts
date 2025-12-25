import { STORAGE_KEYS } from '../constants';

// Safe localStorage operations with error handling
export const storage = {
  // Get item from localStorage with error handling
  getItem: (key: keyof typeof STORAGE_KEYS): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  },

  // Set item in localStorage with error handling
  setItem: (key: keyof typeof STORAGE_KEYS, value: string): boolean => {
    try {
      localStorage.setItem(STORAGE_KEYS[key], value);
      return true;
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
      return false;
    }
  },

  // Remove item from localStorage with error handling
  removeItem: (key: keyof typeof STORAGE_KEYS): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
      return true;
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
      return false;
    }
  },

  // Clear all auth-related data
  clearAuth: (): void => {
    storage.removeItem('AUTH_TOKEN');
    storage.removeItem('USER');
  }
};
