/**
 * Tutorial Functions
 * Utility functions for user-facing tutorial operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface Tutorial {
  _id: string;
  title: string;
  description: string;
  language: string;
  concept: string;
  mainConcept: boolean;
  difficulty: string;
  content: string;
  notes: string[];
  tips: string[];
  tags: string[];
  codeExamples: Array<{
    title: string;
    description: string;
    code: string;
    input: string;
    expectedOutput: string;
  }>;
}

export interface MainConcepts {
  python: string[];
  javascript: string[];
  cpp: string[];
}

// Main concepts - will be fetched from backend
const MAIN_CONCEPTS_DATA: MainConcepts = {
  python: [
    'Variables',
    'Data Types',
    'Control Flow',
    'Loops',
    'Functions',
  ],
  javascript: [
    'Variables',
    'Conditionals',
    'Loops',
    'Functions',
    'DOM Manipulation',
  ],
  cpp: [
    'Variables',
    'Input/Output',
    'Control Structures',
    'Loops',
    'Functions',
  ],
};

/**
 * Fetch main concepts for all languages
 * @returns MainConcepts object with concepts grouped by language
 */
export const fetchMainConcepts = async (): Promise<MainConcepts> => {
  try {
    const languages = ['python', 'javascript', 'cpp'];
    const result: MainConcepts = {
      python: [],
      javascript: [],
      cpp: [],
    };

    // Fetch concepts for each language from backend
    for (const language of languages) {
      const response = await fetch(`${API_BASE_URL}/tutorials/concepts/${language}`);
      if (response.ok) {
        const data = await response.json();
        result[language as keyof MainConcepts] = data.concepts || [];
      }
    }

    // Return fetched concepts, fallback to hardcoded if backend fails
    const hasAnyData = Object.values(result).some(arr => arr.length > 0);
    return hasAnyData ? result : MAIN_CONCEPTS_DATA;
  } catch (error) {
    console.error('Error fetching concepts from backend, using defaults:', error);
    return MAIN_CONCEPTS_DATA;
  }
};

/**
 * Fetch tutorials based on filters
 * @param language - Programming language filter
 * @param concept - Tutorial concept filter ('all' or specific concept)
 * @returns Array of tutorials
 */
export const fetchTutorialsByLanguageAndConcept = async (
  language: string,
  concept: string = ''
): Promise<Tutorial[]> => {
  try {
    let url: string;
    
    // If concept is 'all' or empty, use the language-specific endpoint
    if (!concept || concept === 'all') {
      url = `${API_BASE_URL}/tutorials/language/${language}`;
    } else {
      // Use the general endpoint with concept filter
      url = `${API_BASE_URL}/tutorials?language=${language}&concept=${concept}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to fetch tutorials: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (data.tutorials) {
      // Response from /language/:language endpoint (grouped by concept)
      const allTutorials: Tutorial[] = [];
      Object.values(data.tutorials as Record<string, Tutorial[]>).forEach((conceptTutorials) => {
        allTutorials.push(...conceptTutorials);
      });
      return allTutorials;
    } else {
      // Response from general endpoint
      return data.data || [];
    }
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    throw error;
  }
};

/**
 * Fetch a single tutorial by ID
 * @param tutorialId - The tutorial ID
 * @returns Single tutorial object
 */
export const fetchTutorialById = async (tutorialId: string): Promise<Tutorial> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tutorials/${tutorialId}`);
    if (!response.ok) throw new Error('Failed to fetch tutorial');
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    throw error;
  }
};

/**
 * Save tutorial to user's favorites
 * @param tutorialId - The tutorial ID to save
 * @returns Success response
 */
export const saveTutorialToFavorites = async (tutorialId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tutorials/${tutorialId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to save tutorial');
    
    return await response.json();
  } catch (error) {
    console.error('Error saving tutorial:', error);
    throw error;
  }
};

/**
 * Utility: Get difficulty color for UI display
 * @param difficulty - Difficulty level
 * @returns Hex color code
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return '#10b981'; // Green
    case 'intermediate':
      return '#f59e0b'; // Amber
    case 'advanced':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

/**
 * Utility: Get language emoji for UI display
 * @param language - Programming language
 * @returns Emoji string
 */
export const getLanguageEmoji = (language: string): string => {
  switch (language.toLowerCase()) {
    case 'python':
      return '🐍';
    case 'javascript':
      return '🟨';
    case 'cpp':
      return '⚙️';
    default:
      return '💻';
  }
};

/**
 * Utility: Format tutorial date
 * @param dateString - Date string
 * @returns Formatted date
 */
export const formatTutorialDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Utility: Get tutorial status badge text
 * @param isSaved - Whether tutorial is saved
 * @returns Status text
 */
export const getTutorialStatusText = (isSaved: boolean): string => {
  return isSaved ? 'Saved' : 'Save for Later';
};

// ========== SAVE TUTORIAL FUNCTIONS ==========

/**
 * Save a tutorial for later viewing
 * @param tutorialId - Tutorial ID to save
 * @returns Promise with save result
 */
export const saveTutorial = async (tutorialId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/tutorials/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tutorialId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving tutorial:', error);
    throw error;
  }
};

/**
 * Remove a tutorial from saved list
 * @param tutorialId - Tutorial ID to unsave
 * @returns Promise with unsave result
 */
export const unsaveTutorial = async (tutorialId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/tutorials/saved/${tutorialId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error unsaving tutorial:', error);
    throw error;
  }
};

/**
 * Get user's saved tutorials
 * @param filters - Optional filters for language and difficulty
 * @returns Promise with saved tutorials list
 */
export const getSavedTutorials = async (filters?: {
  language?: string;
  difficulty?: string;
}): Promise<{
  success: boolean;
  count: number;
  data: Array<{
    _id: string;
    savedAt: string;
    tutorial: Tutorial;
  }>;
}> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (filters?.language) queryParams.append('language', filters.language);
    if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty);

    const url = `${API_BASE_URL}/tutorials/user/saved${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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

