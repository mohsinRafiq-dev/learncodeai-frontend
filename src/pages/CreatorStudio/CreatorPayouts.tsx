import { useEffect, useState, useCallback } from "react";
import {
  Loader2, ExternalLink, CheckCircle2, AlertTriangle, Banknote, Clock,
} from "lucide-react";
import {
  creatorAPI, money, type PayoutStatus, type Payout,
} from "../../services/creatorAPI";
import { useToast } from "../../contexts/ToastContext";

export default function CreatorPayouts({ onChanged }: { onChanged: () => void }) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        creatorAPI.getPayoutStatus(),
        creatorAPI.listPayouts().catch(() => []),
      ]);
      setStatus(s);
      setPayouts(p);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onboard = async () => {
    setBusy(true);
    try {
      // Single-use and short-lived, so navigate straight there rather than
      // storing the URL.
      window.location.href = await creatorAPI.startOnboarding();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not start onboarding", "error");
      setBusy(false);
    }
  };

  const openDashboard = async () => {
    try {
      window.open(await creatorAPI.getDashboardLink(), "_blank", "noopener");
    } catch {
      showToast("Finish payout onboarding first", "error");
    }
  };

  const withdraw = async () => {
    if (!status) return;
    setBusy(true);
    try {
      await creatorAPI.requestPayout();
      showToast("Payout requested", "success");
      await load();
      onChanged();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Payout request failed", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      </div>
    );
  }
  if (!status) {
    return <p className="text-gray-400 py-8">Couldn't load payout status.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Onboarding state */}
      <section className="rounded-lg border border-[#232a45] bg-[#0f1424] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-100 flex items-center gap-2">
              {status.payoutsEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Payouts enabled
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Payout setup incomplete
                </>
              )}
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 max-w-lg">
              {status.payoutsEnabled
                ? "Your Stripe account is verified. Earnings are transferred when you request a payout."
                : status.blocker ??
                  "Connect a Stripe account to receive earnings from course sales."}
            </p>

            {status.requirementsDue?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {status.requirementsDue.slice(0, 5).map((r) => (
                  <li key={r} className="text-xs text-amber-300/80 font-mono">
                    • {r.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            {!status.payoutsEnabled && (
              <button
                onClick={onboard}
                disabled={busy}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                {status.onboarded ? "Continue setup" : "Set up payouts"}
              </button>
            )}
            {status.onboarded && (
              <button
                onClick={openDashboard}
                className="flex items-center gap-2 border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Stripe dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Balance */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Available" value={money(status.balance.withdrawableCents)} accent />
        <Card
          label="Clearing"
          value={money(status.balance.pendingCents)}
          hint="Held briefly against refunds"
        />
        <Card label="Paid out" value={money(status.balance.paidOutCents)} />
      </section>

      <section className="rounded-lg border border-[#232a45] bg-[#0f1424] p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-medium text-gray-100">Request a payout</h3>
            <p className="text-sm text-gray-400 mt-1">
              Minimum {money(status.minimumPayoutCents)}.{" "}
              {status.balance.pendingPayoutCents ? (
                <span className="text-amber-400">
                  {money(status.balance.pendingPayoutCents)} already in flight.
                </span>
              ) : null}
            </p>
          </div>
          <button
            onClick={withdraw}
            disabled={busy || !status.canRequestPayout}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Banknote className="w-4 h-4" />
            Withdraw {money(status.balance.withdrawableCents)}
          </button>
        </div>
      </section>

      {/* History */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Payout history</h3>
        {payouts.length === 0 ? (
          <p className="text-sm text-gray-500 px-1">No payouts yet.</p>
        ) : (
          <div className="rounded-lg border border-[#232a45] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#141a2e] text-left text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Requested</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-t border-[#232a45]">
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-medium">
                      {money(p.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <PayoutBadge status={p.status} reason={p.failureReason} />
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

function Card({
  label, value, hint, accent,
}: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent ? "border-green-500/30 bg-green-950/20" : "border-[#232a45] bg-[#0f1424]"
      }`}
    >
      <p className={`text-xs ${accent ? "text-green-400" : "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-green-300" : "text-gray-100"}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function PayoutBadge({ status, reason }: { status: Payout["status"]; reason?: string | null }) {
  const map: Record<Payout["status"], { cls: string; label: string }> = {
    requested: { cls: "bg-amber-900/30 text-amber-400", label: "Requested" },
    approved: { cls: "bg-blue-900/30 text-blue-400", label: "Approved" },
    processing: { cls: "bg-blue-900/30 text-blue-400", label: "Processing" },
    paid: { cls: "bg-green-900/30 text-green-400", label: "Paid" },
    failed: { cls: "bg-red-900/30 text-red-400", label: "Failed" },
    cancelled: { cls: "bg-gray-800 text-gray-400", label: "Cancelled" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>
      {status === "requested" && <Clock className="w-3 h-3 text-gray-500" />}
      {reason && <span className="text-xs text-red-400/70">{reason}</span>}
    </span>
  );
}
