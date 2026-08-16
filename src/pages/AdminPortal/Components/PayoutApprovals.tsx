import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Banknote, Check, X, AlertTriangle, TrendingUp, Wallet, Clock,
} from "lucide-react";
import api from "../../../services/api";
import { money } from "../../../services/creatorAPI";
import { useToast } from "../../../contexts/ToastContext";

interface PayoutRow {
  _id: string;
  amountCents: number;
  status: "requested" | "approved" | "processing" | "paid" | "failed" | "cancelled";
  createdAt: string;
  paidAt?: string | null;
  failureReason?: string | null;
  stripeTransferId?: string | null;
  creator?: { _id: string; name: string; email: string };
  creatorProfile?: {
    application?: { displayName?: string };
    stripeAccountId?: string;
    payoutsEnabled?: boolean;
  };
}

interface Summary {
  grossCents: number;
  platformFeeCents: number;
  creatorEarningsCents: number;
  refundedCents: number;
  orders: number;
  paidOutCents: number;
  pendingPayoutCents: number;
  owedToCreatorsCents: number;
}

const FILTERS = ["requested", "paid", "failed", "cancelled", "all"] as const;

export default function PayoutApprovals() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("requested");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        api.get("/admin/payouts", { params: { status: filter } }),
        api.get("/admin/payouts/meta/summary").catch(() => null),
      ]);
      setRows(list.data.data.payouts);
      if (sum) setSummary(sum.data.data);
    } catch {
      showToast("Couldn't load payouts", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (row: PayoutRow) => {
    if (
      !confirm(
        `Send ${money(row.amountCents)} to ${
          row.creatorProfile?.application?.displayName ?? row.creator?.name
        }?\n\nThis creates a real Stripe transfer.`
      )
    )
      return;

    setBusyId(row._id);
    try {
      const res = await api.post(`/admin/payouts/${row._id}/approve`);
      showToast(res.data.message ?? "Payout sent", "success");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Payout failed", "error");
      // Reload regardless: a failed transfer still changes the payout's state.
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (row: PayoutRow) => {
    const reason = prompt("Reason for rejecting this payout (shown to the creator):");
    if (!reason?.trim()) return;

    setBusyId(row._id);
    try {
      await api.post(`/admin/payouts/${row._id}/reject`, { reason });
      showToast("Payout cancelled", "success");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not cancel", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Payouts</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Approve creator withdrawals. Approving creates a real Stripe transfer.
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            icon={<TrendingUp className="w-4 h-4" />}
            label="Platform revenue"
            value={money(summary.platformFeeCents)}
            hint={`${summary.orders} orders · ${money(summary.grossCents)} gross`}
          />
          <Stat
            icon={<Wallet className="w-4 h-4" />}
            label="Owed to creators"
            value={money(summary.owedToCreatorsCents)}
            hint="earned but not yet transferred"
            accent
          />
          <Stat
            icon={<Clock className="w-4 h-4" />}
            label="Awaiting approval"
            value={money(summary.pendingPayoutCents)}
          />
          <Stat
            icon={<Banknote className="w-4 h-4" />}
            label="Paid out"
            value={money(summary.paidOutCents)}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors border ${
              filter === f
                ? "bg-purple-900/40 text-purple-300 border-purple-500/40"
                : "text-gray-400 hover:bg-[#1a1f3e] border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#2c3454] py-14 text-center">
          <p className="text-gray-400">No {filter === "all" ? "" : filter} payouts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article
              key={row._id}
              className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-100">
                      {money(row.amountCents)}
                    </span>
                    <StatusPill status={row.status} />
                    {row.status === "requested" && !row.creatorProfile?.payoutsEnabled && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-900/30 text-red-400">
                        <AlertTriangle className="w-3 h-3" /> payouts not enabled
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
                    {row.creatorProfile?.application?.displayName ?? row.creator?.name}
                    <span className="text-gray-600"> · {row.creator?.email}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>requested {new Date(row.createdAt).toLocaleDateString()}</span>
                    {row.paidAt && (
                      <span>paid {new Date(row.paidAt).toLocaleDateString()}</span>
                    )}
                    {row.stripeTransferId && (
                      <span className="font-mono">{row.stripeTransferId}</span>
                    )}
                  </div>

                  {row.failureReason && (
                    <p className="text-xs text-red-300/80 mt-2">{row.failureReason}</p>
                  )}
                </div>

                {row.status === "requested" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reject(row)}
                      disabled={busyId === row._id}
                      className="flex items-center gap-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/30 disabled:opacity-50 text-sm px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => approve(row)}
                      disabled={busyId === row._id || !row.creatorProfile?.payoutsEnabled}
                      title={
                        row.creatorProfile?.payoutsEnabled
                          ? undefined
                          : "This creator's Stripe account cannot receive transfers yet"
                      }
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {busyId === row._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Send
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon, label, value, hint, accent,
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
        accent ? "border-amber-500/30 bg-amber-950/20" : "border-[#232a45] bg-[#0f1424]"
      }`}
    >
      <div className={`flex items-center gap-2 text-xs ${accent ? "text-amber-400" : "text-gray-400"}`}>
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent ? "text-amber-300" : "text-gray-100"}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: PayoutRow["status"] }) {
  const map: Record<PayoutRow["status"], string> = {
    requested: "bg-amber-900/30 text-amber-400",
    approved: "bg-blue-900/30 text-blue-400",
    processing: "bg-blue-900/30 text-blue-400",
    paid: "bg-green-900/30 text-green-400",
    failed: "bg-red-900/30 text-red-400",
    cancelled: "bg-gray-800 text-gray-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>{status}</span>
  );
}
