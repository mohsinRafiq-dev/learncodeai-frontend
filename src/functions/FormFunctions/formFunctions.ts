// Form handling and validation functions

// Types
interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface FormState {
  [key: string]: FormField;
}

// Generic form handlers
export const handleInputChange = (
  fieldName: string,
  value: string,
  formState: FormState,
  setFormState: (state: FormState) => void,
  validator?: (value: string) => string | null
) => {
  const newState = {
    ...formState,
    [fieldName]: {
      value,
      error: validator ? validator(value) : null,
      touched: true,
    },
  };
  setFormState(newState);
};

// Handle form field blur
export const handleFieldBlur = (
  fieldName: string,
  formState: FormState,
  setFormState: (state: FormState) => void,
  validator: (value: string) => string | null
) => {
  const field = formState[fieldName];
  if (field && !field.touched) {
    const newState = {
      ...formState,
      [fieldName]: {
        ...field,
        touched: true,
        error: validator(field.value),
      },
    };
    setFormState(newState);
  }
};

// Validate entire form
export const validateForm = (
  formState: FormState,
  validators: Record<string, (value: string) => string | null>
): boolean => {
  let isValid = true;
  
  Object.keys(validators).forEach(fieldName => {
    const field = formState[fieldName];
    if (field) {
      const error = validators[fieldName](field.value);
      if (error) {
        isValid = false;
      }
    }
  });
  
  return isValid;
};

// Get form values
export const getFormValues = (formState: FormState): Record<string, string> => {
  const values: Record<string, string> = {};
  
  Object.keys(formState).forEach(key => {
    values[key] = formState[key].value;
  });
  
  return values;
};

// Reset form
export const resetForm = (
  initialState: FormState,
  setFormState: (state: FormState) => void
) => {
  setFormState(initialState);
};

// Check if form has errors
export const hasFormErrors = (formState: FormState): boolean => {
  return Object.values(formState).some(field => field.error !== null);
};

// Get first form error
export const getFirstFormError = (formState: FormState): string | null => {
  const fieldWithError = Object.values(formState).find(field => field.error !== null);
  return fieldWithError?.error || null;
};

// Create initial form state
export const createInitialFormState = (
  fields: string[],
  initialValues: Record<string, string> = {}
): FormState => {
  const state: FormState = {};
  
  fields.forEach(fieldName => {
    state[fieldName] = {
      value: initialValues[fieldName] || '',
      error: null,
      touched: false,
    };
  });
  
  return state;
};

// Handle form submission
export const handleFormSubmit = async (
  event: React.FormEvent,
  formState: FormState,
  validators: Record<string, (value: string) => string | null>,
  onSubmit: (values: Record<string, string>) => Promise<void>,
  setFormState: (state: FormState) => void
) => {
  event.preventDefault();
  
  // Mark all fields as touched and validate
  const newFormState = { ...formState };
  let isValid = true;
  
  Object.keys(validators).forEach(fieldName => {
    const field = newFormState[fieldName];
    if (field) {
      const error = validators[fieldName](field.value);
      newFormState[fieldName] = {
        ...field,
        touched: true,
        error,
      };
      if (error) isValid = false;
    }
  });
  
  setFormState(newFormState);
  
  if (isValid) {
    const values = getFormValues(newFormState);
    await onSubmit(values);
  }
};

// Debounced input handler
export const createDebouncedInputHandler = (
  handler: (value: string) => void,
  delay: number = 300
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(value), delay);
  };
};
