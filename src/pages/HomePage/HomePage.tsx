import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getProfile,
  markPromptShown,
} from "../../functions/ProfileFunctions/profileFunctions";
import ProfileCompletionModal from "../../components/ProfileCompletionModal/ProfileCompletionModal";
import CollaborationSection from "./Components/CollaborationSection";
import Languages from "./Components/Languages";
import Hero from "./Components/Hero";
import HowItWorks from "./Components/HowItWorks";
import StartJourney from "./Components/StartJourney";
import Testimonial from "./Components/Testimonial";
import WhyLearnCodeAI from "./Components/WhyLearnCodeAI";

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
    <div>
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onSkip={handleSkipModal}
        onGoToProfile={handleGoToProfile}
      />
      <Hero />
      <Languages />
      <WhyLearnCodeAI />
      <CollaborationSection />
      <HowItWorks />
      <Testimonial />
      <StartJourney />
    </div>
  );
};

export default HomePage;
