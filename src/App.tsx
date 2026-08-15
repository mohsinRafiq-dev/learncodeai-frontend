import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes";
import HomePage from "./pages/HomePage/HomePage";
import EditorPage from "./pages/Editorpage/EditorPage";
import SigninPage from "./pages/SigninPage/SigninPage";
import SignupPage from "./pages/SignupScreen/SignupScreen";
import OAuthSuccessPage from "./pages/OAuthSuccess/OAuthSuccess";
import EmailVerificationPage from "./pages/EmailVerificationPage/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
import Layout from "./pages/Layout";
import TutorialsPage from "./pages/TutorialsPage/TutorialsPage";
import TutorialsDetailPage from "./pages/TutorialsPage/Components/TutorialsDetailPage";
import CoursesPage from "./pages/CoursesPage/CoursesPage";
import CourseLearningPage from "./pages/CourseLearningPage/CourseLearningPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import AdminPortal from "./pages/AdminPortal/AdminPortal";
import AboutPage from "./pages/AboutPage/AboutPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import QuizzesPage from "./pages/QuizzesPage/QuizzesPage";
import DiscussionPage from "./pages/DiscussionPage/DiscussionPage";
import GamificationPage from "./pages/GamificationPage/GamificationPage";
import ProgressDashboardPage from "./pages/ProgressDashboardPage/ProgressDashboardPage";
import PricingPage from "./pages/PricingPage/PricingPage";
import BillingSuccessPage from "./pages/PricingPage/BillingSuccessPage";
import CreatorStudio from "./pages/CreatorStudio/CreatorStudio";
import AITutorialSuccessNotification from "./components/AITutorialSuccessNotification/AITutorialSuccessNotification";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";

function App() {
  return (
    <PlatformSettingsProvider>
    <AuthProvider>
      <Router>
        <AITutorialSuccessNotification />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/billing/success" element={<BillingSuccessPage />} />
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutorials"
              element={
                <ProtectedRoute>
                  <TutorialsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutorials/:language"
              element={
                <ProtectedRoute>
                  <TutorialsDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseLearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <QuizzesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/discussions" element={<DiscussionPage />} />
            <Route
              path="/gamification"
              element={
                <ProtectedRoute>
                  <GamificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressDashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Creator Studio. Any signed-in user can reach it — the page
                itself shows the application form until they're approved. */}
            <Route
              path="/creator"
              element={
                <ProtectedRoute>
                  <CreatorStudio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/payouts"
              element={
                <ProtectedRoute>
                  <CreatorStudio />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Admin routes without Layout (no navbar) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/success" element={<OAuthSuccessPage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </PlatformSettingsProvider>
  );
}

export default App;
