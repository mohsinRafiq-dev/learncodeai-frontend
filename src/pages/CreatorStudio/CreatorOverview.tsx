import { useEffect, useState } from "react";
import { Loader2, TrendingUp, BookOpen, Users, Wallet, ArrowRight } from "lucide-react";
import { creatorAPI, money } from "../../services/creatorAPI";

interface Dashboard {
  profile: { status: string; displayName?: string; payoutsEnabled: boolean; platformFeeBps: number };
  courses: { total: number; byStatus: Record<string, number>; list: any[] };
  sales: { count: number; grossCents: number; earningsCents: number };
  balance: {
    pendingCents: number;
    availableCents: number;
    paidOutCents: number;
    withdrawableCents: number;
    pendingPayoutCents: number;
  };
  recentOrders: any[];
}

export default function CreatorOverview({
  onNavigate,
}: {
  onNavigate: (tab: "overview" | "courses" | "payouts") => void;
}) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creatorAPI
      .getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      </div>
    );
  }
  if (!data) {
    return <p className="text-gray-400 py-8">Couldn't load your dashboard.</p>;
  }

  const published = data.courses.byStatus.published ?? 0;
  const inReview = data.courses.byStatus.pending_review ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<Wallet className="w-4 h-4" />}
          label="Available to withdraw"
          value={money(data.balance.withdrawableCents)}
          hint={
            data.balance.pendingCents > 0
              ? `${money(data.balance.pendingCents)} still clearing`
              : undefined
          }
          accent
        />
        <Stat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Lifetime earnings"
          value={money(data.sales.earningsCents)}
          hint={`from ${money(data.sales.grossCents)} in sales`}
        />
        <Stat
          icon={<Users className="w-4 h-4" />}
          label="Sales"
          value={String(data.sales.count)}
        />
        <Stat
          icon={<BookOpen className="w-4 h-4" />}
          label="Published courses"
          value={String(published)}
          hint={inReview > 0 ? `${inReview} in review` : undefined}
        />
      </div>

      {data.balance.withdrawableCents > 0 && (
        <button
          onClick={() => onNavigate("payouts")}
          className="w-full flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-5 py-4 hover:bg-cyan-950/30 transition-colors group"
        >
          <div className="text-left">
            <p className="text-cyan-300 font-medium">
              {money(data.balance.withdrawableCents)} ready to withdraw
            </p>
            <p className="text-sm text-cyan-200/60 mt-0.5">
              Request a payout to your bank account
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent sales</h2>
        {data.recentOrders.length === 0 ? (
          <div className="rounded-lg border border-[#232a45] bg-[#0f1424] px-5 py-8 text-center">
            <p className="text-gray-400 text-sm">No sales yet.</p>
            <button
              onClick={() => onNavigate("courses")}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline mt-2"
            >
              {published === 0 ? "Publish your first course" : "Manage your courses"}
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-[#232a45] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#141a2e]">
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-2.5 font-medium">Course</th>
                  <th className="px-4 py-2.5 font-medium">Student</th>
                  <th className="px-4 py-2.5 font-medium text-right">Sale</th>
                  <th className="px-4 py-2.5 font-medium text-right">You earned</th>
                  <th className="px-4 py-2.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-t border-[#232a45]">
                    <td className="px-4 py-3 text-gray-200">{o.snapshot?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{o.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {money(o.grossCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-medium">
                      {money(o.creatorEarningsCents)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {o.paidAt ? new Date(o.paidAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent ? "border-cyan-500/30 bg-cyan-950/20" : "border-[#232a45] bg-[#0f1424]"
      }`}
    >
      <div className={`flex items-center gap-2 text-xs ${accent ? "text-cyan-400" : "text-gray-400"}`}>
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent ? "text-cyan-300" : "text-gray-100"}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
