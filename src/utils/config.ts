// API configuration utilities
export const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    console.warn(
      "VITE_API_URL environment variable is not set. Using default localhost URL."
    );
    return "http://localhost:5000/api";
  }

  return apiUrl;
};

