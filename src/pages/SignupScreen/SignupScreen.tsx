import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { handleSignup, handleOAuthLogin } from "../../functions";
import OAuthButtons from "./components/OAuthButtons";
import SignupForm from "./components/SignupForm";
import Modal from "../../Modals/Modal";
import TermsContent from "./components/TermsContent";
import PrivacyContent from "./components/PrivacyContent";
import { useSettings } from "../../contexts/PlatformSettingsContext";

export default function SignupPage() {
  const { settings } = useSettings();
  const features = settings.features;
  // Registration killswitch — when admin closes registration, show a notice
  // instead of the form. Existing users can still sign in.
  if (!features.registrationOpen) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 font-mono">
        <div className="terminal-window backdrop-blur-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold neon-text-purple mb-3">
            Registration is currently closed
          </h1>
          <p className="text-[#6272a4] mb-6 text-sm">
            New signups are temporarily disabled by the platform administrator.
            Existing users can still{" "}
            <Link to="/signin" className="text-[#00b4d8] underline">
              sign in
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signup, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    try {
      await handleSignup(formData, signup, navigate, setLocalError);
    } catch {
      // Error handled by handleSignup
    }
  };

  const handleOAuthSignup = (provider: "google" | "github") => {
    handleOAuthLogin(provider);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00e676] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Circuit Pattern */}
      <div className="absolute inset-0 circuit-pattern opacity-30"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1f3a] neon-border-purple rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-[#8b5cf6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#6272a4]">{"// "}</span>
            <span className="neon-text-purple">Join</span>
            <span className="text-white"> LearnCode</span>
            <span className="neon-text-cyan"> AI</span>
          </h1>
          <p className="text-[#6272a4]">
            <span className="text-[#00b4d8]">{"/* "}</span>
            Create your account and start coding
            <span className="text-[#00b4d8]">{" */"}</span>
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="terminal-window backdrop-blur-xl p-8">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#2a2f4a]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
            <span className="ml-2 text-[#6272a4] text-sm">auth.register()</span>
          </div>

          {/* OAuth Buttons — gated by admin feature toggles */}
          {(features.googleOAuth || features.githubOAuth) && (
            <div className="mb-6">
              <OAuthButtons
                onGoogleClick={
                  features.googleOAuth
                    ? () => handleOAuthSignup("google")
                    : undefined
                }
                onGithubClick={
                  features.githubOAuth
                    ? () => handleOAuthSignup("github")
                    : undefined
                }
              />
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2f4a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f3a] text-[#6272a4]">
                {"// or create account with email"}
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <SignupForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error || localError}
            onTermsClick={() => setShowTermsModal(true)}
            onPrivacyClick={() => setShowPrivacyModal(true)}
          />

          {/* Sign In Link */}
          <p className="text-center text-[#6272a4] text-sm mt-6">
            <span className="text-[#00b4d8]">{"// "}</span>
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-[#00e676] hover:text-[#8b5cf6] font-semibold transition-colors"
            >
              signin()
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[#6272a4] text-xs mt-6">
          <span className="text-[#00b4d8]">{"/* "}</span>
          By creating an account, you agree to our{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-[#8b5cf6] hover:text-[#00e676] underline transition-colors cursor-pointer"
          >
            Terms
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-[#8b5cf6] hover:text-[#00e676] underline transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-[#00b4d8]">{" */"}</span>
        </p>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <TermsContent />
      </Modal>

      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <PrivacyContent />
      </Modal>
    </div>
  );
}
