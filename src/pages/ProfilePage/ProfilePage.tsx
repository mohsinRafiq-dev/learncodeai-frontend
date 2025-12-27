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
  Terminal,
  Sparkles,
  Trash2,
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
  const [createdTutorials, setCreatedTutorials] = useState<
    {
      _id: string;
      title: string;
      description: string;
      language: string;
      concept: string;
      difficulty: string;
      content: string;
      tags?: string[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "tutorials" | "certificates" | "settings"
  >(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem("profileActiveTab");
    if (
      stored &&
      ["overview", "courses", "tutorials", "certificates", "settings"].includes(
        stored
      )
    ) {
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
      ["overview", "courses", "tutorials", "settings", "certificates"].includes(
        tabParam
      )
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
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleDeleteCreatedTutorial = async (tutorialId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this tutorial? This action cannot be undone."
      )
    ) {
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
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">// Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 terminal-window neon-border-pink p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-700/50">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-gray-500 text-xs font-mono">
              error.tsx
            </span>
          </div>
          <div className="w-16 h-16 neon-border-pink rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-500/10">
            <ExternalLink className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center font-mono">
            // Oops!
          </h2>
          <p className="text-gray-400 mb-6 text-center">{error}</p>
          <button
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-500/25 transition-all duration-300"
            onClick={loadProfileData}
          >
            retry()
          </button>
        </div>
      </div>
    );
  }

  if (!user || !dashboardStats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        {/* Circuit Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300b4d8' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onSkip={handleSkipModal}
        onGoToProfile={handleGoToProfile}
      />

      {/* Modern Header */}
      <div className="bg-[#0d1230]/80 backdrop-blur-xl border-b border-cyan-500/10 sticky top-0 z-10">
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
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
                  {getAvatarDisplay(user)}
                </div>
              )}

              <div>
                <h1 className="text-lg font-bold text-white font-mono">
                  <span className="text-cyan-400">const</span>{" "}
                  {user.name.replace(/\s+/g, "_")}
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-cyan-500/10 rounded-xl transition-colors border border-transparent hover:border-cyan-500/20">
                <Bell className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition-colors" />
              </button>
              <button className="p-2.5 hover:bg-purple-500/10 rounded-xl transition-colors border border-transparent hover:border-purple-500/20">
                <Settings className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" />
              </button>
              <button className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20">
                <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Navigation Pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            {
              key: "overview",
              label: "dashboard()",
              icon: TrendingUp,
              color: "cyan",
            },
            {
              key: "courses",
              label: "myCourses()",
              icon: BookOpen,
              color: "purple",
            },
            { key: "tutorials", label: "saved()", icon: Heart, color: "pink" },
            {
              key: "certificates",
              label: "certificates()",
              icon: Award,
              color: "yellow",
            },
            {
              key: "settings",
              label: "settings()",
              icon: Settings,
              color: "green",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const colorClasses = {
              cyan: isActive
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20"
                : "hover:border-cyan-500/30 hover:text-cyan-400",
              purple: isActive
                ? "bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-purple-500/20"
                : "hover:border-purple-500/30 hover:text-purple-400",
              pink: isActive
                ? "bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-pink-500/20"
                : "hover:border-pink-500/30 hover:text-pink-400",
              yellow: isActive
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-yellow-500/20"
                : "hover:border-yellow-500/30 hover:text-yellow-400",
              green: isActive
                ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-green-500/20"
                : "hover:border-green-500/30 hover:text-green-400",
            };
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as typeof activeTab);
                  localStorage.setItem("profileActiveTab", tab.key);
                }}
                className={`px-6 py-3 rounded-xl font-mono text-sm flex items-center gap-2 transition-all whitespace-nowrap border ${
                  isActive
                    ? `${
                        colorClasses[tab.color as keyof typeof colorClasses]
                      } shadow-lg`
                    : `bg-[#0d1230]/50 text-gray-400 border-gray-700/30 ${
                        colorClasses[tab.color as keyof typeof colorClasses]
                      }`
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
                  label: "// Enrolled Courses",
                  value: dashboardStats.enrolledCourses,
                  color: "cyan",
                  borderClass: "border-cyan-500/30",
                  bgClass: "bg-cyan-500/10",
                  iconClass: "text-cyan-400",
                },
                {
                  icon: CheckCircle,
                  label: "// Completed",
                  value: dashboardStats.completedCourses,
                  color: "green",
                  borderClass: "border-green-500/30",
                  bgClass: "bg-green-500/10",
                  iconClass: "text-green-400",
                },
                {
                  icon: Heart,
                  label: "// Saved",
                  value: dashboardStats.savedTutorials,
                  color: "pink",
                  borderClass: "border-pink-500/30",
                  bgClass: "bg-pink-500/10",
                  iconClass: "text-pink-400",
                },
                {
                  icon: Award,
                  label: "// Certificates",
                  value: dashboardStats.certificates,
                  color: "yellow",
                  borderClass: "border-yellow-500/30",
                  bgClass: "bg-yellow-500/10",
                  iconClass: "text-yellow-400",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`terminal-window ${stat.borderClass} p-6 hover:shadow-lg hover:shadow-${stat.color}-500/10 transition-all`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`w-6 h-6 ${stat.iconClass}`} />
                    </div>
                    <p className="text-sm font-mono text-gray-500 mb-1">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold text-white font-mono`}>
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="terminal-window neon-border-cyan p-8">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-gray-500 text-xs font-mono">
                    progress.tsx
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono">
                      courseProgress
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      // Average completion rate
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/30">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all shadow-inner"
                        style={{
                          width: `${dashboardStats.averageCourseProgress}%`,
                        }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-cyan-400 font-mono">
                      {formatProgress(dashboardStats.averageCourseProgress)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="terminal-window neon-border-purple p-8">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-gray-500 text-xs font-mono">
                    learning-time.tsx
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono">
                      learningTime
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      // Total hours invested
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white font-mono">
                      {formatDuration(dashboardStats.totalTimeSpentMinutes)}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                      // of focused learning
                    </p>
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
              <h2 className="text-2xl font-bold text-white font-mono">
                <span className="text-purple-400">const</span> learningJourney{" "}
                <span className="text-gray-500">=</span>
              </h2>
              <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-mono border border-purple-500/30">
                {courseProgress.length} active
              </span>
            </div>

            {courseProgress.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courseProgress.map((course) => (
                  <div
                    key={course.enrollmentId}
                    className="terminal-window neon-border-purple p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/50">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="ml-2 text-gray-500 text-xs font-mono">
                        course.tsx
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                        <Code className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-white text-lg leading-tight font-mono">
                            {course.course.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColorClass(
                              course.course.difficulty
                            )} whitespace-nowrap font-mono`}
                          >
                            {course.course.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-cyan-400 mb-1 font-mono">
                          //{" "}
                          {course.course.instructor?.name ||
                            "Unknown Instructor"}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {course.course.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-mono text-gray-400">
                          progress:
                        </span>
                        <span className="text-sm font-bold text-cyan-400 font-mono">
                          {formatProgress(course.progressPercentage)}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/30">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        // {course.completedSections} of {course.totalSections}{" "}
                        sections completed
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                          course.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : course.status === "completed"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : course.status === "withdrawn"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
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
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 font-mono transition-all"
                          >
                            continue()
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        {course.status === "active" && (
                          <button
                            onClick={() =>
                              handleWithdrawFromCourse(course.enrollmentId)
                            }
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold font-mono border border-red-500/30 transition-all"
                          >
                            withdraw()
                          </button>
                        )}
                        {course.status === "withdrawn" && (
                          <button
                            onClick={() =>
                              handleContinueAgain(course.enrollmentId)
                            }
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 font-mono transition-all"
                          >
                            resume()
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-window neon-border-purple p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                  <BookOpen className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-mono">
                  // Start Your Learning Journey
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Discover courses and start building your skills today
                </p>
                <button
                  onClick={() => navigate("/tutorials")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-purple-500/20 font-mono transition-all"
                >
                  exploreCourses()
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
                <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <span className="text-purple-400">const</span>{" "}
                  aiCreatedTutorials
                </h2>
                <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-mono flex items-center gap-2 border border-purple-500/30">
                  {createdTutorials.length} created
                </span>
              </div>

              {createdTutorials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdTutorials.map((tutorial) => (
                    <div
                      key={tutorial._id}
                      className="terminal-window neon-border-purple p-5 hover:shadow-lg hover:shadow-purple-500/10 transition-all group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCreatedTutorial(tutorial._id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/30"
                        title="Delete tutorial"
                      >
                        <Trash2 className="w-4 h-4" />
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
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm mb-1 truncate font-mono">
                                {tutorial.title}
                              </h4>
                              <p className="text-xs text-gray-500 font-mono">
                                // {tutorial.concept}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 font-mono ${getDifficultyColorClass(
                              tutorial.difficulty
                            )}`}
                          >
                            {tutorial.difficulty.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {tutorial.description}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/30">
                          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-mono border border-purple-500/30">
                            AI-Generated
                          </span>
                          <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all font-mono">
                            view()
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="terminal-window neon-border-purple p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-mono">
                    // No AI Tutorials Yet
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Generate personalized tutorials with AI on any programming
                    topic
                  </p>
                  <button
                    onClick={() => navigate("/tutorials")}
                    className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-2 font-mono transition-colors"
                  >
                    generateTutorial()
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Saved Tutorials Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white font-mono">
                  <span className="text-pink-400">const</span> savedTutorials
                </h2>
                <span className="px-4 py-2 bg-pink-500/10 text-pink-400 rounded-xl text-sm font-mono flex items-center gap-2 border border-pink-500/30">
                  <Heart className="w-4 h-4" />
                  {savedTutorials.length} saved
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
                        className="terminal-window neon-border-pink p-5 hover:shadow-lg hover:shadow-pink-500/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform">
                              <Code className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm mb-1 truncate font-mono">
                                {saved.tutorial.title}
                              </h4>
                              <p className="text-xs text-gray-500 font-mono">
                                // {saved.tutorial.concept}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 font-mono ${getDifficultyColorClass(
                              saved.tutorial.difficulty
                            )}`}
                          >
                            {saved.tutorial.difficulty.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {saved.tutorial.description}
                        </p>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-700/30">
                          <span className="text-gray-500 font-mono">
                            // {new Date(saved.savedAt).toLocaleDateString()}
                          </span>
                          <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all font-mono">
                            startLearning()
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="terminal-window neon-border-pink p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-6 border border-pink-500/30">
                    <Heart className="w-10 h-10 text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-mono">
                    // No Saved Tutorials Yet
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Save tutorials to quickly access them later
                  </p>
                  <button
                    onClick={() => navigate("/tutorials")}
                    className="text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-2 font-mono transition-colors"
                  >
                    browseTutorials()
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
              <h2 className="text-2xl font-bold text-white mb-2 font-mono">
                <span className="text-yellow-400">const</span> myCertificates
              </h2>
              <p className="text-gray-400 font-mono">
                // View and download your earned certificates
              </p>
            </div>
            <UserCertificates />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white font-mono">
              <span className="text-green-400">const</span> accountSettings
            </h2>

            <div className="terminal-window neon-border-green overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 border-b border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-gray-500 text-xs font-mono">
                    profile-settings.tsx
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-mono">
                  profileInformation
                </h3>
                <p className="text-green-400/70 text-sm font-mono">
                  // Manage your personal details
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mono text-cyan-400 mb-3">
                      fullName:
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
                      className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium text-white placeholder-gray-500 transition-all"
                      disabled={!editingProfile}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-cyan-400 mb-3">
                      dateOfBirth:
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
                      className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium text-white transition-all"
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mono text-cyan-400 mb-3">
                      location:
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
                      className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium text-white placeholder-gray-500 transition-all"
                      disabled={!editingProfile}
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-cyan-400 mb-3">
                      experienceLevel:
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
                      className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium text-white transition-all"
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
                  <label className="block text-sm font-mono text-cyan-400 mb-3">
                    bio:{" "}
                    <span className="text-gray-500">
                      // {profileForm.bio.length}/500
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
                    className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium resize-none text-white placeholder-gray-500 transition-all"
                    disabled={!editingProfile}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-mono text-cyan-400 mb-3">
                    profilePicture:
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
                        className="w-20 h-20 rounded-xl object-cover border-2 border-green-500/30"
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
                          className="text-sm text-red-400 hover:text-red-300 font-medium font-mono transition-colors"
                        >
                          remove()
                        </button>
                      )}
                    </div>
                  )}

                  {/* Upload from Device */}
                  {editingProfile && (
                    <div className="mb-4">
                      <label className="block text-xs font-mono text-gray-500 mb-2">
                        // Upload from Device
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
                        className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-gradient-to-r file:from-green-500 file:to-emerald-500
                          file:text-white
                          hover:file:from-green-600 hover:file:to-emerald-600
                          file:cursor-pointer
                          cursor-pointer
                          file:shadow-lg file:shadow-green-500/20"
                      />
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        // Max size: 5MB. Accepted: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}

                  {/* Or use URL */}
                  {editingProfile && (
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2">
                        // Or use Image URL
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
                        className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm font-medium text-white placeholder-gray-500 transition-all"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="text-sm font-mono text-cyan-400">
                    socialLinks:
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2">
                        // GitHub
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
                        className="w-full px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm text-white placeholder-gray-500 transition-all"
                        disabled={!editingProfile}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2">
                        // LinkedIn
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
                        className="w-full px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm text-white placeholder-gray-500 transition-all"
                        disabled={!editingProfile}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2">
                        // Website
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
                        className="w-full px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm text-white placeholder-gray-500 transition-all"
                        disabled={!editingProfile}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Programming Languages */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-cyan-400">
                    programmingLanguages:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.programmingLanguages.map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-mono border border-cyan-500/30"
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
                            className="ml-1 hover:text-cyan-300 transition-colors"
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
                        className="flex-1 px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm text-white placeholder-gray-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-cyan-400">
                    skills:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-mono border border-purple-500/30"
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
                            className="ml-1 hover:text-purple-300 transition-colors"
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
                              skills: [...prev.skills, value],
                            }));
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm text-white placeholder-gray-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-cyan-400">
                    interests:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono border border-green-500/30"
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
                            className="ml-1 hover:text-green-300 transition-colors"
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
                              interests: [...prev.interests, value],
                            }));
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-[#0a0e27] border-2 border-gray-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-sm text-white placeholder-gray-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                      <Bell className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <label
                        htmlFor="notifications"
                        className="block text-sm font-mono text-white"
                      >
                        emailNotifications
                      </label>
                      <p className="text-xs text-gray-500 font-mono">
                        // Receive updates about your courses
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
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-700/30">
                  {editingProfile ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 font-mono transition-all"
                      >
                        saveChanges()
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
                        className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 px-8 py-3 rounded-xl font-bold font-mono border border-gray-600/50 transition-all"
                      >
                        cancel()
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 font-mono transition-all"
                    >
                      <Edit3 className="w-5 h-5" />
                      editProfile()
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
