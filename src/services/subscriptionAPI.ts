const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SubscriptionData {
  email: string;
}

export interface SubscriptionResponse {
  status: string;
  message: string;
  data?: {
    subscriptionId: string;
    email: string;
  };
  errors?: string[];
}

// Subscribe to newsletter
export const subscribeToNewsletter = async (email: string): Promise<SubscriptionResponse> => {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return {
        status: 'error',
        message: 'Email is required',
        errors: ['Email is required']
      };
    }
    if (!emailRegex.test(email)) {
      return {
        status: 'error',
        message: 'Please provide a valid email address',
        errors: ['Please provide a valid email address']
      };
    }

    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        message: data.message || 'Failed to subscribe to newsletter',
        errors: data.errors || []
      };
    }

    return {
      status: 'success',
      message: data.message || 'Successfully subscribed to LearnCode AI newsletter!',
      data: data.data
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
      errors: ['Network error or server unavailable']
    };
  }
};
