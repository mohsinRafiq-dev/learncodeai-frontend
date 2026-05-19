// Contact form related functions
import emailjs from '@emailjs/browser';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const sendViaEmailJS = async (formData: ContactFormData): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return;
  }
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      fullName: formData.fullName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    },
    { publicKey: EMAILJS_PUBLIC_KEY }
  );
};

// Types
export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  status: string;
  message: string;
  data?: {
    contactId: string;
  };
  errors?: string[];
}

// Validation functions
export const validateContactForm = (formData: ContactFormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  // Validate full name
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters long';
  } else if (formData.fullName.trim().length > 100) {
    errors.fullName = 'Name cannot exceed 100 characters';
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Validate subject
  if (!formData.subject.trim()) {
    errors.subject = 'Subject is required';
  } else if (formData.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  } else if (formData.subject.trim().length > 200) {
    errors.subject = 'Subject cannot exceed 200 characters';
  }

  // Validate message
  if (!formData.message.trim()) {
    errors.message = 'Message is required';
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  } else if (formData.message.trim().length > 2000) {
    errors.message = 'Message cannot exceed 2000 characters';
  }

  return errors;
};

// Validate single field
export const validateField = (fieldName: keyof ContactFormData, value: string): string | null => {
  switch (fieldName) {
    case 'fullName': {
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters long';
      if (value.trim().length > 100) return 'Name cannot exceed 100 characters';
      return null;
    }

    case 'email': {
      if (!value.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please provide a valid email address';
      return null;
    }

    case 'subject': {
      if (!value.trim()) return 'Subject is required';
      if (value.trim().length < 5) return 'Subject must be at least 5 characters long';
      if (value.trim().length > 200) return 'Subject cannot exceed 200 characters';
      return null;
    }

    case 'message': {
      if (!value.trim()) return 'Message is required';
      if (value.trim().length < 10) return 'Message must be at least 10 characters long';
      if (value.trim().length > 2000) return 'Message cannot exceed 2000 characters';
      return null;
    }

    default:
      return null;
  }
};

// Submit contact form
export const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  try {
    // Validate form data before submission
    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      return {
        status: 'error',
        message: 'Please fix the errors in the form',
        errors: Object.values(errors),
      };
    }

    const [backendResult, emailResult] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw Object.assign(new Error(data.message || 'Failed'), { data });
        }
        return data;
      }),
      sendViaEmailJS(formData),
    ]);

    if (emailResult.status === 'rejected') {
      console.error('EmailJS send failed:', emailResult.reason);
    }

    if (backendResult.status === 'fulfilled') {
      return backendResult.value;
    }

    if (emailResult.status === 'fulfilled' && EMAILJS_SERVICE_ID) {
      return {
        status: 'success',
        message: "Message sent successfully! We'll get back to you soon.",
      };
    }

    const err = backendResult.reason as { message?: string; data?: { errors?: string[] } };
    return {
      status: 'error',
      message: err?.message || 'Failed to submit contact form',
      errors: err?.data?.errors || [],
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return {
      status: 'error',
      message: 'Network error. Please check your connection and try again.',
    };
  }
};

// Reset form helper
export const getInitialFormData = (): ContactFormData => ({
  fullName: '',
  email: '',
  subject: '',
  message: '',
});

// Check if form has changes
export const hasFormChanges = (formData: ContactFormData): boolean => {
  return !!(
    formData.fullName.trim() ||
    formData.email.trim() ||
    formData.subject.trim() ||
    formData.message.trim()
  );
};

// Format error messages for display
export const formatErrorMessage = (error: string | string[]): string => {
  if (Array.isArray(error)) {
    return error.join('. ');
  }
  return error;
};

