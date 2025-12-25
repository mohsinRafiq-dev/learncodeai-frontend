import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export default function AnalyticsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data
  const stats = [
    { label: "Total Users", value: "12,450", change: "+5.2%", positive: true },
    { label: "Active Users", value: "3,120", change: "+2.1%", positive: true },
    {
      label: "Tutorials Published",
      value: "256",
      change: "+1.5%",
      positive: true,
    },
    {
      label: "AI Chatbot Queries",
      value: "8,981",
      change: "+8.5%",
      positive: true,
    },
  ];

  const courses = [
    {
      name: "Intro to Python",
      category: "Python",
      views: 45102,
      completion: 85,
      avgTime: "25 min",
    },
    {
      name: "JavaScript Promises",
      category: "JavaScript",
      views: 36541,
      completion: 72,
      avgTime: "18 min",
    },
    {
      name: "CSS Grid Layout",
      category: "CSS",
      views: 35889,
      completion: 91,
      avgTime: "15 min",
    },
    {
      name: "React State Management",
      category: "React",
      views: 31220,
      completion: 68,
      avgTime: "35 min",
    },
    {
      name: "Understanding SQL Joins",
      category: "Databases",
      views: 28991,
      completion: 82,
      avgTime: "22 min",
    },
  ];

  const chatCategories = [
    { name: "Python Help", color: "#a855f7", value: 3200 },
    { name: "JS Bugs", color: "#22c55e", value: 2800 },
    { name: "Conceptual", color: "#f97316", value: 2981 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                Admin Panel / Analytics
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                Last 30 Days
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                Export to CSV
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Overview of site performance and user engagement.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6">
              <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div
                className={`text-sm font-semibold ${
                  stat.positive ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-2">
              <h3 className="text-white font-semibold text-base">
                User Growth
              </h3>
              <p className="text-gray-400 text-xs">
                New signups over the last 30 days.
              </p>
            </div>
            <div className="relative h-64 mt-6">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 0.4 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 0 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,120 Q 50,80 100,100 T 200,90 T 300,40 T 400,80 L 400,200 L 0,200 Z"
                  fill="url(#areaGradient)"
                />
                {/* Line */}
                <path
                  d="M 0,120 Q 50,80 100,100 T 200,90 T 300,40 T 400,80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          {/* Chatbot Query Categories */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-2">
              <h3 className="text-white font-semibold text-base">
                Chatbot Query Categories
              </h3>
              <p className="text-gray-400 text-xs">
                Breakdown of user query types.
              </p>
            </div>
            <div className="flex items-center justify-center h-64 relative">
              {/* Center circle with total */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white">8,981</div>
                <div className="text-xs text-gray-400">Total Queries</div>
              </div>

              {/* Decorative dots around */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {chatCategories.map((cat, idx) => {
                    const angle = (idx * 360) / chatCategories.length;
                    const radius = 80;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    return (
                      <div
                        key={idx}
                        className="absolute w-3 h-3 rounded-sm transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          backgroundColor: cat.color,
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              {chatCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-xs text-gray-400">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-gray-900 rounded-lg p-6">
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
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Course Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Views
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
                {courses.map((course, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="px-4 py-4 text-sm text-white">
                      {course.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      {course.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-white">
                      {course.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-white">
                      {course.completion}%
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      {course.avgTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

