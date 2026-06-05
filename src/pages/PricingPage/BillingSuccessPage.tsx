// Stripe redirects here after a successful checkout. We poll /billing/me
// briefly because Stripe webhooks may take a second to update the user record.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import {
  fetchMyBilling,
  hasProAccess,
  type BillingStatus,
} from "../../functions/BillingFunctions/billingFunctions";

const BillingSuccessPage: React.FC = () => {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      const b = await fetchMyBilling();
      if (!active) return;
      setBilling(b);
      if (hasProAccess(b) || tries >= 6) return;
      setTimeout(() => setTries((n) => n + 1), 2000);
    };
    tick();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tries]);

  const isPro = hasProAccess(billing);

  return (
    <div className="min-h-screen bg-[#0a0e27] font-mono flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-2xl bg-[#0d1230] border border-[#00e676]/30 shadow-xl shadow-green-500/10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00e676]/15 border border-[#00e676]/40 mb-4">
          {isPro ? (
            <CheckCircle2 className="w-8 h-8 text-[#00e676]" />
          ) : (
            <Sparkles className="w-8 h-8 text-[#00e676] animate-pulse" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {isPro
            ? billing?.tier === "lifetime"
              ? "Welcome to Lifetime Pro"
              : "Welcome to Pro"
            : "Confirming your purchase…"}
        </h1>

        <p className="text-sm text-[#a3a8c2] mb-6">
          {isPro
            ? "All tutorials, courses, quizzes, and certificates are unlocked."
            : "Stripe is notifying our servers. This usually takes a couple of seconds."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/tutorials"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white"
          >
            Start learning
          </Link>
          <Link
            to="/profile?tab=settings"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm text-gray-300 border border-[#2a3050]"
          >
            Manage subscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BillingSuccessPage;
