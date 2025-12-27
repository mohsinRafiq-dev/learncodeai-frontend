import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import { ROUTES } from "../../constants";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"verify-otp" | "reset-password">(
    "verify-otp"
  );
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.verifyPasswordResetOTP(email, otp);
      setResetToken(response.resetToken);
      setStep("reset-password");
    } catch (err: unknown) {
      const errorMessage =
        (err as any)?.response?.data?.message || "Invalid or expired OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authAPI.resetPassword(resetToken, newPassword, confirmPassword);

      // Show success and redirect
      alert(
        "Password reset successful! You can now sign in with your new password."
      );
      navigate(ROUTES.SIGNIN);
    } catch (err: unknown) {
      const errorMessage =
        (err as any)?.response?.data?.message || "Failed to reset password";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    try {
      await authAPI.requestPasswordReset(email);
      alert("New verification code sent to your email!");
    } catch (err: unknown) {
      const errorMessage =
        (err as any)?.response?.data?.message || "Failed to resend code";
      setError(errorMessage);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 font-mono">
        <div className="terminal-window backdrop-blur-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-[#6272a4]">{"// "}</span>
            Reset Password
          </h2>
          <p className="text-[#6272a4] mb-4">No email address provided.</p>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-[#00b4d8] hover:text-[#00e676] font-medium transition-colors"
          >
            Go to forgotPassword()
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00e676] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#e91e63] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Circuit Pattern */}
      <div className="absolute inset-0 circuit-pattern opacity-30"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1f3a] neon-border-green rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-[#00e676]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-[#6272a4]">{"// "}</span>
            <span className="neon-text-green">Reset</span>
            <span className="text-white"> Password</span>
          </h2>
          <p className="text-[#6272a4]">
            {step === "verify-otp" ? (
              <>
                <span className="text-[#00b4d8]">{"/* "}</span>
                Enter the verification code sent to
                <span className="text-[#00b4d8]">{" */"}</span>
                <br />
                <span className="text-[#00e676]">"{email}"</span>
              </>
            ) : (
              <>
                <span className="text-[#00b4d8]">{"/* "}</span>
                Create your new password
                <span className="text-[#00b4d8]">{" */"}</span>
              </>
            )}
          </p>
        </div>

        {/* Form Card */}
        <div className="terminal-window backdrop-blur-xl p-8">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#2a2f4a]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
            <span className="ml-2 text-[#6272a4] text-sm">
              {step === "verify-otp"
                ? "auth.verifyOTP()"
                : "auth.setNewPassword()"}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-[#e91e63]/10 border border-[#e91e63]/30 rounded-lg mb-6">
              <p className="text-sm text-[#e91e63] font-mono">
                <span className="text-[#6272a4]">{"// Error: "}</span>
                {error}
              </p>
            </div>
          )}

          {step === "verify-otp" ? (
            // Step 1: Verify OTP
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-[#6272a4] mb-2"
                >
                  <span className="text-[#8b5cf6]">const</span> verificationCode{" "}
                  <span className="text-[#6272a4]">=</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676] transition-all font-mono text-center text-2xl tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="group relative w-full cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00e676] to-[#00b4d8] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full bg-gradient-to-r from-[#00e676] to-[#00b4d8] hover:from-[#8b5cf6] hover:to-[#00e676] disabled:from-[#2a2f4a] disabled:to-[#2a2f4a] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#0a0e27]">$</span>
                      <span>verifyCode()</span>
                    </>
                  )}
                </div>
              </button>

              <div className="text-center">
                <p className="text-sm text-[#6272a4] mb-2">
                  <span className="text-[#00b4d8]">{"// "}</span>Didn't receive
                  the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#8b5cf6] hover:text-[#00e676] font-medium text-sm transition-colors cursor-pointer"
                >
                  resendCode()
                </button>
              </div>
            </form>
          ) : (
            // Step 2: Reset Password
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#6272a4] mb-2"
                >
                  <span className="text-[#8b5cf6]">const</span> newPassword{" "}
                  <span className="text-[#6272a4]">=</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='"••••••••"'
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676] transition-all font-mono"
                  required
                  minLength={6}
                />
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
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='"••••••••"'
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-[#6272a4] focus:outline-none focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676] transition-all font-mono"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00e676] to-[#8b5cf6] rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full bg-gradient-to-r from-[#00e676] to-[#8b5cf6] hover:from-[#00b4d8] hover:to-[#00e676] disabled:from-[#2a2f4a] disabled:to-[#2a2f4a] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
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
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#0a0e27]">$</span>
                      <span>resetPassword()</span>
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              to={ROUTES.SIGNIN}
              className="text-[#6272a4] hover:text-[#00b4d8] text-sm transition-colors"
            >
              <span className="text-[#8b5cf6]">←</span> Back to signin()
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
