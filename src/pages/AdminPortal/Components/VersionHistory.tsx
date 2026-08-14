// Content Version History — list previous snapshots of any tutorial / course
// / lesson and restore one with a click. Backed by ContentVersion docs that
// adminController + courseAdminController write on every update.

import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  RotateCcw,
  ChevronDown,
  History,
  Search,
  ArrowRight,
} from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";
import { adminCourseAPI } from "../../../services/adminCourseAPI";

type ContentType = "tutorial" | "course" | "lesson";

interface Version {
  _id: string;
  contentType: ContentType;
  contentId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changedBy?: { _id?: string; name?: string; email?: string } | string | null;
  changeNote?: string;
  createdAt: string;
}

interface ContentItem {
  _id: string;
  title: string;
  language?: string;
  difficulty?: string;
  updatedAt?: string;
}

const VersionHistory: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>("tutorial");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [restoring, setRestoring] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // Load list of content items of the chosen type. Reuses existing admin
  // endpoints (we don't need a new "list lessons" endpoint because lessons
  // appear nested in courses — for FYP scope, only tutorials + courses are
  // browsable here. Lessons can still have versions; they're shown via the
  // tutorial list if pasted as a contentId.)
  const loadItems = async (type: ContentType) => {
    try {
      setLoadingItems(true);
      if (type === "tutorial") {
        // getAllTutorials takes positional args (page, limit, language,
        // search) — passing an object sent page=[object Object].
        const res = await adminAPI.getAllTutorials(1, 200);
        setItems(
          (res?.data || res?.tutorials || []).map((t: any) => ({
            _id: t._id,
            title: t.title,
            language: t.language,
            difficulty: t.difficulty,
            updatedAt: t.updatedAt,
          }))
        );
      } else if (type === "course") {
        // Courses live on adminCourseAPI; adminAPI has no getAllCourses, so
        // this threw a TypeError as soon as the course tab was opened.
        const res = await adminCourseAPI.getAllCourses({ limit: 200 });
        setItems(
          (res?.data || res?.courses || []).map((c: any) => ({
            _id: c._id,
            title: c.title,
            language: c.language,
            difficulty: c.difficulty,
            updatedAt: c.updatedAt,
          }))
        );
      } else {
        // Lessons — fall back to empty; admins can paste a lesson id directly.
        setItems([]);
      }
    } catch (err) {
      console.error("load content failed", err);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadItems(contentType);
    setSelectedId(null);
    setVersions([]);
  }, [contentType]);

  const loadVersions = async (id: string) => {
    setSelectedId(id);
    setVersions([]);
    setLoadingVersions(true);
    try {
      const res = await adminAPI.listVersions(contentType, id);
      if (res?.success) setVersions(res.data || []);
    } catch (err) {
      console.error("load versions failed", err);
      setToast({ type: "err", text: "Failed to load version history." });
    } finally {
      setLoadingVersions(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i._id.toLowerCase().includes(q)
    );
  }, [items, search]);

  const restore = async (v: Version) => {
    if (
      !window.confirm(
        `Restore version ${v.versionNumber}? The current content will be snapshotted as a new version first, so nothing is permanently lost.`
      )
    )
      return;
    setRestoring(v._id);
    setToast(null);
    try {
      const res = await adminAPI.restoreVersion(v._id);
      if (res?.success) {
        setToast({
          type: "ok",
          text: `Restored to version ${v.versionNumber}.`,
        });
        if (selectedId) loadVersions(selectedId);
      } else {
        setToast({ type: "err", text: res?.message || "Restore failed" });
      }
    } catch (err: any) {
      setToast({
        type: "err",
        text: err?.response?.data?.message || err.message || "Restore failed",
      });
    } finally {
      setRestoring(null);
    }
  };

  const previewKeys = (snap: Record<string, unknown>) => {
    const interesting = ["title", "description", "content", "difficulty", "language"];
    return interesting.filter((k) => snap[k] !== undefined);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              Admin Panel / Version History
            </div>
            <h1 className="text-3xl font-bold text-gray-100">
              Content Version History
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Every tutorial / course / lesson update is auto-snapshotted. Restore
              any previous version with a click.
            </p>
          </div>
          <div className="flex gap-2">
            {(["tutorial", "course", "lesson"] as ContentType[]).map((t) => (
              <button
                key={t}
                onClick={() => setContentType(t)}
                className={`px-4 py-2 text-sm rounded-md font-medium capitalize ${
                  contentType === t
                    ? "bg-purple-600 text-white"
                    : "bg-[#0d1230] border border-[#2a3050] text-gray-300 hover:bg-[#1a1f3e]"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — content picker */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${contentType}s by title or ID…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {contentType === "lesson" && (
              <div className="text-xs text-gray-500 mb-3">
                Tip: lessons live inside courses — paste a lesson ID below or
                edit a lesson from its course to generate a version.
              </div>
            )}

            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-8">
                    No {contentType}s found.
                  </div>
                ) : (
                  filtered.map((it) => {
                    const active = selectedId === it._id;
                    return (
                      <button
                        key={it._id}
                        onClick={() => loadVersions(it._id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          active
                            ? "bg-purple-900/30 text-purple-300 border border-purple-500/40"
                            : "text-gray-300 hover:bg-[#1a1f3e] border border-transparent"
                        }`}
                      >
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                          {it.language && <span>{it.language}</span>}
                          {it.difficulty && <span>· {it.difficulty}</span>}
                          {it.updatedAt && (
                            <span>· upd {new Date(it.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* RIGHT — version list */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-4">
            {!selectedId ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                <History className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                Pick a {contentType} on the left to view its version history.
              </div>
            ) : loadingVersions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                <History className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                No prior versions yet. Each update from now on will be snapshotted
                automatically.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {versions.map((v) => {
                  const isOpen = expanded[v._id];
                  const author =
                    typeof v.changedBy === "object" && v.changedBy
                      ? v.changedBy.name || v.changedBy.email || "Admin"
                      : "Admin";
                  return (
                    <div
                      key={v._id}
                      className="border border-[#2a3050] rounded-lg bg-[#1a1f3e]"
                    >
                      <button
                        onClick={() =>
                          setExpanded({ ...expanded, [v._id]: !isOpen })
                        }
                        className="w-full flex items-center justify-between px-4 py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium text-white text-sm">
                            v{v.versionNumber}
                            <span className="ml-2 text-xs text-gray-400">
                              {new Date(v.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            by {author}
                            {v.changeNote ? ` — ${v.changeNote}` : ""}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-[#2a3050] pt-3 space-y-2">
                          {previewKeys(v.snapshot).map((k) => {
                            const raw = v.snapshot[k];
                            const str =
                              typeof raw === "string"
                                ? raw.slice(0, 220)
                                : JSON.stringify(raw).slice(0, 220);
                            return (
                              <div key={k} className="text-xs">
                                <span className="text-gray-400 font-medium">
                                  {k}:
                                </span>{" "}
                                <span className="text-gray-200 whitespace-pre-wrap break-words">
                                  {str}
                                  {str.length >= 220 && "…"}
                                </span>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => restore(v)}
                            disabled={restoring === v._id}
                            className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs rounded-md inline-flex items-center gap-1.5"
                          >
                            {restoring === v._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            Restore this version
                            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
