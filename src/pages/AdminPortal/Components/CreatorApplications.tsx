import { useEffect, useState, useCallback } from "react";
import {
  Loader2, ExternalLink, Check, X, Ban, RotateCcw, Mail, Calendar,
} from "lucide-react";
import {
  adminMarketplaceAPI, type CreatorApplicationRow,
} from "../../../services/adminMarketplaceAPI";
import { money } from "../../../services/creatorAPI";
import { useToast } from "../../../contexts/ToastContext";

const FILTERS = ["pending", "approved", "rejected", "suspended", "all"] as const;

export default function CreatorApplications() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<CreatorApplicationRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [loading, setLoading] = useState(true);
  const [decidingFor, setDecidingFor] = useState<CreatorApplicationRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMarketplaceAPI.listApplications(filter);
      setRows(data.applications);
      setCounts(data.counts);
    } catch {
      showToast("Couldn't load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const suspend = async (row: CreatorApplicationRow, suspend: boolean) => {
    const reason = suspend
      ? prompt("Reason for suspension (shown to the creator):")
      : undefined;
    if (suspend && !reason) return;
    try {
      await adminMarketplaceAPI.setSuspension(row._id, suspend, reason ?? undefined);
      showToast(suspend ? "Creator suspended" : "Creator reinstated", "success");
      load();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Action failed", "error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Creator applications</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Approve creators to let them publish and sell courses.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f
                ? "bg-purple-900/40 text-purple-300 border border-purple-500/40"
                : "text-gray-400 hover:bg-[#1a1f3e] border border-transparent"
            }`}
          >
            {f}
            {counts[f] != null && f !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">{counts[f]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#2c3454] py-14 text-center">
          <p className="text-gray-400">No {filter === "all" ? "" : filter} applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row._id} className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-100">
                      {row.application?.displayName}
                    </h3>
                    <StatusPill status={row.status} />
                    {row.payoutsEnabled && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-400">
                        payouts on
                      </span>
                    )}
                  </div>

                  {row.application?.headline && (
                    <p className="text-sm text-gray-400 mt-1">{row.application.headline}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {row.user?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {row.application?.submittedAt
                        ? new Date(row.application.submittedAt).toLocaleDateString()
                        : "—"}
                    </span>
                    {row.application?.payoutCountry && (
                      <span>payout: {row.application.payoutCountry}</span>
                    )}
                    <span>fee: {row.platformFeeBps / 100}%</span>
                  </div>

                  {row.application?.expertise?.length ? (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {row.application.expertise.slice(0, 6).map((e) => (
                        <span
                          key={e}
                          className="px-2 py-0.5 rounded text-xs bg-[#1a1f3e] text-gray-300"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* The main thing a reviewer actually assesses. */}
                  {row.application?.portfolioUrls?.length ? (
                    <div className="mt-2 space-y-0.5">
                      {row.application.portfolioUrls.slice(0, 4).map((u) => (
                        <a
                          key={u}
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {u}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {row.application?.bio && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                      {row.application.bio}
                    </p>
                  )}

                  {row.status === "rejected" && row.review?.reason && (
                    <p className="text-xs text-red-300/80 mt-2">
                      Rejected: {row.review.reason}
                    </p>
                  )}

                  {row.stats && row.stats.totalSales > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {row.stats.publishedCourses} published · {row.stats.totalSales} sales ·{" "}
                      {money(row.stats.netEarningsCents)} earned
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {row.status === "pending" && (
                    <button
                      onClick={() => setDecidingFor(row)}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                    >
                      Review
                    </button>
                  )}
                  {row.status === "approved" && (
                    <button
                      onClick={() => suspend(row, true)}
                      className="flex items-center gap-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/30 text-sm px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" /> Suspend
                    </button>
                  )}
                  {row.status === "suspended" && (
                    <button
                      onClick={() => suspend(row, false)}
                      className="flex items-center gap-1.5 border border-green-500/40 text-green-400 hover:bg-green-950/30 text-sm px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reinstate
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {decidingFor && (
        <DecisionModal
          row={decidingFor}
          onClose={() => setDecidingFor(null)}
          onDone={() => {
            setDecidingFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-900/30 text-amber-400",
    approved: "bg-green-900/30 text-green-400",
    rejected: "bg-red-900/30 text-red-400",
    suspended: "bg-red-900/40 text-red-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function DecisionModal({
  row, onClose, onDone,
}: { row: CreatorApplicationRow; onClose: () => void; onDone: () => void }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [feePercent, setFeePercent] = useState(String(row.platformFeeBps / 100));
  const [busy, setBusy] = useState(false);

  const decide = async (decision: "approve" | "reject") => {
    // The API enforces this too; catching it here saves a round trip and gives
    // immediate feedback.
    if (decision === "reject" && !reason.trim()) {
      showToast("A reason is required when rejecting", "error");
      return;
    }
    setBusy(true);
    try {
      await adminMarketplaceAPI.decideApplication(
        row._id,
        decision,
        reason.trim() || undefined,
        decision === "approve" ? Math.round(parseFloat(feePercent) * 100) : undefined
      );
      showToast(`Application ${decision}d`, "success");
      onDone();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Decision failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#232a45] bg-[#0b0f1d] p-6">
        <h3 className="font-semibold text-gray-100">
          Review: {row.application?.displayName}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{row.user?.email}</p>

        <div className="mt-5">
          <label className="block text-sm text-gray-300 mb-1.5">
            Platform fee (%) — applies on approval
          </label>
          <input
            type="number"
            min="5"
            max="50"
            step="1"
            value={feePercent}
            onChange={(e) => setFeePercent(e.target.value)}
            className="w-full bg-[#0f1424] border border-[#232a45] rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-purple-500/60"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default 30%. Creator keeps {100 - (parseFloat(feePercent) || 0)}%.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-1.5">
            Reason <span className="text-gray-500">(required to reject)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shown to the applicant, so make it actionable."
            className="w-full min-h-[90px] bg-[#0f1424] border border-[#232a45] rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500/60 resize-y"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => decide("reject")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-950/30 disabled:opacity-50 py-2.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={() => decide("approve")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
