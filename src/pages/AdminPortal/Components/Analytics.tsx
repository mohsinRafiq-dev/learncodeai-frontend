import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";

interface AnalyticsProps {
  onError?: (msg: string) => void;
}

interface AnalyticsData {
  rangeDays: number;
  totals: {
    totalUsers: number;
    activeUsers: number;
    newSignups: number;
    totalCourses: number;
    totalTutorials: number;
    publishedTutorials: number;
    totalChats: number;
    totalEnrollments: number;
    totalCertificates: number;
    totalErrors: number;
    totalEngagementMinutes: number;
  };
  userTrend: { _id: string; count: number }[];
  languageStats: { _id: string; count: number }[];
  errors: {
    byType: { _id: string; count: number }[];
    byLanguage: { _id: string; count: number }[];
    trend: { _id: string; count: number }[];
  };
  chatCategories: { _id: string; count: number }[];
  topCourses: {
    _id: string;
    name: string;
    category: string;
    views: number;
    completion: number;
    avgTime: number;
  }[];
}

const RANGE_OPTIONS = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 90 Days", value: 90 },
  { label: "Last Year", value: 365 },
];

const CATEGORY_COLORS = ["#a855f7", "#22c55e", "#f97316", "#3b82f6", "#ec4899", "#14b8a6"];

function formatMinutes(min: number) {
  if (!min) return "0 min";
  if (min < 60) return `${Math.round(min)} min`;
  const hrs = Math.floor(min / 60);
  const rem = Math.round(min % 60);
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export default function AnalyticsDashboard({ onError }: AnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [days, setDays] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminAPI
      .getAnalytics(days)
      .then((res: { success: boolean; data: AnalyticsData }) => {
        if (cancelled) return;
        if (res?.success) setData(res.data);
        else onError?.("Failed to load analytics");
      })
      .catch((err: Error) => {
        if (!cancelled) onError?.(err.message || "Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, onError]);

  const filteredCourses = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return data.topCourses;
    return data.topCourses.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  const userTrendPath = useMemo(() => {
    if (!data?.userTrend?.length) return { line: "", area: "" };
    const counts = data.userTrend.map((d) => d.count);
    const max = Math.max(...counts, 1);
    const w = 400;
    const h = 200;
    const step = counts.length > 1 ? w / (counts.length - 1) : w;
    const points = counts.map((c, i) => {
      const x = i * step;
      const y = h - (c / max) * (h - 20) - 10;
      return [x, y] as [number, number];
    });
    const line = points.map((p, i) => `${i ? "L" : "M"} ${p[0]},${p[1]}`).join(" ");
    const area = `${line} L ${w},${h} L 0,${h} Z`;
    return { line, area };
  }, [data]);

  const handleExportCsv = () => {
    if (!data) return;
    const rows: string[][] = [];
    rows.push(["Metric", "Value"]);
    Object.entries(data.totals).forEach(([k, v]) => rows.push([k, String(v)]));
    rows.push([]);
    rows.push(["Date", "New Signups"]);
    data.userTrend.forEach((r) => rows.push([r._id, String(r.count)]));
    rows.push([]);
    rows.push(["Error Type", "Count"]);
    data.errors.byType.forEach((r) =>
      rows.push([r._id || "unknown", String(r.count)])
    );
    rows.push([]);
    rows.push(["Top Course", "Category", "Enrollments", "Avg Completion %", "Avg Time (min)"]);
    data.topCourses.forEach((c) =>
      rows.push([c.name, c.category, String(c.views), String(c.completion), String(c.avgTime)])
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = data
    ? [
        {
          label: "Total Users",
          value: data.totals.totalUsers.toLocaleString(),
          sub: `${data.totals.activeUsers} active`,
        },
        {
          label: "New Signups",
          value: data.totals.newSignups.toLocaleString(),
          sub: `last ${data.rangeDays} days`,
        },
        {
          label: "Tutorials Published",
          value: data.totals.publishedTutorials.toLocaleString(),
          sub: `${data.totals.totalTutorials} total`,
        },
        {
          label: "AI Chatbot Queries",
          value: data.totals.totalChats.toLocaleString(),
          sub: `last ${data.rangeDays} days`,
        },
        {
          label: "Code Errors",
          value: data.totals.totalErrors.toLocaleString(),
          sub: `last ${data.rangeDays} days`,
        },
        {
          label: "Engagement Time",
          value: formatMinutes(data.totals.totalEngagementMinutes),
          sub: `${data.totals.totalEnrollments} enrollments`,
        },
      ]
    : [];

  const totalChatCategoryCount =
    data?.chatCategories.reduce((a, c) => a + c.count, 0) || 0;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0e27] p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                Admin Panel / Analytics
              </div>
              <h1 className="text-3xl font-bold text-gray-100">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setRangeOpen((o) => !o)}
                className="px-4 py-2 bg-[#0d1230] border border-[#2a3050] rounded-md text-sm font-medium text-gray-200 hover:bg-[#1a1f3e] flex items-center gap-2"
              >
                {RANGE_OPTIONS.find((r) => r.value === days)?.label || "Custom"}
                <ChevronDown className="w-4 h-4" />
              </button>
              {rangeOpen && (
                <div className="absolute top-full mt-2 right-28 bg-[#0d1230] border border-[#2a3050] rounded-md shadow-lg z-10 min-w-[160px]">
                  {RANGE_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setDays(r.value);
                        setRangeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1a1f3e] ${
                        days === r.value
                          ? "text-purple-400"
                          : "text-gray-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleExportCsv}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Export to CSV
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Overview of site performance and user engagement.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6">
            <div className="mb-2">
              <h3 className="text-white font-semibold text-base">
                User Growth
              </h3>
              <p className="text-gray-400 text-xs">
                New signups in the last {data?.rangeDays || days} days.
              </p>
            </div>
            <div className="relative h-64 mt-6">
              {data?.userTrend?.length ? (
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={userTrendPath.area} fill="url(#areaGradient)" />
                  <path d={userTrendPath.line} fill="none" stroke="#a855f7" strokeWidth={2} />
                </svg>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  No signup data for this range.
                </div>
              )}
            </div>
          </div>

          {/* Chatbot Query Categories */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6">
            <div className="mb-2">
              <h3 className="text-white font-semibold text-base">
                Chatbot Query Categories
              </h3>
              <p className="text-gray-400 text-xs">
                Breakdown of user query types.
              </p>
            </div>
            <div className="flex items-center justify-center h-64 relative">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {totalChatCategoryCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Total Queries</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {data?.chatCategories.length ? (
                data.chatCategories.map((cat, idx) => (
                  <div key={cat._id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    ></div>
                    <span className="text-xs text-gray-400">
                      {cat._id} ({cat.count})
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">No chat data.</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Frequency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6">
            <h3 className="text-white font-semibold text-base mb-1">
              Errors by Type
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Frequency of code execution errors.
            </p>
            {data?.errors.byType.length ? (
              <div className="space-y-3">
                {data.errors.byType.map((e, idx) => {
                  const max = Math.max(...data.errors.byType.map((x) => x.count));
                  const pct = (e.count / max) * 100;
                  return (
                    <div key={e._id || idx}>
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span className="capitalize">{e._id || "unknown"}</span>
                        <span>{e.count}</span>
                      </div>
                      <div className="w-full bg-[#1a1f3e] rounded h-2">
                        <div
                          className="h-2 rounded"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No errors recorded.</div>
            )}
          </div>

          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6">
            <h3 className="text-white font-semibold text-base mb-1">
              Errors by Language
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Where learners hit issues most.
            </p>
            {data?.errors.byLanguage.length ? (
              <div className="space-y-3">
                {data.errors.byLanguage.map((e, idx) => {
                  const max = Math.max(...data.errors.byLanguage.map((x) => x.count));
                  const pct = (e.count / max) * 100;
                  return (
                    <div key={e._id || idx}>
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span className="capitalize">{e._id || "unknown"}</span>
                        <span>{e.count}</span>
                      </div>
                      <div className="w-full bg-[#1a1f3e] rounded h-2">
                        <div
                          className="h-2 rounded"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No errors recorded.</div>
            )}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-base">
                Top Performing Courses
              </h3>
              <p className="text-gray-400 text-xs">
                Detailed view of course engagement metrics.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3050]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Course Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Enrollments
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Completion Rate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length ? (
                  filteredCourses.map((course) => (
                    <tr
                      key={course._id}
                      className="border-b border-[#2a3050] hover:bg-[#1a1f3e]"
                    >
                      <td className="px-4 py-4 text-sm text-white">
                        {course.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 capitalize">
                        {course.category}
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {course.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-white">
                        {course.completion}%
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {formatMinutes(course.avgTime)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No course data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
