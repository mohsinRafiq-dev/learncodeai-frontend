import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import progressAPI from "../../services/progressAPI";
import RecommendationsWidget from "../../components/RecommendationsWidget/RecommendationsWidget";
import {
  BarChart3, Clock, BookOpen, Trophy, Award, Flame, Target,
  TrendingUp, TrendingDown, Download, RefreshCw,
  CheckCircle, AlertTriangle, Zap, FileText, Code
} from "lucide-react";

const ProgressDashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "analytics" | "export">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/signin"); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, analyticsRes] = await Promise.all([
        progressAPI.getDashboard(),
        progressAPI.getPerformanceAnalytics(),
      ]);
      setDashboard(dashRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await progressAPI.exportReportCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `progress_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const res = await progressAPI.exportReportJSON();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `progress_report_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export JSON. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "Course Progress", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: Target },
    { id: "export", label: "Export Reports", icon: Download },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto" />
          <p className="text-cyan-200 mt-4">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  const o = dashboard?.overview || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Progress Dashboard</h1>
              <p className="text-cyan-200 text-sm">Track your learning journey, analyze performance, and export reports</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className="mb-8">
          <RecommendationsWidget />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                    : "bg-indigo-900/30 text-indigo-200 hover:bg-indigo-900/50 border border-indigo-500/30"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && dashboard && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<BookOpen className="w-5 h-5" />} label="Lessons Completed" value={`${o.totalLessonsCompleted}/${o.totalLessons}`} sub={`${o.lessonsCompletionPercent}% complete`} color="from-cyan-500/20 to-blue-500/20 border-cyan-500/30" />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Time Spent" value={formatTime(o.totalTimeSpentMinutes || 0)} sub="total practice time" color="from-purple-500/20 to-pink-500/20 border-purple-500/30" />
              <StatCard icon={<Trophy className="w-5 h-5" />} label="Courses" value={`${o.completedCourses}/${o.totalCoursesEnrolled}`} sub={`${o.activeCourses} active`} color="from-yellow-500/20 to-orange-500/20 border-yellow-500/30" />
              <StatCard icon={<Code className="w-5 h-5" />} label="Code Executions" value={o.codeExecutions} sub={`${o.quizzesCompleted} quizzes done`} color="from-green-500/20 to-emerald-500/20 border-green-500/30" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Zap className="w-5 h-5" />} label="Tutorials" value={`${o.completedTutorials}/${o.totalTutorials}`} sub="completed" color="from-amber-500/20 to-yellow-500/20 border-amber-500/30" />
              <StatCard icon={<Award className="w-5 h-5" />} label="Certificates" value={o.certificatesEarned} sub="earned" color="from-blue-500/20 to-indigo-500/20 border-blue-500/30" />
              <StatCard icon={<Flame className="w-5 h-5" />} label="Current Streak" value={`${dashboard.streak?.currentStreak || 0}d`} sub={`Best: ${dashboard.streak?.longestStreak || 0}d`} color="from-red-500/20 to-orange-500/20 border-red-500/30" />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Level" value={dashboard.gamification?.level || 1} sub={`${dashboard.gamification?.totalPoints || 0} pts`} color="from-indigo-500/20 to-purple-500/20 border-indigo-500/30" />
            </div>

            {/* Time Spent Breakdown */}
            <div className="bg-indigo-900/30 backdrop-blur-xl rounded-lg p-6 border border-indigo-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> Time Spent Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboard.courseProgress?.slice(0, 6).map((cp: any, i: number) => (
                  <div key={i} className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-100 text-sm font-medium truncate flex-1">{cp.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-700/50 text-indigo-200 ml-2">{cp.language}</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{formatTime(cp.timeSpentMinutes || 0)}</div>
                    <div className="w-full bg-indigo-950/50 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all" style={{ width: `${cp.overallProgress || 0}%` }} />
                    </div>
                    <div className="text-xs text-indigo-400 mt-1">{cp.overallProgress || 0}% complete</div>
                  </div>
                ))}
              </div>
              {(!dashboard.courseProgress || dashboard.courseProgress.length === 0) && (
                <p className="text-indigo-400 text-center py-4">No course data yet. Enroll in courses to track time!</p>
              )}
            </div>
          </div>
        )}

        {/* Course Progress Tab */}
        {activeTab === "courses" && dashboard && (
          <div className="space-y-4">
            {dashboard.courseProgress?.length > 0 ? (
              dashboard.courseProgress.map((cp: any, i: number) => (
                <div key={i} className="bg-indigo-900/30 backdrop-blur-xl rounded-lg p-6 border border-indigo-500/30 hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{cp.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300">{cp.language}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">{cp.difficulty}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${cp.status === 'completed' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{cp.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">{cp.overallProgress}%</div>
                      <div className="text-xs text-indigo-400">{cp.completedLessons}/{cp.totalLessons} lessons</div>
                    </div>
                  </div>
                  <div className="w-full bg-indigo-950/50 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500" style={{ width: `${cp.overallProgress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-indigo-400">
                    <span>Time: {formatTime(cp.timeSpentMinutes || 0)}</span>
                    <span>Last accessed: {cp.lastAccessedAt ? new Date(cp.lastAccessedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <p className="text-indigo-200 text-lg">No courses enrolled yet</p>
                <button onClick={() => navigate('/courses')} className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Browse Courses</button>
              </div>
            )}

            {/* Tutorial Progress */}
            {dashboard.tutorialProgress?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Tutorial Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.tutorialProgress.slice(0, 10).map((tp: any, i: number) => (
                    <div key={i} className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-100 text-sm font-medium truncate flex-1">{tp.title || 'Tutorial'}</span>
                        <span className="text-amber-400 font-bold ml-2">{tp.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-amber-950/50 rounded-full h-2 mt-2">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full" style={{ width: `${tp.completionPercent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* Overall Performance */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg p-6 border border-indigo-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">Overall Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{analytics.overallStats?.averageScore || 0}%</div>
                  <div className="text-xs text-indigo-300">Avg Quiz Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{analytics.overallStats?.passRate || 0}%</div>
                  <div className="text-xs text-indigo-300">Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{analytics.overallStats?.totalQuizzes || 0}</div>
                  <div className="text-xs text-indigo-300">Total Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">Lv.{analytics.overallStats?.level || 1}</div>
                  <div className="text-xs text-indigo-300">{analytics.overallStats?.totalPoints || 0} pts</div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-900/20 backdrop-blur-xl rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" /> Strengths
              </h3>
              {analytics.strengths?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.strengths.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-green-900/20 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <span className="text-green-100 font-medium capitalize">{s.language}</span>
                          <div className="text-xs text-green-300">{s.coursesCompleted}/{s.coursesEnrolled} courses • {s.lessonsCompleted} lessons</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{s.averageQuizScore !== null ? `${s.averageQuizScore}%` : 'N/A'}</div>
                        <div className="text-xs text-green-300">avg score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-300 text-center py-4">Complete quizzes to identify your strengths!</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-red-900/20 backdrop-blur-xl rounded-lg p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" /> Areas for Improvement
              </h3>
              {analytics.weaknesses?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.weaknesses.map((w: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-red-900/20 rounded-lg p-3 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <div>
                          <span className="text-red-100 font-medium capitalize">{w.language}</span>
                          <div className="text-xs text-red-300">{w.coursesCompleted}/{w.coursesEnrolled} courses • {w.totalQuizzes} quizzes</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-400">{w.averageQuizScore !== null ? `${w.averageQuizScore}%` : 'N/A'}</div>
                        <div className="text-xs text-red-300">avg score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-300 text-center py-4">No weaknesses identified — keep learning!</p>
              )}
            </div>

            {/* Language Performance */}
            {analytics.languagePerformance?.length > 0 && (
              <div className="bg-indigo-900/30 backdrop-blur-xl rounded-lg p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" /> Performance by Language
                </h3>
                <div className="space-y-3">
                  {analytics.languagePerformance.map((lp: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-indigo-200 w-24 capitalize font-medium">{lp.language}</span>
                      <div className="flex-1">
                        <div className="w-full bg-indigo-950/50 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${(lp.averageScore || 0) >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                            style={{ width: `${lp.averageScore || 0}%` }} />
                        </div>
                      </div>
                      <span className="text-indigo-300 font-semibold w-16 text-right">{lp.averageScore || 0}%</span>
                      <span className="text-indigo-400 text-xs w-20">{lp.totalQuizzes} quizzes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="space-y-6">
            <div className="bg-indigo-900/30 backdrop-blur-xl rounded-lg p-8 border border-indigo-500/30">
              <h3 className="text-2xl font-semibold text-white mb-2">Export Progress Reports</h3>
              <p className="text-indigo-200 mb-8">Download your complete learning progress data in your preferred format.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSV Export */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">CSV Report</h4>
                      <p className="text-sm text-green-300">Spreadsheet compatible</p>
                    </div>
                  </div>
                  <p className="text-green-200 text-sm mb-4">Export as CSV for use in Excel, Google Sheets, or any spreadsheet application. Includes courses, tutorials, certificates, and points data.</p>
                  <button onClick={handleExportCSV} disabled={exporting}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    {exporting ? "Exporting..." : "Download CSV"}
                  </button>
                </div>

                {/* JSON Export */}
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-6 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Code className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">JSON Report</h4>
                      <p className="text-sm text-blue-300">Developer friendly</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm mb-4">Export as JSON for programmatic use, data analysis tools, or personal records. Contains the full structured progress data.</p>
                  <button onClick={handleExportJSON} disabled={exporting}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    {exporting ? "Exporting..." : "Download JSON"}
                  </button>
                </div>
              </div>

              {/* Report Contents */}
              <div className="mt-8 bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/20">
                <h4 className="text-sm font-semibold text-indigo-200 mb-3">Report includes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-indigo-300">
                  {["Course progress & completion", "Tutorial completion data", "Quiz scores & pass rates", "Time spent per course",
                    "Certificates earned", "Points breakdown", "Streak history", "Overall statistics"].map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; sub: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className={`bg-gradient-to-br ${color} backdrop-blur-xl rounded-lg p-4 border`}>
    <div className="text-cyan-400 mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-indigo-300">{label}</div>
    <div className="text-xs text-indigo-400 mt-1">{sub}</div>
  </div>
);

export default ProgressDashboardPage;
