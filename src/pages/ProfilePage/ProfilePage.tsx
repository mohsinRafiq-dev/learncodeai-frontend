import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { tutorialAPI } from "../../services/tutorialAPI";
import {
  getProfile,
  updateProfile,
  getDashboardStats,
  getCourseProgress,
  getSavedTutorials,
  updateEnrollmentStatus,
  formatDuration,
  formatProgress,
  getAvatarDisplay,
  markPromptShown,
  uploadProfilePicture,
  type User,
  type DashboardStats,
  type CourseProgress,
  type SavedTutorial,
} from "../../functions/ProfileFunctions/profileFunctions";
import ProfileCompletionModal from "../../components/ProfileCompletionModal/ProfileCompletionModal";
import UserCertificates from "../../components/Certificates/UserCertificates";
import {
  BookOpen,
  CheckCircle,
  Heart,
  Award,
  Clock,
  TrendingUp,
  Settings,
  Mail,
  Edit3,
  ChevronRight,
  Code,
  Target,
  BarChart3,
  ExternalLink,
  Bell,
  LogOut,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [savedTutorials, setSavedTutorials] = useState<SavedTutorial[]>([]);
  const [createdTutorials, setCreatedTutorials] = useState<{
    _id: string;
    title: string;
    description: string;
    language: string;
    concept: string;
    difficulty: string;
    content: string;
    tags?: string[];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "tutorials" | "certificates" | "settings"
  >(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem("profileActiveTab");
    if (stored && ["overview", "courses", "tutorials", "certificates", "settings"].includes(stored)) {
      return stored as typeof activeTab;
    }
    return "overview";
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    profilePicture: "",
    dateOfBirth: "",
    bio: "",
    location: "",
    github: "",
    linkedin: "",
    website: "",
    programmingLanguages: [] as string[],
    skills: [] as string[],
    interests: [] as string[],
    experience: "" as "beginner" | "intermediate" | "advanced" | "expert" | "",
    preferences: {
      emailNotifications: true,
    },
  });

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        window.location.href = "/signin";
        return;
      }

      const [profileRes, statsRes, courseProgressRes, savedTutorialsRes] =
        await Promise.all([
          getProfile(),
          getDashboardStats(),
          getCourseProgress(),
          getSavedTutorials(),
        ]);

      setUser(profileRes.data);
      setDashboardStats(statsRes.data);
      setCourseProgress(courseProgressRes.data);
      setSavedTutorials(savedTutorialsRes.data);

      // Load user's created tutorials
      try {
        const createdRes = await tutorialAPI.getUserCreatedTutorials();
        setCreatedTutorials(createdRes.data || []);
      } catch (err) {
        console.error("Error loading created tutorials:", err);
        setCreatedTutorials([]);
      }

      setProfileForm({
        name: profileRes.data.name,
        profilePicture: profileRes.data.profilePicture || "",
        dateOfBirth: profileRes.data.dateOfBirth || "",
        bio: profileRes.data.bio || "",
        location: profileRes.data.location || "",
        github: profileRes.data.github || "",
        linkedin: profileRes.data.linkedin || "",
        website: profileRes.data.website || "",
        programmingLanguages: profileRes.data.programmingLanguages || [],
        skills: profileRes.data.skills || [],
        interests: profileRes.data.interests || [],
        experience: profileRes.data.experience || "",
        preferences: {
          emailNotifications:
            profileRes.data.preferences?.emailNotifications !== false,
        },
      });

      // Check if we should show profile completion modal (only for first login)
      if (!profileRes.data.profileCompletionPromptShown) {
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load profile data"
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["overview", "courses", "tutorials", "settings", "certificates"].includes(tabParam)
    ) {
      setActiveTab(tabParam as typeof activeTab);
      localStorage.setItem("profileActiveTab", tabParam);
    }
  }, [searchParams]);

  // Persist activeTab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("profileActiveTab", activeTab);
    }
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    try {
      const response = await updateProfile(profileForm);
      setUser(response.data);
      setEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleWithdrawFromCourse = async (enrollmentId: string) => {
    try {
      await updateEnrollmentStatus(enrollmentId, "withdrawn");
      const courseProgressRes = await getCourseProgress();
      setCourseProgress(courseProgressRes.data);
    } catch (err) {
      console.error("Error withdrawing from course:", err);
      setError(
        err instanceof Error ? err.message : "Failed to withdraw from course"
      );
    }
  };

  const handleSkipModal = async () => {
    console.log("Skip button clicked in ProfilePage");
    setShowProfileModal(false);
    try {
      const result = await markPromptShown();
      console.log("Prompt marked as shown");
      // Update local state with the new user data
      if (result.data) {
        setUser(result.data);
      }
    } catch (err) {
      console.error("Error marking prompt as shown:", err);
    }
  };

  const handleGoToProfile = async () => {
    console.log("Go to profile button clicked in ProfilePage");
    setShowProfileModal(false);
    setActiveTab("settings");
    try {
      const result = await markPromptShown();
      console.log("Prompt marked as shown, settings tab activated");
      // Update local state with the new user data
      if (result.data) {
        setUser(result.data);
      }
    } catch (err) {
      console.error("Error marking prompt as shown:", err);
    }
  };

  const handleContinueAgain = async (enrollmentId: string) => {
    try {
      await updateEnrollmentStatus(enrollmentId, "active");
      const courseProgressRes = await getCourseProgress();
      setCourseProgress(courseProgressRes.data);
    } catch (err) {
      console.error("Error reactivating course:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reactivate course"
      );
    }
  };

  const getDifficultyColorClass = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "intermediate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "advanced":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleDeleteCreatedTutorial = async (tutorialId: string) => {
    if (!confirm("Are you sure you want to delete this tutorial? This action cannot be undone.")) {
      return;
    }
    
    try {
      await tutorialAPI.deleteUserTutorial(tutorialId);
      // Refresh the created tutorials list
      const createdRes = await tutorialAPI.getUserCreatedTutorials();
      setCreatedTutorials(createdRes.data || []);
    } catch (err) {
      console.error("Error deleting tutorial:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete tutorial"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Oops!
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            onClick={loadProfileData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user || !dashboardStats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onSkip={handleSkipModal}
        onGoToProfile={handleGoToProfile}
      />

      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.profilePicture ? (
                <img
                  src={
                    user.profilePicture.startsWith("http")
                      ? user.profilePicture
                      : `http://localhost:5000${user.profilePicture}`
                  }
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-200 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {getAvatarDisplay(user)}
                </div>
              )}

              <div>
                <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: "overview", label: "Dashboard", icon: TrendingUp },
            { key: "courses", label: "My Courses", icon: BookOpen },
            { key: "tutorials", label: "Saved", icon: Heart },
            { key: "certificates", label: "Certificates", icon: Award },
            { key: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as typeof activeTab);
                  localStorage.setItem("profileActiveTab", tab.key);
                }}
                className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              {[
                {
                  icon: BookOpen,
                  label: "Enrolled Courses",
                  value: dashboardStats.enrolledCourses,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: CheckCircle,
                  label: "Completed",
                  value: dashboardStats.completedCourses,
                  color: "from-emerald-500 to-emerald-600",
                },
                {
                  icon: Heart,
                  label: "Saved",
                  value: dashboardStats.savedTutorials,
                  color: "from-pink-500 to-pink-600",
                },
                {
                  icon: Award,
                  label: "Certificates",
                  value: dashboardStats.certificates,
                  color: "from-amber-500 to-amber-600",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Course Progress</h3>
                    <p className="text-sm text-gray-600">
                      Average completion rate
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all shadow-inner"
                        style={{
                          width: `${dashboardStats.averageCourseProgress}%`,
                        }}
                      />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatProgress(dashboardStats.averageCourseProgress)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Learning Time</h3>
                    <p className="text-sm text-gray-600">
                      Total hours invested
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatDuration(dashboardStats.totalTimeSpentMinutes)}
                    </p>
                    <p className="text-sm text-gray-600">of focused learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                My Learning Journey
              </h2>
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold">
                {courseProgress.length} Active Courses
              </span>
            </div>

            {courseProgress.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courseProgress.map((course) => (
                  <div
                    key={course.enrollmentId}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Code className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            {course.course.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColorClass(
                              course.course.difficulty
                            )} whitespace-nowrap`}
                          >
                            {course.course.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {course.course.instructor?.name ||
                            "Unknown Instructor"}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {course.course.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Progress
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatProgress(course.progressPercentage)}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {course.completedSections} of {course.totalSections}{" "}
                        sections completed
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          course.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : course.status === "completed"
                            ? "bg-blue-50 text-blue-700"
                            : course.status === "withdrawn"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {course.status.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2">
                        {course.status !== "withdrawn" && (
                          <button
                            onClick={() =>
                              navigate(`/courses/${course.course._id}`)
                            }
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
                          >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        {course.status === "active" && (
                          <button
                            onClick={() =>
                              handleWithdrawFromCourse(course.enrollmentId)
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold"
                          >
                            Withdraw
                          </button>
                        )}
                        {course.status === "withdrawn" && (
                          <button
                            onClick={() =>
                              handleContinueAgain(course.enrollmentId)
                            }
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg"
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Start Your Learning Journey
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Discover courses and start building your skills today
                </p>
                <button
                  onClick={() => navigate("/tutorials")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg"
                >
                  Explore Courses
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === "tutorials" && (
          <div className="space-y-8">
            {/* AI-Created Tutorials Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  My AI-Created Tutorials
                </h2>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                  {createdTutorials.length} Created
                </span>
              </div>

              {createdTutorials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdTutorials.map((tutorial) => (
                    <div
                      key={tutorial._id}
                      className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCreatedTutorial(tutorial._id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete tutorial"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div
                        onClick={() =>
                          navigate(
                            `/tutorials/${tutorial.language}?tutorialId=${tutorial._id}`
                          )
                        }
                        className="cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0 pr-8">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                                {tutorial.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {tutorial.concept}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 ${getDifficultyColorClass(
                              tutorial.difficulty
                            )}`}
                          >
                            {tutorial.difficulty.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {tutorial.description}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                          <span className="text-gray-500 flex items-center gap-1">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              AI-Generated
                            </span>
                          </span>
                          <span className="text-purple-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Tutorial
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-purple-100">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No AI Tutorials Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Generate personalized tutorials with AI on any programming topic
                  </p>
                  <button
                    onClick={() => navigate("/tutorials")}
                    className="text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-2"
                  >
                    Generate Tutorial
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Saved Tutorials Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Saved Tutorials
                </h2>
                <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {savedTutorials.length} Saved
                </span>
              </div>

            {savedTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedTutorials.map((saved) =>
                  saved.tutorial ? (
                    <div
                      key={saved._id}
                      onClick={() =>
                        navigate(
                          `/tutorials/${saved.tutorial.language}?tutorialId=${saved.tutorial._id}`
                        )
                      }
                      className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                              {saved.tutorial.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {saved.tutorial.concept}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 ${getDifficultyColorClass(
                            saved.tutorial.difficulty
                          )}`}
                        >
                          {saved.tutorial.difficulty.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">
                        {saved.tutorial.description}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <span className="text-gray-500">
                          {new Date(saved.savedAt).toLocaleDateString()}
                        </span>
                        <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Start Learning
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Saved Tutorials Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Save tutorials to quickly access them later
                </p>
                <button
                  onClick={() => navigate("/tutorials")}
                  className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-2"
                >
                  Browse Tutorials
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Certificates
              </h2>
              <p className="text-gray-600">
                View and download your earned certificates
              </p>
            </div>
            <UserCertificates />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Account Settings
            </h2>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h3 className="text-lg font-bold text-white">
                  Profile Information
                </h3>
                <p className="text-blue-100 text-sm">
                  Manage your personal details
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                      disabled={!editingProfile}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                      disabled={!editingProfile}
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Experience Level
                    </label>
                    <select
                      value={profileForm.experience}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          experience: e.target.value as
                            | ""
                            | "beginner"
                            | "intermediate"
                            | "advanced"
                            | "expert",
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                      disabled={!editingProfile}
                    >
                      <option value="">Select experience</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Bio
                    <span className="text-gray-500 font-normal ml-2">
                      ({profileForm.bio.length}/500)
                    </span>
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setProfileForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }));
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium resize-none"
                    disabled={!editingProfile}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Profile Picture
                  </label>

                  {/* Current Picture Preview */}
                  {profileForm.profilePicture && (
                    <div className="mb-4 flex items-center gap-4">
                      <img
                        src={
                          profileForm.profilePicture.startsWith("http")
                            ? profileForm.profilePicture
                            : `http://localhost:5000${profileForm.profilePicture}`
                        }
                        alt="Profile preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                      {editingProfile && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfileForm((prev) => ({
                              ...prev,
                              profilePicture: "",
                            }))
                          }
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove Picture
                        </button>
                      )}
                    </div>
                  )}

                  {/* Upload from Device */}
                  {editingProfile && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Upload from Device
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const response = await uploadProfilePicture(file);
                              setProfileForm((prev) => ({
                                ...prev,
                                profilePicture: response.data.fileUrl,
                              }));
                              setUser(response.data.user);
                            } catch (err) {
                              console.error("Error uploading picture:", err);
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to upload picture"
                              );
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-600
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-gradient-to-r file:from-blue-500 file:to-purple-500
                          file:text-white
                          hover:file:from-blue-600 hover:file:to-purple-600
                          file:cursor-pointer
                          cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max size: 5MB. Accepted: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}

                  {/* Or use URL */}
                  {editingProfile && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Or use Image URL
                      </label>
                      <input
                        type="url"
                        value={
                          profileForm.profilePicture.startsWith("http")
                            ? profileForm.profilePicture
                            : ""
                        }
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            profilePicture: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900">
                    Social Links
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={profileForm.github}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            github: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={!editingProfile}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={profileForm.linkedin}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            linkedin: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={!editingProfile}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={!editingProfile}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Programming Languages */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Programming Languages
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.programmingLanguages.map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {lang}
                        {editingProfile && (
                          <button
                            onClick={() => {
                              setProfileForm((prev) => ({
                                ...prev,
                                programmingLanguages:
                                  prev.programmingLanguages.filter(
                                    (_, i) => i !== index
                                  ),
                              }));
                            }}
                            className="ml-1 hover:text-blue-900"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editingProfile && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a language..."
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            const value = e.currentTarget.value.trim();
                            e.currentTarget.value = "";
                            e.preventDefault();
                            setProfileForm((prev) => ({
                              ...prev,
                              programmingLanguages: [
                                ...prev.programmingLanguages,
                                value,
                              ],
                            }));
                          }
                        }}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                        {editingProfile && (
                          <button
                            onClick={() => {
                              setProfileForm((prev) => ({
                                ...prev,
                                skills: prev.skills.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                            className="ml-1 hover:text-purple-900"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editingProfile && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            const value = e.currentTarget.value.trim();
                            e.currentTarget.value = "";
                            e.preventDefault();
                            setProfileForm((prev) => ({
                              ...prev,
                              skills: [
                                ...prev.skills,
                                value,
                              ],
                            }));
                          }
                        }}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                        {editingProfile && (
                          <button
                            onClick={() => {
                              setProfileForm((prev) => ({
                                ...prev,
                                interests: prev.interests.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                            className="ml-1 hover:text-green-900"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editingProfile && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add an interest..."
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            const value = e.currentTarget.value.trim();
                            e.currentTarget.value = "";
                            e.preventDefault();
                            setProfileForm((prev) => ({
                              ...prev,
                              interests: [
                                ...prev.interests,
                                value,
                              ],
                            }));
                          }
                        }}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label
                        htmlFor="notifications"
                        className="block text-sm font-bold text-gray-900"
                      >
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-600">
                        Receive updates about your courses
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={profileForm.preferences.emailNotifications}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            emailNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                      disabled={!editingProfile}
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-100">
                  {editingProfile ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          if (user) {
                            setProfileForm({
                              name: user.name,
                              profilePicture: user.profilePicture || "",
                              dateOfBirth: user.dateOfBirth || "",
                              bio: user.bio || "",
                              location: user.location || "",
                              github: user.github || "",
                              linkedin: user.linkedin || "",
                              website: user.website || "",
                              programmingLanguages:
                                user.programmingLanguages || [],
                              skills: user.skills || [],
                              interests: user.interests || [],
                              experience: user.experience || "",
                              preferences: user.preferences,
                            });
                          }
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

