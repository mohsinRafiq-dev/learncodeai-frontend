import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Clock, XCircle, Ban, LayoutDashboard, BookOpen, Wallet,
} from "lucide-react";
import { creatorAPI, type CreatorProfile } from "../../services/creatorAPI";
import CreatorApply from "./CreatorApply";
import CreatorOverview from "./CreatorOverview";
import CreatorCourses from "./CreatorCourses";
import CreatorPayouts from "./CreatorPayouts";

type Tab = "overview" | "courses" | "payouts";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "payouts", label: "Payouts", icon: Wallet },
];

export default function CreatorStudio() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await creatorAPI.getProfile());
    } catch {
      // Treated as "not a creator yet" rather than an error state: the most
      // common reason for a failure here is simply having no profile.
      setProfile({ status: "none", canApply: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!profile || profile.status === "none" || profile.status === "rejected") {
    return (
      <div className="px-4 py-10">
        <CreatorApply profile={profile!} onSubmitted={load} />
      </div>
    );
  }

  // Pending and suspended are terminal for now: there is nothing to manage, so
  // showing empty dashboards would be worse than explaining the state.
  if (profile.status === "pending") {
    return (
      <StatusScreen
        icon={<Clock className="w-8 h-8 text-amber-400" />}
        title="Application under review"
        body="We're reviewing your creator application. You'll get an email as soon as there's a decision — usually within a couple of days."
        tone="amber"
      />
    );
  }

  if (profile.status === "suspended") {
    return (
      <StatusScreen
        icon={<Ban className="w-8 h-8 text-red-400" />}
        title="Creator account suspended"
        body={profile.review?.reason ?? "Contact support for details."}
        tone="red"
      />
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Creator Studio</h1>
        <p className="text-gray-400 mt-1">
          {profile.application?.displayName} · earning{" "}
          <span className="text-cyan-400 font-medium">
            {100 - (profile.platformFeeBps ?? 3000) / 100}%
          </span>{" "}
          of every sale
        </p>
      </header>

      {profile.paidPublishBlocker && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-200">{profile.paidPublishBlocker}</p>
            <button
              onClick={() => setTab("payouts")}
              className="text-sm text-amber-400 hover:text-amber-300 underline mt-1"
            >
              Set up payouts
            </button>
          </div>
        </div>
      )}

      <nav className="flex gap-1 border-b border-[#232a45] mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <CreatorOverview onNavigate={setTab} />}
      {tab === "courses" && <CreatorCourses profile={profile} />}
      {tab === "payouts" && <CreatorPayouts onChanged={load} />}
    </div>
  );
}

function StatusScreen({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: "amber" | "red";
}) {
  const ring = tone === "amber" ? "border-amber-500/30 bg-amber-950/20" : "border-red-500/30 bg-red-950/20";
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className={`max-w-md w-full rounded-xl border ${ring} p-8 text-center`}>
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        <p className="text-gray-400 mt-2 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
