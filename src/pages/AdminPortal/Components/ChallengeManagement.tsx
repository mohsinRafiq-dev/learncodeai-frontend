// Coding Challenges admin panel — CRUD over DailyChallenge documents.
// Maps to the FYP requirement "Manage coding exercises / challenges".

import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Search,
  CalendarDays,
  X,
  Save,
} from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";

interface Challenge {
  _id?: string;
  date: string;
  title: string;
  description: string;
  language: "python" | "javascript" | "cpp";
  difficulty: "beginner" | "intermediate" | "advanced";
  starterCode?: string;
  solution?: string;
  testCases?: { input: string; expectedOutput: string }[];
  points?: number;
  bonusPointsForStreak?: number;
  createdAt?: string;
}

const emptyChallenge = (): Challenge => ({
  date: new Date().toISOString().slice(0, 10),
  title: "",
  description: "",
  language: "python",
  difficulty: "beginner",
  starterCode: "",
  solution: "",
  testCases: [{ input: "", expectedOutput: "" }],
  points: 50,
  bonusPointsForStreak: 25,
});

const langColor: Record<string, string> = {
  python: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  javascript: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  cpp: "bg-purple-500/20 text-purple-300 border-purple-500/40",
};
const diffColor: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  intermediate: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  advanced: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

const ChallengeManagement: React.FC = () => {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [filterDiff, setFilterDiff] = useState("");
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listChallenges({});
      if (res.success) setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: "err", text: "Failed to load challenges" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (filterLang && c.language !== filterLang) return false;
      if (filterDiff && c.difficulty !== filterDiff) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.date.includes(q)
      );
    });
  }, [items, search, filterLang, filterDiff]);

  const startCreate = () => setEditing(emptyChallenge());
  const startEdit = (c: Challenge) => setEditing({ ...c });

  const save = async () => {
    if (!editing) return;
    if (!editing.date || !editing.title || !editing.description) {
      setToast({
        type: "err",
        text: "Date, title, and description are required.",
      });
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      if (editing._id) {
        const res = await adminAPI.updateChallenge(editing._id, editing as any);
        if (res.success) {
          setToast({ type: "ok", text: "Challenge updated." });
          setEditing(null);
          load();
        }
      } else {
        const res = await adminAPI.createChallenge(editing as any);
        if (res.success) {
          setToast({ type: "ok", text: "Challenge created." });
          setEditing(null);
          load();
        }
      }
    } catch (err: any) {
      setToast({
        type: "err",
        text: err?.response?.data?.message || err.message || "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Challenge) => {
    if (!c._id) return;
    if (
      !window.confirm(
        `Delete challenge "${c.title}" (${c.date})? This cannot be undone.`
      )
    )
      return;
    try {
      const res = await adminAPI.deleteChallenge(c._id);
      if (res.success) {
        setToast({ type: "ok", text: "Challenge deleted." });
        load();
      }
    } catch (err: any) {
      setToast({
        type: "err",
        text: err?.response?.data?.message || "Delete failed",
      });
    }
  };

  const updateTestCase = (i: number, field: "input" | "expectedOutput", v: string) => {
    if (!editing) return;
    const next = [...(editing.testCases || [])];
    next[i] = { ...next[i], [field]: v };
    setEditing({ ...editing, testCases: next });
  };

  const addTestCase = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      testCases: [...(editing.testCases || []), { input: "", expectedOutput: "" }],
    });
  };

  const removeTestCase = (i: number) => {
    if (!editing) return;
    const next = (editing.testCases || []).filter((_, idx) => idx !== i);
    setEditing({ ...editing, testCases: next });
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              Admin Panel / Coding Challenges
            </div>
            <h1 className="text-3xl font-bold text-gray-100">
              Daily Coding Challenges
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Schedule one challenge per date. Each becomes the "daily challenge"
              users see on that day.
            </p>
          </div>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Challenge
          </button>
        </div>

        {toast && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              toast.type === "ok"
                ? "bg-green-900/30 text-green-400 border border-green-500/30"
                : "bg-red-900/30 text-red-400 border border-red-500/30"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title, description, or date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="px-3 py-2 text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-md"
          >
            <option value="">All languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>
          <select
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
            className="px-3 py-2 text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-md"
          >
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-12 text-center text-gray-400 text-sm">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            No challenges match your filters.{" "}
            <button
              onClick={startCreate}
              className="text-purple-400 underline hover:text-purple-300"
            >
              Create the first one
            </button>
            .
          </div>
        ) : (
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e27]">
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Tests</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-[#2a3050] hover:bg-[#1a1f3e] text-sm"
                  >
                    <td className="px-4 py-3 text-gray-300 font-mono">{c.date}</td>
                    <td className="px-4 py-3 text-white">{c.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${langColor[c.language]}`}
                      >
                        {c.language}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${diffColor[c.difficulty]}`}
                      >
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {c.testCases?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.points ?? 50}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-[#1a1f3e] rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0d1230] border-b border-[#2a3050] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editing._id ? "Edit Challenge" : "New Challenge"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={editing.date}
                    onChange={(e) =>
                      setEditing({ ...editing, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Points
                  </label>
                  <input
                    type="number"
                    value={editing.points ?? 50}
                    onChange={(e) =>
                      setEditing({ ...editing, points: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Language
                  </label>
                  <select
                    value={editing.language}
                    onChange={(e) =>
                      setEditing({ ...editing, language: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">
                    Difficulty
                  </label>
                  <select
                    value={editing.difficulty}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Description (markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Starter code
                </label>
                <textarea
                  rows={4}
                  value={editing.starterCode || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, starterCode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Solution (admin reference, not shown to users)
                </label>
                <textarea
                  rows={4}
                  value={editing.solution || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, solution: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-white text-sm font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-400">
                    Test cases
                  </label>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    + Add case
                  </button>
                </div>
                <div className="space-y-2">
                  {(editing.testCases || []).map((tc, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) =>
                          updateTestCase(i, "input", e.target.value)
                        }
                        className="col-span-5 px-3 py-1.5 bg-[#1a1f3e] border border-[#2a3050] rounded text-white text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Expected output"
                        value={tc.expectedOutput}
                        onChange={(e) =>
                          updateTestCase(i, "expectedOutput", e.target.value)
                        }
                        className="col-span-6 px-3 py-1.5 bg-[#1a1f3e] border border-[#2a3050] rounded text-white text-xs font-mono"
                      />
                      <button
                        onClick={() => removeTestCase(i)}
                        className="col-span-1 text-gray-500 hover:text-red-400"
                        title="Remove"
                      >
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0d1230] border-t border-[#2a3050] px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1a1f3e] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-sm font-medium flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editing._id ? "Save changes" : "Create challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;
