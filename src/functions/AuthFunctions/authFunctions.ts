// Authentication functions
import { authAPI } from "../../services/api";
import { ROUTES } from "../../constants";

// Types
interface AuthError {
  response?: {
    data?: {
      message?: string;
      needsEmailVerification?: boolean;
      email?: string;
      autoResent?: boolean;
      isSuspended?: boolean;
      accountStatus?: string;
    };
  };
  message?: string;
}

interface SignupResult {
  needsVerification: boolean;
  email?: string;
  isResend?: boolean;
}

// Form validation functions
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email, please enter a valid email";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  
  // Check for strong password requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  if (!hasLowercase) return "Password must contain at least one lowercase letter";
  if (!hasUppercase) return "Password must contain at least one uppercase letter";
  if (!hasNumber) return "Password must contain at least one number";
  if (!hasSpecialChar) return "Password must contain at least one special character (@$!%*?&)";
  
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords don't match";
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters long";
  return null;
};

// Authentication handlers
export const handleSignin = async (
  email: string,
  password: string,
  signin: (email: string, password: string) => Promise<void>,
  navigate: (path: string) => void,
  searchParams: URLSearchParams,
  setError: (error: string) => void,
  setUserAndToken?: (user: any, token: string) => void,
  onSuspended?: (message: string) => void
) => {
  try {
    // Basic validation - only check if fields are provided
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    // Use AuthContext signin - no password strength validation for login
    await signin(email, password);

    // Get user and token from localStorage (since context doesn't return them)
    if (setUserAndToken) {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("AUTH_TOKEN");
      const userStr =
        localStorage.getItem("user") || localStorage.getItem("USER");
      if (token && userStr) {
        setUserAndToken(JSON.parse(userStr), token);
      }
    }

    // Redirect to intended page or editor, but never to /signin
    let redirectTo = searchParams.get("redirect") || ROUTES.HOME;
    if (redirectTo === ROUTES.SIGNIN || redirectTo === "/signin") {
      redirectTo = ROUTES.HOME;
    }
    navigate(redirectTo);
  } catch (error: unknown) {
    const authError = error as AuthError;
    const errorResponse = authError?.response?.data;

    // Check if account is suspended
    if (errorResponse?.isSuspended || errorResponse?.accountStatus === 'suspended') {
      const message = errorResponse.message || 'Your account has been suspended. Please contact support.';
      if (onSuspended) {
        onSuspended(message);
      } else {
        setError(message);
      }
      return;
    }

    // Check if it's an email verification issue
    if (errorResponse?.needsEmailVerification) {
      const emailToUse = errorResponse.email || email;
      const navigationUrl = `${
        ROUTES.EMAIL_VERIFICATION
      }?email=${encodeURIComponent(emailToUse)}&autoResent=${
        errorResponse.autoResent ? "true" : "false"
      }`;
      navigate(navigationUrl);
      return;
    }

    // For all other errors, show the message from backend
    if (errorResponse?.message) {
      setError(errorResponse.message);
    } else if (authError?.message) {
      // Fallback to error message if available
      setError(authError.message);
    } else {
      setError("An error occurred during signin. Please try again.");
    }
  }
};

export const handleSignup = async (
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  signup: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<SignupResult>,
  navigate: (path: string) => void,
  setError: (error: string) => void
) => {
  try {
    // Validate all inputs
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    const validationError =
      nameError || emailError || passwordError || confirmPasswordError;
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.needsVerification) {
      // Redirect to email verification page with message
      const autoResent = result.isResend ? "true" : "false";
      navigate(
        `${ROUTES.EMAIL_VERIFICATION}?email=${encodeURIComponent(
          result.email || formData.email
        )}&autoResent=${autoResent}`
      );
    } else {
      // No verification needed, go to editor
      navigate(ROUTES.HOME);
    }
  } catch (error: unknown) {
    const authError = error as AuthError;
    // Check if it's a resend case
    if (
      authError.message &&
      authError.message.includes("already exists but not verified")
    ) {
      navigate(
        `${ROUTES.EMAIL_VERIFICATION}?email=${encodeURIComponent(
          formData.email
        )}&autoResent=true`
      );
    }
    // Other errors are handled by the context
  }
};

// OAuth handlers
export const handleOAuthLogin = (
  provider: "google" | "github",
  searchParams?: URLSearchParams
) => {
  // Store redirect parameter for OAuth flow
  const redirectTo = searchParams?.get("redirect");
  if (redirectTo) {
    sessionStorage.setItem("oauth_redirect", redirectTo);
  }

  if (provider === "google") {
    authAPI.googleLogin();
  } else if (provider === "github") {
    authAPI.githubLogin();
  }
};

// Logout handler
export const handleLogout = async (
  logout: () => Promise<void>,
  navigate?: (path: string) => void
) => {
  try {
    await logout();
    if (navigate) {
      navigate(ROUTES.HOME);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Password reset functions
export const handleForgotPassword = async (
  email: string,
  setMessage: (message: string) => void,
  setError: (error: string) => void,
  navigate: (path: string) => void
) => {
  try {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    await authAPI.requestPasswordReset(email);
    setMessage(
      "If an account with this email exists, you will receive a password reset code."
    );

    // Navigate to OTP verification page
    setTimeout(() => {
      navigate(
        `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(
          email
        )}&step=verify`
      );
    }, 2000);
  } catch (error: unknown) {
    const authError = error as AuthError;
    setError(
      authError?.response?.data?.message ||
        "Failed to send reset email. Please try again."
    );
  }
};

export const handleVerifyResetOTP = async (
  email: string,
  otp: string,
  setResetToken: (token: string) => void,
  setError: (error: string) => void,
  navigate: (path: string) => void
) => {
  try {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    const response = await authAPI.verifyPasswordResetOTP(email, otp);
    setResetToken(response.resetToken);

    // Navigate to password reset form
    navigate(
      `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&step=reset`
    );
  } catch (error: unknown) {
    const authError = error as AuthError;
    setError(authError?.response?.data?.message || "Invalid or expired OTP");
  }
};

export const handleResetPassword = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
  setMessage: (message: string) => void,
  setError: (error: string) => void,
  navigate: (path: string) => void
) => {
  try {
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }

    await authAPI.resetPassword(resetToken, newPassword, confirmPassword);
    setMessage("Password reset successfully!");

    // Redirect to signin page after success
    setTimeout(() => {
      navigate(ROUTES.SIGNIN);
    }, 2000);
  } catch (error: unknown) {
    const authError = error as AuthError;
    setError(
      authError?.response?.data?.message ||
        "Failed to reset password. Please try again."
    );
  }
};

