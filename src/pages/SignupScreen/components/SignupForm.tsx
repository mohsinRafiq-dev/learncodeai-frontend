import { useState } from "react";

interface SignupFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
}

export default function SignupForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
  error,
  onTermsClick,
  onPrivacyClick,
}: SignupFormProps) {
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmailFormat = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return null;
    if (!emailRegex.test(email)) return "Invalid email, please enter a valid email";
    return null;
  };

  const calculatePasswordStrength = (pwd: string): "weak" | "medium" | "strong" | null => {
    if (pwd.length === 0) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
  };

  const isPasswordStrong = (pwd: string): boolean => {
    return pwd.length >= 8 &&
           /[a-z]/.test(pwd) &&
           /[A-Z]/.test(pwd) &&
           /[0-9]/.test(pwd) &&
           /[@$!%*?&]/.test(pwd);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password strength before submission
    if (formData.password && !isPasswordStrong(formData.password)) {
      return; // Prevent submission, error will be shown by validation
    }
    
    onSubmit(e);
  };
  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              onChange(e);
              setEmailError(validateEmailFormat(e.target.value));
            }}
            className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              emailError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
            required
          />
          {emailError && (
            <div className="mt-1">
              <p className="text-sm text-red-600">{emailError}</p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              onChange(e);
              setPasswordStrength(calculatePasswordStrength(e.target.value));
            }}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
            required
          />
          {passwordStrength && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength === "weak"
                        ? "bg-red-500 w-1/3"
                        : passwordStrength === "medium"
                        ? "bg-yellow-500 w-2/3"
                        : "bg-green-500 w-full"
                    }`}
                  ></div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    passwordStrength === "weak"
                      ? "text-red-600"
                      : passwordStrength === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {passwordStrength === "weak"
                    ? "Weak"
                    : passwordStrength === "medium"
                    ? "Medium"
                    : "Strong"}
                </span>
              </div>
              
              {passwordStrength === "weak" && (
                <div className="text-xs text-gray-600 mt-1">
                  <p className="mb-1 font-medium">Password must contain:</p>
                  <ul className="space-y-0.5">
                    <li className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{formData.password.length >= 8 ? '✓' : '×'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{/[a-z]/.test(formData.password) ? '✓' : '×'}</span>
                      One lowercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{/[A-Z]/.test(formData.password) ? '✓' : '×'}</span>
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{/[0-9]/.test(formData.password) ? '✓' : '×'}</span>
                      One number
                    </li>
                    <li className={`flex items-center gap-1 ${/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{/[@$!%*?&]/.test(formData.password) ? '✓' : '×'}</span>
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={onChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-start text-sm">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 mt-0.5"
            required
          />
          <label htmlFor="terms" className="ml-3 text-gray-700">
            I agree to the{" "}
            <button
              type="button"
              onClick={onTermsClick}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={onPrivacyClick}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || (formData.password ? !isPasswordStrong(formData.password) : false) || (formData.email ? !!emailError : false)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-blue-400 disabled:to-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>
        
        {((formData.password && !isPasswordStrong(formData.password)) || (formData.email && emailError)) && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700 text-center">
              {emailError ? "Please enter a valid email address" : "Please create a strong password to continue"}
            </p>
          </div>
        )}
      </form>
    </>
  );
}

