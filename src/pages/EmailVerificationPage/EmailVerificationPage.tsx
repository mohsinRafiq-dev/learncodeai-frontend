import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import { ROUTES } from "../../constants";

export default function EmailVerificationPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const autoResent = searchParams.get("autoResent") === "true";

  // Handle redirect when no email is provided
  useEffect(() => {
    if (!email) {
      console.log(
        "EmailVerificationPage - No email found, will redirect to signin"
      );
      const timer = setTimeout(() => {
        console.log("EmailVerificationPage - Redirecting to signin");
        navigate(ROUTES.SIGNIN);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [email, navigate]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.verifyEmail(email, otp);

      if (response.data.status === "success") {
        // Store only token (user will be fetched on app load)
        localStorage.setItem("authToken", response.data.token);

        // Redirect to editor or intended page
        const redirectTo = searchParams.get("redirect") || ROUTES.HOME;
        navigate(redirectTo);
      }
    } catch (err: unknown) {
      const errorResponse = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data;
      setError(errorResponse?.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setIsResending(true);
    setError("");

    try {
      await authAPI.resendVerificationOTP(email);
      alert("Verification code sent to your email!");
    } catch (err: unknown) {
      const errorResponse = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data;
      setError(errorResponse?.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verification
          </h2>
          <p className="text-gray-600 mb-4">Loading email verification...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mt-2">
            We sent a verification code to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Auto-resent Message */}
        {autoResent && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Account not verified. We sent a new verification code to your
                email!
              </span>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifyEmail} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-blue-400"
          >
            {isResending ? "Sending..." : "Resend verification code"}
          </button>
        </div>

        {/* Back to Sign In */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(ROUTES.SIGNIN)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

