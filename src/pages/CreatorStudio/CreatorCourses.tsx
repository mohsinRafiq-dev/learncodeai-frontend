import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Plus, Send, Eye, EyeOff, Undo2, Trash2, AlertCircle, DollarSign,
} from "lucide-react";
import {
  creatorAPI, money,
  type CreatorCourse, type CreatorProfile, type CourseAction,
} from "../../services/creatorAPI";
import { useToast } from "../../contexts/ToastContext";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-gray-800 text-gray-300",
  pending_review: "bg-amber-900/30 text-amber-400",
  approved: "bg-blue-900/30 text-blue-400",
  rejected: "bg-red-900/30 text-red-400",
  published: "bg-green-900/30 text-green-400",
  suspended: "bg-red-900/40 text-red-300",
};

const ACTION_META: Record<CourseAction, { label: string; icon: any; cls: string }> = {
  submit:    { label: "Submit for review", icon: Send,  cls: "bg-cyan-600 hover:bg-cyan-500 text-white" },
  withdraw:  { label: "Withdraw",          icon: Undo2, cls: "border border-[#2c3454] text-gray-300 hover:bg-[#141a2e]" },
  publish:   { label: "Publish",           icon: Eye,   cls: "bg-green-600 hover:bg-green-500 text-white" },
  unpublish: { label: "Unpublish",         icon: EyeOff,cls: "border border-[#2c3454] text-gray-300 hover:bg-[#141a2e]" },
  approve:   { label: "Approve",           icon: Eye,   cls: "" },
  reject:    { label: "Reject",            icon: EyeOff,cls: "" },
  suspend:   { label: "Suspend",           icon: EyeOff,cls: "" },
  reinstate: { label: "Reinstate",         icon: Eye,   cls: "" },
};

// Only these are creator-driven; the rest belong to admins.
const CREATOR_ACTIONS: CourseAction[] = ["submit", "withdraw", "publish", "unpublish"];

export default function CreatorCourses({ profile }: { profile: CreatorProfile }) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pricingFor, setPricingFor] = useState<CreatorCourse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { courses } = await creatorAPI.listCourses();
      setCourses(courses);
    } catch {
      showToast("Couldn't load your courses", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (course: CreatorCourse, action: CourseAction) => {
    setBusyId(course._id);
    try {
      await creatorAPI.runAction(course._id, action);
      showToast(`Course ${action}ed`, "success");
      await load();
    } catch (err: any) {
      const data = err?.response?.data;
      // Submission failures carry the exact list of what's missing.
      if (data?.problems?.length) {
        showToast(`${data.message} ${data.problems.join(" ")}`, "error");
      } else {
        showToast(data?.message ?? `Could not ${action} course`, "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  const create = async () => {
    setCreating(true);
    try {
      await creatorAPI.createCourse({
        title: "Untitled course",
        language: "python",
        category: "programming-language",
      });
      showToast("Draft created", "success");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not create course", "error");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={create}
          disabled={creating}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#2c3454] px-6 py-14 text-center">
          <p className="text-gray-300 font-medium">No courses yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a draft, add sections and lessons, then submit it for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <article
              key={c._id}
              className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-100 truncate">{c.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_STYLE[c.status] ?? "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    {c.includedInPro && (
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-900/30 text-purple-300">
                        In Pro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                    <span>{c.language}</span>
                    <span>{c.difficulty}</span>
                    <span className="text-gray-200 font-medium">
                      {c.priceCents > 0 ? money(c.priceCents) : "Free"}
                    </span>
                    {c.salesCount > 0 && (
                      <span className="text-green-400">
                        {c.salesCount} sale{c.salesCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {c.earningsPreview && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      You keep {money(c.earningsPreview.creatorEarningsCents)} per sale ·
                      platform fee {money(c.earningsPreview.platformFeeCents)}
                    </p>
                  )}

                  {c.status === "rejected" && c.reviewNotes && (
                    <div className="mt-3 flex gap-2 rounded border border-red-500/30 bg-red-950/20 px-3 py-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-200">{c.reviewNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => setPricingFor(c)}
                    className="flex items-center gap-1.5 border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Pricing
                  </button>

                  {c.availableActions
                    .filter((a) => CREATOR_ACTIONS.includes(a))
                    .map((a) => {
                      const meta = ACTION_META[a];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={a}
                          onClick={() => runAction(c, a)}
                          disabled={busyId === c._id}
                          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${meta.cls}`}
                        >
                          {busyId === c._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                          {meta.label}
                        </button>
                      );
                    })}

                  {c.status === "draft" && c.salesCount === 0 && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
                        try {
                          await creatorAPI.deleteCourse(c._id);
                          showToast("Course deleted", "success");
                          load();
                        } catch (err: any) {
                          showToast(err?.response?.data?.message ?? "Delete failed", "error");
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pricingFor && (
        <PricingModal
          course={pricingFor}
          profile={profile}
          onClose={() => setPricingFor(null)}
          onSaved={() => {
            setPricingFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PricingModal({
  course, profile, onClose, onSaved,
}: {
  course: CreatorCourse;
  profile: CreatorProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [dollars, setDollars] = useState((course.priceCents / 100).toFixed(2));
  const [inPro, setInPro] = useState(course.includedInPro);
  const [saving, setSaving] = useState(false);

  const cents = Math.round(parseFloat(dollars || "0") * 100);
  const feeBps = profile.platformFeeBps ?? 3000;
  const platformCut = Math.floor((cents * feeBps) / 10000);
  const yourCut = cents - platformCut;
  const valid = cents === 0 || (cents >= 500 && cents <= 20000);

  const save = async () => {
    setSaving(true);
    try {
      await creatorAPI.setPricing(course._id, { priceCents: cents, includedInPro: inPro });
      showToast("Pricing updated", "success");
      onSaved();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not update pricing", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#232a45] bg-[#0b0f1d] p-6">
        <h3 className="font-semibold text-gray-100">Pricing</h3>
        <p className="text-sm text-gray-400 mt-1 truncate">{course.title}</p>

        <div className="mt-5">
          <label className="block text-sm text-gray-300 mb-1.5">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={dollars}
              onChange={(e) => setDollars(e.target.value)}
              className="w-full bg-[#0f1424] border border-[#232a45] rounded-lg pl-7 pr-4 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
          <p className={`text-xs mt-1.5 ${valid ? "text-gray-500" : "text-red-400"}`}>
            {valid ? "Free, or between $5 and $200." : "Must be $0, or between $5 and $200."}
          </p>
        </div>

        {cents > 0 && valid && (
          <div className="mt-4 rounded-lg border border-[#232a45] bg-[#0f1424] p-3 text-sm space-y-1.5">
            <Row label="Sale price" value={money(cents)} />
            <Row
              label={`Platform fee (${feeBps / 100}%)`}
              value={`− ${money(platformCut)}`}
              muted
            />
            <div className="border-t border-[#232a45] pt-1.5">
              <Row label="You receive" value={money(yourCut)} strong />
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={inPro}
            onChange={(e) => setInPro(e.target.checked)}
            className="mt-0.5 accent-cyan-500"
          />
          <span className="text-sm">
            <span className="text-gray-200">Include in the Pro catalogue</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Pro subscribers read it free; you earn from the monthly revenue pool
              instead of per sale. Opting out later takes 30 days.
            </span>
          </span>
        </label>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !valid}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label, value, muted, strong,
}: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-gray-500" : "text-gray-400"}>{label}</span>
      <span className={strong ? "text-green-400 font-semibold" : "text-gray-200"}>{value}</span>
    </div>
  );
}
