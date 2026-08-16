import { useEffect, useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { plansAPI, type CreditSummary } from "../../services/plansAPI";

/**
 * Shows how many AI credits remain this period.
 *
 * Worth surfacing rather than only failing at the point of use: running out
 * mid-task with no warning is the worst way to discover a limit exists, and a
 * visible meter is also what makes the upgrade case obvious.
 */
export default function AiCreditMeter({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<CreditSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    plansAPI
      .getCredits()
      .then((c) => !cancelled && setCredits(c))
      .catch(() => {
        // Silent: a missing meter is a much smaller problem than an error
        // banner over a working feature.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!credits) return null;

  const pct = credits.percentUsed;
  const low = credits.remaining <= credits.allocated * 0.15;
  const empty = credits.remaining === 0;
  const isFree = credits.planKey === "free";

  const barColor = empty
    ? "bg-red-500"
    : low
    ? "bg-amber-500"
    : "bg-gradient-to-r from-cyan-500 to-purple-500";

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className={`w-3.5 h-3.5 ${empty ? "text-red-400" : "text-cyan-400"}`} />
        <span className={empty ? "text-red-400" : "text-gray-400"}>
          {credits.remaining}/{credits.allocated}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-gray-200">AI credits</span>
        </div>
        <span className={`text-sm font-semibold ${empty ? "text-red-400" : "text-gray-100"}`}>
          {credits.remaining.toLocaleString()}
          <span className="text-gray-500 font-normal">
            {" "}
            / {credits.allocated.toLocaleString()}
          </span>
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-[#1a1f3e] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <p className="text-xs text-gray-500">
          Resets {new Date(credits.resetsAt).toLocaleDateString()}
        </p>
        {isFree && (
          <button
            onClick={() => navigate("/pricing")}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Get 2,000/month
          </button>
        )}
      </div>

      {(empty || low) && (
        <div
          className={`mt-3 flex gap-2 rounded border px-3 py-2 ${
            empty
              ? "border-red-500/30 bg-red-950/20"
              : "border-amber-500/30 bg-amber-950/20"
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 shrink-0 mt-0.5 ${empty ? "text-red-400" : "text-amber-400"}`}
          />
          <p className={`text-xs ${empty ? "text-red-200" : "text-amber-200"}`}>
            {empty
              ? isFree
                ? "You've used all your credits this month. Upgrade to Pro for 2,000."
                : "You've used all your credits. They reset next billing period."
              : "Running low on AI credits."}
          </p>
        </div>
      )}
    </div>
  );
}
