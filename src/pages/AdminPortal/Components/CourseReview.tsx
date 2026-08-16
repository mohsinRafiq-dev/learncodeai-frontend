import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Check, X, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Clock,
} from "lucide-react";
import {
  adminMarketplaceAPI,
  type ReviewCourseRow,
  type CodeVerificationResult,
} from "../../../services/adminMarketplaceAPI";
import { money } from "../../../services/creatorAPI";
import { useToast } from "../../../contexts/ToastContext";

export default function CourseReview() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ReviewCourseRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReviewCourseRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMarketplaceAPI.getReviewQueue();
      setRows(data.courses);
      setCounts(data.counts);
    } catch {
      showToast("Couldn't load the review queue", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Course review</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Courses submitted by creators, oldest first so nothing waits indefinitely.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap text-sm">
        {Object.entries(counts).map(([status, n]) => (
          <span
            key={status}
            className="px-3 py-1.5 rounded-lg bg-[#141a2e] text-gray-300 border border-[#232a45]"
          >
            {status.replace("_", " ")}: <span className="text-gray-100 font-medium">{n}</span>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#2c3454] py-14 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-400/60 mx-auto mb-2" />
          <p className="text-gray-400">Nothing waiting for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <article key={c._id} className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-100">{c.title}</h3>
                  {c.shortDescription && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {c.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>{c.instructor?.name}</span>
                    <span>{c.language}</span>
                    <span>{c.difficulty}</span>
                    <span className="text-gray-300 font-medium">
                      {c.priceCents > 0 ? money(c.priceCents) : "Free"}
                    </span>
                    {c.includedInPro && <span className="text-purple-400">in Pro</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.submittedAt
                        ? new Date(c.submittedAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(c)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  Review
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <ReviewModal
          course={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({
  course, onClose, onDone,
}: { course: ReviewCourseRow; onClose: () => void; onDone: () => void }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<CodeVerificationResult | null>(null);

  const verify = async () => {
    setVerifying(true);
    try {
      setVerification(await adminMarketplaceAPI.verifyCourseCode(course._id));
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  const decide = async (action: "approve" | "reject") => {
    if (action === "reject" && !reason.trim()) {
      showToast("A reason is required when rejecting", "error");
      return;
    }
    setBusy(true);
    try {
      await adminMarketplaceAPI.decideCourse(course._id, action, reason.trim() || undefined);
      showToast(`Course ${action}d`, "success");
      onDone();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Decision failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#232a45] bg-[#0b0f1d] p-6">
        <h3 className="font-semibold text-gray-100">{course.title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {course.instructor?.name} · {course.language} ·{" "}
          {course.priceCents > 0 ? money(course.priceCents) : "Free"}
        </p>

        {/* Reuses the verified-generation sandbox: a reviewer should not have to
            discover broken examples by hand. */}
        <section className="mt-5 rounded-lg border border-[#232a45] bg-[#0f1424] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-medium text-gray-200">Code verification</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Runs every code example in this course through the sandbox.
              </p>
            </div>
            <button
              onClick={verify}
              disabled={verifying}
              className="flex items-center gap-2 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/30 disabled:opacity-50 text-sm px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {verifying ? "Running…" : "Run all examples"}
            </button>
          </div>

          {verification && (
            <div className="mt-4">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> {verification.passed} passed
                </span>
                {verification.failed > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="w-4 h-4" /> {verification.failed} failed
                  </span>
                )}
                {verification.unjudged > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" /> {verification.unjudged} unjudged
                  </span>
                )}
                {verification.passRate != null && (
                  <span className="text-gray-400">{verification.passRate}% pass rate</span>
                )}
              </div>

              <p
                className={`text-sm mt-3 ${
                  verification.failed > 0 ? "text-red-300" : "text-green-300"
                }`}
              >
                {verification.recommendation}
              </p>

              {verification.results.filter((r) => !r.ok).length > 0 && (
                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto">
                  {verification.results
                    .filter((r) => !r.ok)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="rounded border border-red-500/30 bg-red-950/20 p-2.5"
                      >
                        <p className="text-xs text-red-300 font-medium">
                          {r.lesson} — {r.title}{" "}
                          <span className="font-mono opacity-70">({r.verdict})</span>
                        </p>
                        {r.diagnostic && (
                          <pre className="text-xs text-red-200/70 mt-1 whitespace-pre-wrap font-mono overflow-x-auto">
                            {r.diagnostic}
                          </pre>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-1.5">
            Reason <span className="text-gray-500">(required to reject)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shown to the creator. Paste failing diagnostics here if relevant."
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
