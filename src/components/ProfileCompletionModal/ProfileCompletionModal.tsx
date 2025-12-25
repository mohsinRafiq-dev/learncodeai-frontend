import React from "react";
import { User, Settings } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onGoToProfile: () => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onSkip,
  onGoToProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Icon and Header */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h2>

          <p className="text-gray-600 mb-6">
            Take a moment to set up your profile and let others know more about
            you!
          </p>
        </div>

        {/* Buttons */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={onGoToProfile}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Settings className="w-5 h-5" />
            Go to Profile Settings
          </button>

          <button
            onClick={onSkip}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;

