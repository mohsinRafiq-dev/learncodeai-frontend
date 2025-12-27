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
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmailFormat = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return null;
    if (!emailRegex.test(email))
      return "Invalid email, please enter a valid email";
    return null;
  };

  const calculatePasswordStrength = (
    pwd: string
  ): "weak" | "medium" | "strong" | null => {
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
    return (
      pwd.length >= 8 &&
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[@$!%*?&]/.test(pwd)
    );
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
        <div className="mb-4 p-3 bg-[#e91e63]/10 border border-[#e91e63]/30 rounded-lg">
          <p className="text-sm text-[#e91e63] font-mono">
            <span className="text-[#6272a4]">{"// Error: "}</span>
            {error}
          </p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[#6272a4] mb-2"
          >
            <span className="text-[#8b5cf6]">const</span> name{" "}
            <span className="text-[#6272a4]">=</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all font-mono"
            placeholder='"Your Name"'
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#6272a4] mb-2"
          >
            <span className="text-[#8b5cf6]">const</span> email{" "}
            <span className="text-[#6272a4]">=</span>
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
            className={`w-full px-4 py-3 bg-[#0a0e27] border rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all font-mono ${
              emailError ? "border-[#e91e63]" : "border-[#2a2f4a]"
            }`}
            placeholder='"you@example.com"'
            required
          />
          {emailError && (
            <div className="mt-1">
              <p className="text-sm text-[#e91e63] font-mono">{emailError}</p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#6272a4] mb-2"
          >
            <span className="text-[#8b5cf6]">const</span> password{" "}
            <span className="text-[#6272a4]">=</span>
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
            className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all font-mono"
            placeholder='"••••••••"'
            required
          />
          {passwordStrength && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#2a2f4a] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength === "weak"
                        ? "bg-[#e91e63] w-1/3"
                        : passwordStrength === "medium"
                        ? "bg-[#ffbd2e] w-2/3"
                        : "bg-[#00e676] w-full"
                    }`}
                  ></div>
                </div>
                <span
                  className={`text-sm font-medium font-mono ${
                    passwordStrength === "weak"
                      ? "text-[#e91e63]"
                      : passwordStrength === "medium"
                      ? "text-[#ffbd2e]"
                      : "text-[#00e676]"
                  }`}
                >
                  {passwordStrength === "weak"
                    ? "// weak"
                    : passwordStrength === "medium"
                    ? "// medium"
                    : "// strong"}
                </span>
              </div>

              {passwordStrength === "weak" && (
                <div className="text-xs text-[#6272a4] mt-1 font-mono">
                  <p className="mb-1 font-medium text-[#00b4d8]">
                    {"// Password requirements:"}
                  </p>
                  <ul className="space-y-0.5">
                    <li
                      className={`flex items-center gap-1 ${
                        formData.password.length >= 8
                          ? "text-[#00e676]"
                          : "text-[#e91e63]"
                      }`}
                    >
                      <span>{formData.password.length >= 8 ? "✓" : "×"}</span>
                      At least 8 characters
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[a-z]/.test(formData.password)
                          ? "text-[#00e676]"
                          : "text-[#e91e63]"
                      }`}
                    >
                      <span>{/[a-z]/.test(formData.password) ? "✓" : "×"}</span>
                      One lowercase letter
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[A-Z]/.test(formData.password)
                          ? "text-[#00e676]"
                          : "text-[#e91e63]"
                      }`}
                    >
                      <span>{/[A-Z]/.test(formData.password) ? "✓" : "×"}</span>
                      One uppercase letter
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[0-9]/.test(formData.password)
                          ? "text-[#00e676]"
                          : "text-[#e91e63]"
                      }`}
                    >
                      <span>{/[0-9]/.test(formData.password) ? "✓" : "×"}</span>
                      One number
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[@$!%*?&]/.test(formData.password)
                          ? "text-[#00e676]"
                          : "text-[#e91e63]"
                      }`}
                    >
                      <span>
                        {/[@$!%*?&]/.test(formData.password) ? "✓" : "×"}
                      </span>
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
            className="block text-sm font-medium text-[#6272a4] mb-2"
          >
            <span className="text-[#8b5cf6]">const</span> confirmPassword{" "}
            <span className="text-[#6272a4]">=</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={onChange}
            className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] transition-all font-mono"
            placeholder='"••••••••"'
            required
          />
        </div>

        <div className="flex items-start text-sm">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="w-4 h-4 rounded border-[#2a2f4a] bg-[#0a0e27] text-[#00b4d8] focus:ring-[#00b4d8] focus:ring-offset-0 mt-0.5"
            required
          />
          <label htmlFor="terms" className="ml-3 text-[#6272a4]">
            I agree to the{" "}
            <button
              type="button"
              onClick={onTermsClick}
              className="text-[#8b5cf6] hover:text-[#00e676] underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={onPrivacyClick}
              className="text-[#8b5cf6] hover:text-[#00e676] underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            (formData.password
              ? !isPasswordStrong(formData.password)
              : false) ||
            (formData.email ? !!emailError : false)
          }
          className="group relative w-full cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#00e676] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-full bg-gradient-to-r from-[#8b5cf6] to-[#00e676] hover:from-[#00b4d8] hover:to-[#8b5cf6] disabled:from-[#2a2f4a] disabled:to-[#2a2f4a] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
            {isLoading ? (
              <>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span className="text-[#0a0e27]">$</span>
                <span>createAccount()</span>
              </>
            )}
          </div>
        </button>

        {((formData.password && !isPasswordStrong(formData.password)) ||
          (formData.email && emailError)) && (
          <div className="mt-2 p-2 bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 rounded-lg">
            <p className="text-sm text-[#ffbd2e] text-center font-mono">
              <span className="text-[#6272a4]">{"// "}</span>
              {emailError
                ? "Please enter a valid email address"
                : "Please create a strong password to continue"}
            </p>
          </div>
        )}
      </form>
    </>
  );
}
