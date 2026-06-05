// Renders the user's current subscription state and the Stripe Customer
// Portal launch button. Loaded inside ProfilePage when activeTab === "billing".

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import {
  fetchMyBilling,
  openBillingPortal,
  hasProAccess,
  type BillingStatus,
} from "../../functions/BillingFunctions/billingFunctions";

const BillingPanel: React.FC = () => {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchMyBilling().then((b) => {
      setBilling(b);
      setLoaded(true);
    });
  }, []);

  const openPortal = async () => {
    setLoadingPortal(true);
    const result = await openBillingPortal();
    setLoadingPortal(false);
    if (result.ok && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.message || "Could not open portal.");
    }
  };

  if (!loaded) {
    return (
      <div className="p-6 text-gray-400 text-sm">Loading billing info…</div>
    );
  }

  const isPro = hasProAccess(billing);
  const tier = billing?.tier || "free";
  const expiresAt = billing?.expiresAt
    ? new Date(billing.expiresAt).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white font-mono">
        <span className="text-purple-400">const</span> billing
      </h2>

      {/* Current plan card */}
      <div
        className={`p-6 rounded-xl border ${
          isPro
            ? "bg-gradient-to-br from-purple-900/20 to-pink-900/10 border-purple-500/40"
            : "bg-[#0d1230] border-[#1a1f3e]"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isPro ? (
                <Crown className="w-5 h-5 text-purple-300" />
              ) : (
                <Sparkles className="w-5 h-5 text-gray-400" />
              )}
              <h3 className="text-lg font-bold text-white">
                {tier === "lifetime"
                  ? "Lifetime Pro"
                  : tier === "pro"
                  ? "Pro"
                  : "Free"}
              </h3>
              {billing?.status && billing.status !== "active" && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-900/30 text-amber-300 border border-amber-500/40">
                  {billing.status.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-300">
              {isPro
                ? "You have full access to all tutorials, courses, quizzes, and certificates."
                : "You're on the free plan. Upgrade to unlock the full curriculum."}
            </p>
            {expiresAt && tier === "pro" && (
              <p className="text-xs text-gray-500 mt-2">
                Renews on <strong>{expiresAt}</strong>
              </p>
            )}
            {tier === "lifetime" && (
              <p className="text-xs text-purple-300 mt-2">
                Founding-member access — no renewals.
              </p>
            )}
            {billing?.purchasedCourses?.length ? (
              <p className="text-xs text-gray-400 mt-2">
                Single-course purchases: {billing.purchasedCourses.length}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!isPro && (
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white text-sm font-medium hover:from-[#7c3aed] hover:to-[#8b5cf6]"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Link>
            )}
            {billing?.hasStripeCustomer && (
              <button
                onClick={openPortal}
                disabled={loadingPortal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1a1f3e] border border-[#2a3050] text-gray-200 text-sm hover:bg-[#2a3050]"
              >
                {loadingPortal ? "Opening…" : "Manage subscription"}
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pro perks reminder */}
      {!isPro && (
        <div className="p-4 rounded-lg bg-[#0d1230] border border-[#1a1f3e]">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            What you get with Pro
          </h4>
          <ul className="text-sm text-gray-300 space-y-1 pl-6 list-disc">
            <li>All 72 tutorials across 3 languages</li>
            <li>3 comprehensive courses with quizzes + certificates</li>
            <li>Unlimited AI assistant</li>
            <li>Cancel anytime</li>
          </ul>
        </div>
      )}

      <div className="p-3 rounded-lg bg-[#0d1230] border border-[#1a1f3e] text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <span>
          Payments are processed securely by Stripe. "Manage subscription"
          opens Stripe's hosted customer portal where you can update payment
          methods, view invoices, or cancel.
        </span>
      </div>
    </div>
  );
};

export default BillingPanel;
