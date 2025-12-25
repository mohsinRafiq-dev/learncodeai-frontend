/**
 * Image URL utilities for building proper URLs for uploaded images
 */

export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Build the URL from the base API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get base server URL

  return `${baseUrl}${imagePath}`;
};

export const getProfileImageUrl = (imagePath: string | undefined | null): string | null => {
  return getImageUrl(imagePath);
};

