import { useEffect, useState, useRef } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Plus,
  Users,
  FileText,
  MessageSquare,
  BookOpen,
  Edit,
  X,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchAnalyticsData,
  fetchTutorials,
  fetchRecentActivity,
  formatDate,
  type DashboardStats,
  type AnalyticsData,
  type Tutorial,
  type RecentActivity,
} from "../../../functions/AdminFunctions/adminFunctions";
import { adminCourseAPI, type Course } from "../../../services/adminCourseAPI";
import { adminAPI } from "../../../services/adminAPI";
import viewTrackingAPI from "../../../services/viewTrackingAPI";

interface ContentDataItem {
  name: string;
  value: number;
  color: string;
  type?: string;
}

interface SearchResult {
  tutorials: Tutorial[];
  courses: Course[];
  users: any[];
}

interface AdminDashboardProps {
  onNavigate?: (tab: string, data?: any) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult>({
    tutorials: [],
    courses: [],
    users: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      // Search tutorials
      const tutorialsResponse = await fetchTutorials(1, 5, "", query);

      // Search courses
      const coursesResponse = await adminCourseAPI.getAllCourses({
        search: query,
        page: 1,
        limit: 5,
      });

      // Search users
      const usersResponse = await adminAPI.searchUsers(query);

      setSearchResults({
        tutorials: tutorialsResponse.tutorials,
        courses: coursesResponse.data,
        users: usersResponse.data || [],
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditTutorial = (tutorial: Tutorial) => {
    onNavigate?.("tutorials", { tutorialId: tutorial._id });
  };

  const handleEditCourse = (course: Course) => {
    onNavigate?.("courses", { courseId: course._id });
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [latestTutorials, setLatestTutorials] = useState<Tutorial[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [mostViewedContent, setMostViewedContent] = useState<ContentDataItem[]>(
    []
  );

  const loadAnalytics = async () => {
    try {
      const data = await fetchAnalyticsData();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const loadLatestTutorials = async () => {
    try {
      const { tutorials } = await fetchTutorials(1, 3);
      setLatestTutorials(tutorials);
    } catch (err) {
      console.error("Error fetching tutorials:", err);
    }
  };

  const loadLatestCourses = async () => {
    try {
      const response = await adminCourseAPI.getAllCourses({
        page: 1,
        limit: 3,
      });
      setLatestCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const loadMostViewedContent = async () => {
    try {
      // Fetch real most viewed content from backend
      const response = await viewTrackingAPI.getMostViewedContent(6);

      if (response.success && response.data && response.data.length > 0) {
        const contentItems: ContentDataItem[] = response.data.map(
          (item: any) => ({
            name: item.title,
            value: item.viewCount || item.views || 0,
            color: item.type === "tutorial" ? "#3b82f6" : "#8b5cf6",
            type: item.type,
          })
        );

        setMostViewedContent(contentItems);
      } else {
        // Fallback to language stats if no view data
        const analyticsData = await fetchAnalyticsData();

        if (analyticsData && analyticsData.languageStats) {
          const contentItems: ContentDataItem[] =
            analyticsData.languageStats.map(
              (lang: { _id: string; count: number }) => ({
                name: lang._id.charAt(0).toUpperCase() + lang._id.slice(1),
                value: lang.count,
                color: languageColors[lang._id.toLowerCase()] || "#6b7280",
                type: "language",
              })
            );

          setMostViewedContent(
            contentItems.sort((a, b) => b.value - a.value).slice(0, 6)
          );
        } else {
          setMostViewedContent([]);
        }
      }
    } catch (err) {
      console.error("Error loading most viewed content:", err);
      // Fallback to empty array on error
      setMostViewedContent([]);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities = await fetchRecentActivity(4);
      setRecentActivities(activities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadLatestTutorials();
    loadLatestCourses();
    loadMostViewedContent();
    loadRecentActivity();
  }, []);

  const languageColors: { [key: string]: string } = {
    python: "#14b8a6",
    javascript: "#ec4899",
    cpp: "#a855f7",
    sql: "#22c55e",
    rust: "#f97316",
    haskell: "#3b82f6",
  };

  const contentData: ContentDataItem[] =
    analytics?.languageStats.map((lang: { _id: string; count: number }) => ({
      name: lang._id.charAt(0).toUpperCase() + lang._id.slice(1),
      value: lang.count,
      color: languageColors[lang._id.toLowerCase()] || "#6b7280",
    })) || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return User;
      case "tutorial_created":
        return BookOpen;
      case "content_updated":
        return Edit;
      case "course_created":
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_signup":
        return "bg-blue-100 text-blue-600";
      case "tutorial_created":
        return "bg-green-100 text-green-600";
      case "content_updated":
        return "bg-yellow-100 text-yellow-600";
      case "course_created":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div ref={searchRef} className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tutorials, users, courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Search Results Popup */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Searching...
                    </div>
                  ) : (
                    <>
                      {/* Tutorials Section */}
                      {searchResults.tutorials.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">
                            Tutorials
                          </div>
                          {searchResults.tutorials.map((tutorial) => (
                            <button
                              key={tutorial._id}
                              onClick={() => {
                                handleEditTutorial(tutorial);
                                setShowSearchResults(false);
                              }}
                              className="w-full px-4 py-2 hover:bg-gray-50 text-left flex items-center gap-2"
                            >
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">
                                  {tutorial.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {tutorial.language}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Courses Section */}
                      {searchResults.courses.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">
                            Courses
                          </div>
                          {searchResults.courses.map((course) => (
                            <button
                              key={course._id}
                              onClick={() => {
                                handleEditCourse(course);
                                setShowSearchResults(false);
                              }}
                              className="w-full px-4 py-2 hover:bg-gray-50 text-left flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-purple-600" />
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">
                                  {course.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {course.language}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Users Section */}
                      {searchResults.users.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700">
                            Users
                          </div>
                          {searchResults.users.map((user) => (
                            <button
                              key={user._id}
                              onClick={() => {
                                onNavigate?.("users", { userId: user._id });
                                setShowSearchResults(false);
                              }}
                              className="w-full px-4 py-2 hover:bg-gray-50 text-left flex items-center gap-2"
                            >
                              <User className="w-4 h-4 text-green-600" />
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {searchResults.tutorials.length === 0 &&
                        searchResults.courses.length === 0 &&
                        searchResults.users.length === 0 &&
                        !searchLoading && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No results found
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">
            Admin Panel / Dashboard
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's a summary of your site's activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadDashboardStats}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          ) : stats && stats.totalUsers !== undefined ? (
            [
              {
                label: "Total Users",
                value: (stats.totalUsers || 0).toLocaleString(),
                change: `${stats.userGrowthRate || "0.0"}%`,
                positive: parseFloat(stats.userGrowthRate || "0") >= 0,
              },
              {
                label: "Course Enrollments",
                value: (stats.totalEnrollments || 0).toLocaleString(),
                change: `${stats.enrollmentGrowthRate || "0.0"}%`,
                positive: parseFloat(stats.enrollmentGrowthRate || "0") >= 0,
              },
              {
                label: "Published Tutorials",
                value: (stats.totalTutorials || 0).toLocaleString(),
                change: `${stats.tutorialGrowthRate || "0.0"}%`,
                positive: parseFloat(stats.tutorialGrowthRate || "0") >= 0,
              },
              {
                label: "AI Chatbot Queries",
                value: (stats.totalChats || 0).toLocaleString(),
                change: `${stats.chatGrowthRate || "0.0"}%`,
                positive: parseFloat(stats.chatGrowthRate || "0") >= 0,
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-5 shadow-sm border border-gray-100"
              >
                <div className="text-xs text-gray-500 mb-3">{stat.label}</div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              User Growth (Last 30 Days)
            </h2>
            <div className="relative h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden">
              <svg
                className="w-full h-full p-8"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#60a5fa", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#a78bfa", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <polyline
                  points="5,75 20,65 35,55 50,70 65,45 80,35 95,25"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="5" cy="75" r="1.5" fill="#60a5fa" />
                <circle cx="20" cy="65" r="1.5" fill="#60a5fa" />
                <circle cx="35" cy="55" r="1.5" fill="#60a5fa" />
                <circle cx="50" cy="70" r="1.5" fill="#60a5fa" />
                <circle cx="65" cy="45" r="1.5" fill="#60a5fa" />
                <circle cx="80" cy="35" r="1.5" fill="#60a5fa" />
                <circle cx="95" cy="25" r="1.5" fill="#a78bfa" />
              </svg>
              <div className="absolute bottom-3 right-4 text-gray-500 text-xs tracking-wider">
                STRATEGY
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowTutorialModal(true);
                }}
                className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Tutorial
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowCourseModal(true);
                }}
                className="w-full px-4 py-2.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Course
              </button>
              <button
                onClick={() => onNavigate?.("users")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 text-gray-700"
              >
                <Users className="w-4 h-4" />
                Manage Users
              </button>
              <button
                onClick={() => onNavigate?.("analytics")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 text-gray-700"
              >
                <FileText className="w-4 h-4" />
                View Reports
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Most Viewed Content */}
          <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Most Viewed Content
            </h2>
            <div className="space-y-2.5">
              {mostViewedContent.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No content data available
                </div>
              ) : (
                mostViewedContent.map((item, index) => {
                  const maxViewValue = Math.max(
                    ...mostViewedContent.map((i) => i.value)
                  );
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-700 font-medium" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {item.type}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded h-6 relative overflow-hidden">
                        <div
                          className="h-6 rounded transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${(item.value / maxViewValue) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {item.value} views
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No recent activity
                </div>
              ) : (
                recentActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`${color} p-1.5 rounded-md h-fit`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-900 leading-relaxed">
                          {activity.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Latest Content Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Latest Content
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate?.("tutorials")}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                View All Tutorials
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onNavigate?.("courses")}
                className="text-purple-500 hover:text-purple-600 text-sm font-medium"
              >
                View All Courses
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Language
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Author
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">
                    Date Created
                  </th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {latestTutorials.length === 0 && latestCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-gray-500 text-sm"
                    >
                      No content found
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Tutorials */}
                    {latestTutorials.map((tutorial, index) => (
                      <tr
                        key={`tutorial-${tutorial._id || index}`}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            Tutorial
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900">
                          {tutorial.title}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {tutorial.language?.toUpperCase() || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {tutorial.createdBy?.name || "Unknown"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700">
                            Published
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(tutorial.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleEditTutorial(tutorial)}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Courses */}
                    {latestCourses.map((course, index) => (
                      <tr
                        key={`course-${course._id || index}`}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                            Course
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900">
                          {course.title}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {course.language?.toUpperCase() || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {course.instructor?.name || "Unknown"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700">
                            Published
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(course.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-purple-500 hover:text-purple-600 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorialModal && (
          <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? "Edit Tutorial" : "Create New Tutorial"}
                </h2>
                <button
                  onClick={() => {
                    setShowTutorialModal(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Tutorial form will be implemented here. For now, please use
                  the Tutorials management page.
                </p>
                <button
                  onClick={() => {
                    setShowTutorialModal(false);
                    onNavigate?.(
                      "tutorials",
                      editingItem ? { editTutorial: editingItem } : {}
                    );
                  }}
                  className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Go to Tutorials Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? "Edit Course" : "Create New Course"}
                </h2>
                <button
                  onClick={() => {
                    setShowCourseModal(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Course form will be implemented here. For now, please use the
                  Courses management page.
                </p>
                <button
                  onClick={() => {
                    setShowCourseModal(false);
                    onNavigate?.(
                      "courses",
                      editingItem ? { editCourse: editingItem } : {}
                    );
                  }}
                  className="w-full py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Go to Courses Page
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

