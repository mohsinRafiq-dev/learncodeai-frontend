import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  startCheckout,
  fetchMyBilling,
  hasProAccess,
  type BillingStatus,
  type CheckoutPlan,
} from "../../functions/BillingFunctions/billingFunctions";

type PlanKey = "free" | "pro_monthly" | "pro_yearly" | "lifetime";

const PLANS: Array<{
  key: PlanKey;
  title: string;
  price: string;
  cadence: string;
  tagline: string;
  cta: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // tailwind color shade key
}> = [
  {
    key: "free",
    title: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Start learning, no card required.",
    cta: "Get started",
    icon: Zap,
    accent: "cyan",
    features: [
      "All Foundations tutorials (Module 1)",
      "Code editor + run code",
      "5 AI assistant prompts / day",
      "Forum read + comment",
      "Profile, streaks, basic badges",
    ],
  },
  {
    key: "pro_monthly",
    title: "Pro",
    price: "$6",
    cadence: "per month",
    tagline: "Everything you need to master programming.",
    cta: "Subscribe — Monthly",
    icon: Sparkles,
    accent: "purple",
    features: [
      "All 72 tutorials (beginner → expert)",
      "All 3 comprehensive courses",
      "Section + final quizzes",
      "Verifiable certificates",
      "Unlimited AI assistant",
      "Unlimited saved snippets",
      "Pro badge + priority forum answers",
    ],
  },
  {
    key: "pro_yearly",
    title: "Pro (Annual)",
    price: "$49",
    cadence: "per year",
    tagline: "Save 32% — for committed learners.",
    cta: "Subscribe — Yearly",
    highlight: true,
    badge: "Best value",
    icon: Crown,
    accent: "amber",
    features: [
      "Everything in Pro Monthly",
      "Pay once a year — save $23",
      "Annual badge on profile",
      "First access to new courses",
    ],
  },
  {
    key: "lifetime",
    title: "Lifetime Pro",
    price: "$99",
    cadence: "one-time",
    tagline: "Pay once. Learn forever. Limited launch deal.",
    cta: "Get Lifetime",
    badge: "Launch deal",
    icon: Crown,
    accent: "pink",
    features: [
      "Everything Pro, forever",
      "No more recurring bills",
      "Limited to the first 100 buyers",
      "Founding-member badge",
    ],
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState<PlanKey | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchMyBilling().then(setBilling);
  }, [isAuthenticated]);

  const currentlyPro = hasProAccess(billing);

  const handleSelect = async (key: PlanKey) => {
    if (key === "free") {
      navigate(isAuthenticated ? "/tutorials" : "/signup");
      return;
    }
    if (!isAuthenticated) {
      navigate("/signin?redirect=/pricing");
      return;
    }
    setLoading(key);
    const result = await startCheckout({ plan: key as CheckoutPlan });
    setLoading(null);
    if (result.ok && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.message || "Could not start checkout — try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] font-mono py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-purple backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg mb-6">
              <span className="text-[#8b5cf6] font-mono text-sm animate-pulse">
                ●
              </span>
              <span className="text-[#8b5cf6] font-mono text-sm font-medium">
                Pricing.init()
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-[#6272a4]">{"// "}</span>
              <span className="neon-text-cyan">Simple,</span>{" "}
              <span className="neon-text-purple">honest pricing</span>
            </h1>
            <p className="text-[#6272a4] text-base max-w-2xl mx-auto">
              <span className="text-[#8b5cf6]">{"/* "}</span>
              Start free. Upgrade when you want the full path.
              <span className="text-[#8b5cf6]">{" */"}</span>
            </p>
          </div>
        </div>

        {/* Current status callout */}
        {currentlyPro && (
          <div className="max-w-2xl mx-auto mb-10 p-4 rounded-lg bg-[#00e676]/10 border border-[#00e676]/40 text-[#00e676] text-center text-sm">
            ✓ You currently have{" "}
            <strong className="font-semibold">
              {billing?.tier === "lifetime" ? "Lifetime Pro" : "Pro"}
            </strong>{" "}
            access. Manage it from{" "}
            <a href="/profile?tab=settings" className="underline">
              Settings
            </a>
            .
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent =
              (billing?.tier === "lifetime" && plan.key === "lifetime") ||
              (billing?.tier === "pro" &&
                (plan.key === "pro_monthly" || plan.key === "pro_yearly"));
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-xl p-6 bg-[#0d1230] border transition-all hover:-translate-y-1 ${
                  plan.highlight
                    ? "border-[#fbbf24]/60 shadow-lg shadow-amber-500/20"
                    : "border-[#1a1f3e] hover:border-[#8b5cf6]/40"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plan.highlight
                        ? "bg-[#fbbf24] text-black"
                        : "bg-[#e91e63] text-white"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-[#8b5cf6]" />
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                </div>

                <div className="mb-4">
                  <div className="text-4xl font-bold text-white">
                    {plan.price}
                  </div>
                  <div className="text-xs text-[#6272a4] mt-1">
                    {plan.cadence}
                  </div>
                </div>

                <p className="text-sm text-[#6272a4] mb-5 min-h-[2.5rem]">
                  {plan.tagline}
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <Check className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.key)}
                  disabled={loading === plan.key || isCurrent}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                    isCurrent
                      ? "bg-[#1a1f3e] text-gray-400 cursor-not-allowed"
                      : plan.highlight
                      ? "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black hover:from-[#f59e0b] hover:to-[#d97706]"
                      : "bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white hover:from-[#7c3aed] hover:to-[#8b5cf6]"
                  }`}
                >
                  {loading === plan.key
                    ? "Loading…"
                    : isCurrent
                    ? "Current plan"
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ-ish footer */}
        <div className="mt-16 text-center text-sm text-[#6272a4] max-w-2xl mx-auto space-y-2">
          <p>
            <span className="text-[#00b4d8]">{"// "}</span>
            Secure payments via{" "}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Stripe
            </a>
            . Cancel anytime. 7-day refund window on annual + lifetime.
          </p>
          <p>
            <span className="text-[#00b4d8]">{"// "}</span>
            Questions? Reach us at{" "}
            <a href="/contact" className="underline">
              support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
