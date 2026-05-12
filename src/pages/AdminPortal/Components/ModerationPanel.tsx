import { useState, useEffect } from "react";
import { AlertTriangle, Eye, EyeOff, Lock, Unlock, Trash2, RefreshCw, MessageSquare, Flag } from "lucide-react";
import discussionAPI from "../../../services/discussionAPI";

interface ReportItem {
  type: "discussion" | "comment";
  discussionId: string;
  discussionTitle: string;
  commentId?: string;
  content: string;
  author: { _id: string; username: string };
  report: { _id: string; reporter: { username: string }; reason: string; description?: string; createdAt: string };
  isHidden: boolean;
}

interface ForumStats {
  totalDiscussions: number;
  openQuestions: number;
  answeredQuestions: number;
  pendingReports: number;
}

export default function ModerationPanel() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [confirmItem, setConfirmItem] = useState<ReportItem | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        discussionAPI.getReportedContent(page, LIMIT),
        discussionAPI.getForumStats(),
      ]);
      setReports(reportsRes.data?.reports || []);
      setTotal(reportsRes.data?.total || 0);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error("Failed to load moderation data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async (item: ReportItem, action: "hide" | "unhide") => {
    const key = item.commentId ? `${item.discussionId}-${item.commentId}` : item.discussionId;
    setActionLoading(key + action);
    try {
      await discussionAPI.moderateContent(
        item.discussionId,
        action,
        action === "hide" ? hideReason || undefined : undefined,
        item.commentId
      );
      setConfirmItem(null);
      setHideReason("");
      await fetchData();
    } catch (err) {
      console.error("Moderation action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (item: ReportItem) => {
    const key = `dismiss-${item.report._id}`;
    setActionLoading(key);
    try {
      await discussionAPI.dismissReport(item.discussionId, item.report._id, item.commentId);
      await fetchData();
    } catch (err) {
      console.error("Dismiss failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLock = async (discussionId: string, lock: boolean) => {
    setActionLoading(`lock-${discussionId}`);
    try {
      await discussionAPI.lockDiscussion(discussionId, lock);
      await fetchData();
    } catch (err) {
      console.error("Lock action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const reasonColor: Record<string, string> = {
    spam: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    inappropriate: "bg-red-500/20 text-red-400 border-red-500/30",
    harassment: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "off-topic": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Discussion Moderation</h2>
          <p className="text-gray-400 text-sm mt-1">Review and act on reported content</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] text-gray-300 rounded-lg hover:bg-[#2a3050] transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Discussions", value: stats.totalDiscussions, icon: MessageSquare, color: "text-blue-400" },
            { label: "Open Questions", value: stats.openQuestions, icon: MessageSquare, color: "text-green-400" },
            { label: "Answered", value: stats.answeredQuestions, icon: MessageSquare, color: "text-purple-400" },
            { label: "Pending Reports", value: stats.pendingReports, icon: Flag, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1230] border border-[#1a1f3e] rounded-xl p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-[#0d1230] border border-[#1a1f3e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1a1f3e] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h3 className="text-white font-semibold">Reported Content</h3>
          <span className="ml-auto text-xs text-gray-500">{total} report{total !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reported content found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1f3e]">
            {reports.map((item, idx) => {
              const itemKey = item.commentId
                ? `${item.discussionId}-${item.commentId}`
                : item.discussionId;
              return (
                <div key={`${itemKey}-${idx}`} className={`p-5 ${item.isHidden ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: content info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded border ${item.type === "comment" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}>
                          {item.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${reasonColor[item.report.reason] || reasonColor.other}`}>
                          {item.report.reason}
                        </span>
                        {item.isHidden && (
                          <span className="text-xs px-2 py-0.5 rounded border bg-gray-500/20 text-gray-400 border-gray-500/30">
                            hidden
                          </span>
                        )}
                      </div>

                      <p className="text-white text-sm font-medium truncate">{item.discussionTitle}</p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.content}</p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>By <span className="text-gray-300">{item.author?.username || "unknown"}</span></span>
                        <span>Reported by <span className="text-gray-300">{item.report.reporter?.username || "unknown"}</span></span>
                        <span>{new Date(item.report.createdAt).toLocaleDateString()}</span>
                      </div>
                      {item.report.description && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{item.report.description}"</p>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Hide / Unhide */}
                      {item.isHidden ? (
                        <button
                          onClick={() => handleHide(item, "unhide")}
                          disabled={actionLoading === itemKey + "unhide"}
                          title="Unhide"
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmItem(item)}
                          title="Hide"
                          className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}

                      {/* Lock (discussions only) */}
                      {item.type === "discussion" && (
                        <button
                          onClick={() => handleLock(item.discussionId, true)}
                          disabled={actionLoading === `lock-${item.discussionId}`}
                          title="Lock discussion"
                          className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}

                      {/* Dismiss report */}
                      <button
                        onClick={() => handleDismiss(item)}
                        disabled={actionLoading === `dismiss-${item.report._id}`}
                        title="Dismiss report"
                        className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/20 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#1a1f3e] flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-40 bg-[#1a1f3e] rounded-lg border border-[#2a3050] transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-40 bg-[#1a1f3e] rounded-lg border border-[#2a3050] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Hide confirmation modal */}
      {confirmItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Hide Content</h3>
            <p className="text-gray-400 text-sm mb-4">
              This will hide the {confirmItem.type} from all users. You can unhide it later.
            </p>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="Reason for hiding (optional)"
              rows={3}
              className="w-full bg-[#1a1f3e] border border-[#2a3050] text-gray-200 placeholder-gray-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmItem(null); setHideReason(""); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#1a1f3e] rounded-lg border border-[#2a3050] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHide(confirmItem, "hide")}
                disabled={!!actionLoading}
                className="px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Hide Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
