import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getProfile,
  markPromptShown,
} from "../../functions/ProfileFunctions/profileFunctions";
import ProfileCompletionModal from "../../components/ProfileCompletionModal/ProfileCompletionModal";
import Hero from "./Components/Hero";

// Lazy load below-the-fold components for better initial load performance
const Languages = lazy(() => import("./Components/Languages"));
const WhyLearnCodeAI = lazy(() => import("./Components/WhyLearnCodeAI"));
const CollaborationSection = lazy(
  () => import("./Components/CollaborationSection")
);
const HowItWorks = lazy(() => import("./Components/HowItWorks"));
const Testimonial = lazy(() => import("./Components/Testimonial"));
const StartJourney = lazy(() => import("./Components/StartJourney"));

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (isAuthenticated) {
        try {
          const profileRes = await getProfile();
          // Only show modal for newly created accounts (first login only)
          if (!profileRes.data.profileCompletionPromptShown) {
            console.log("Showing profile completion modal for new user");
            setShowProfileModal(true);
          }
        } catch (err) {
          console.error("Error checking profile completion:", err);
        }
      }
    };

    checkProfileCompletion();
  }, [isAuthenticated]);

  const handleSkipModal = async () => {
    console.log("Skip button clicked");
    setShowProfileModal(false);
    try {
      const result = await markPromptShown();
      console.log("Prompt marked as shown");
      // User data will be fetched on next auth check
    } catch (err) {
      console.error("Error marking prompt as shown:", err);
    }
  };

  const handleGoToProfile = async () => {
    console.log("Go to profile button clicked");
    try {
      const result = await markPromptShown();
      console.log("Prompt marked as shown, navigating...");
      // User data will be fetched on next auth check
      navigate("/profile?tab=settings");
      setShowProfileModal(false);
    } catch (err) {
      console.error("Error marking prompt as shown:", err);
    }
  };

  return (
    <div className="bg-[#0a0e27]">
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onSkip={handleSkipModal}
        onGoToProfile={handleGoToProfile}
      />
      <Hero />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-[#0a0e27]">
            <div className="text-[#00b4d8] font-mono animate-pulse">
              Loading...
            </div>
          </div>
        }
      >
        <div className="fade-in">
          <Languages />
        </div>
        <div className="fade-in">
          <WhyLearnCodeAI />
        </div>
        <div className="fade-in">
          <CollaborationSection />
        </div>
        <div className="fade-in">
          <HowItWorks />
        </div>
        <div className="fade-in">
          <Testimonial />
        </div>
        <StartJourney />
      </Suspense>
    </div>
  );
};

export default HomePage;
