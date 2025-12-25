const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CodeSnippet {
  _id: string;
  title: string;
  language: string;
  code: string;
  output?: string;
  createdAt: string;
  updatedAt: string;
}

export const snippetAPI = {
  // Get all user snippets
  async getUserSnippets(): Promise<{ success: boolean; data: CodeSnippet[] }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/snippets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch snippets');
    }

    return response.json();
  },

  // Get a single snippet
  async getSnippet(id: string): Promise<{ success: boolean; data: CodeSnippet }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch snippet');
    }

    return response.json();
  },

  // Create a new snippet
  async createSnippet(data: {
    title: string;
    language: string;
    code: string;
    output?: string;
  }): Promise<{ success: boolean; message: string; data: CodeSnippet }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/snippets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save snippet');
    }

    return response.json();
  },

  // Update a snippet
  async updateSnippet(
    id: string,
    data: Partial<{
      title: string;
      language: string;
      code: string;
      output: string;
    }>
  ): Promise<{ success: boolean; message: string; data: CodeSnippet }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update snippet');
    }

    return response.json();
  },

  // Delete a snippet
  async deleteSnippet(id: string): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete snippet');
    }

    return response.json();
  },
};

