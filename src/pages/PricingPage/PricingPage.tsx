import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, Zap, Loader2, Minus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  startCheckout,
  fetchMyBilling,
  hasProAccess,
  type BillingStatus,
  type CheckoutPlan,
} from "../../functions/BillingFunctions/billingFunctions";
import { plansAPI, money, type Plan, type PlanCatalogue } from "../../services/plansAPI";

type PlanKey = "free" | "pro_monthly" | "pro_yearly" | "lifetime";

// Presentation only. Every number on this page comes from the server, which
// derives it from the same config the Stripe prices were created from — the
// page used to hard-code its own and had drifted to advertising $6/mo while
// Stripe charged $9.
const PRESENTATION: Record<
  PlanKey,
  { title: string; tagline: string; cta: string; icon: React.ComponentType<{ className?: string }>; iconClass: string; badge?: string; highlight?: boolean }
> = {
  free: {
    title: "Free",
    tagline: "Start learning, no card required.",
    cta: "Get started",
    icon: Zap,
    // Written out in full: Tailwind scans source statically, so a class built
    // by interpolation is never generated and the icon renders unstyled.
    iconClass: "text-cyan-400",
  },
  pro_monthly: {
    title: "Pro",
    tagline: "Everything you need to master programming.",
    cta: "Subscribe monthly",
    icon: Sparkles,
    iconClass: "text-purple-400",
  },
  pro_yearly: {
    title: "Pro Annual",
    tagline: "Two months free versus monthly.",
    cta: "Subscribe yearly",
    icon: Crown,
    iconClass: "text-amber-400",
    badge: "Best value",
    highlight: true,
  },
  lifetime: {
    title: "Lifetime",
    tagline: "Pay once. Learn forever.",
    cta: "Get Lifetime",
    icon: Crown,
    iconClass: "text-pink-400",
  },
};

const featureList = (plan: Plan, key: PlanKey): Array<{ text: string; on: boolean }> => {
  const { limits, features } = plan;
  const unlimited = (v: number | null) => (v === null ? "Unlimited" : v.toLocaleString());

  const base = [
    {
      text: `${limits.aiCreditsPerMonth.toLocaleString()} AI credits / month`,
      on: true,
    },
    {
      text:
        features.tutorialDifficulties.length > 1
          ? "All tutorials — beginner to advanced"
          : "Foundations tutorials (beginner)",
      on: true,
    },
    {
      text: features.platformCoursesIncluded
        ? "All platform courses included"
        : "Course previews only",
      on: features.platformCoursesIncluded,
    },
    {
      text: `${unlimited(limits.savedSnippets)} saved snippets`,
      on: true,
    },
    {
      text: `${limits.codeExecutionsPerDay.toLocaleString()} code runs / day`,
      on: true,
    },
    { text: "Verifiable certificates", on: features.certificates },
    { text: "Verified AI tutorial generation", on: features.verifiedGeneration },
    { text: "Priority support", on: features.prioritySupport },
  ];

  if (key === "pro_yearly") {
    base.unshift({ text: "Everything in Pro, billed annually", on: true });
  }
  if (key === "lifetime") {
    base.push({ text: "No recurring bills, ever", on: true });
  }
  return base;
};

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [catalogue, setCatalogue] = useState<PlanCatalogue | null>(null);
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    plansAPI
      .getCatalogue()
      .then(setCatalogue)
      .catch(() => setError("Couldn't load pricing. Please refresh."));
  }, []);

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
    setError(null);
    const result = await startCheckout({ plan: key as CheckoutPlan });
    setLoading(null);
    if (result.ok && result.url) {
      window.location.href = result.url;
    } else {
      setError(result.message || "Could not start checkout — please try again.");
    }
  };

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        )}
      </div>
    );
  }

  const free = catalogue.plans.find((p) => p.key === "free")!;
  const pro = catalogue.plans.find((p) => p.key === "pro")!;
  const lifetime = catalogue.plans.find((p) => p.key === "lifetime")!;

  const cards: Array<{ key: PlanKey; plan: Plan; price: string; cadence: string }> = [
    { key: "free", plan: free, price: money(free.priceCents), cadence: "forever" },
    { key: "pro_monthly", plan: pro, price: money(pro.priceCents), cadence: "per month" },
    {
      key: "pro_yearly",
      plan: pro,
      price: money(pro.yearlyPriceCents ?? 0),
      cadence: "per year",
    },
    {
      key: "lifetime",
      plan: lifetime,
      price: money(lifetime.priceCents),
      cadence: "one-time",
    },
  ];

  const yearlySaving =
    pro.yearlyPriceCents != null ? pro.priceCents * 12 - pro.yearlyPriceCents : 0;

  return (
    <div className="min-h-screen bg-[#0a0e27] font-mono py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[100px] opacity-10" />
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Learn to code, properly
            </h1>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Every AI code example is executed in a sandbox before you see it.
              Start free — upgrade when you need more.
            </p>
            {currentlyPro && (
              <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-green-900/30 border border-green-500/30">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">
                  You're on {billing?.tier === "lifetime" ? "Lifetime" : "Pro"}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map(({ key, plan, price, cadence }) => {
            const pres = PRESENTATION[key];
            const Icon = pres.icon;
            const owned =
              (key === "lifetime" && billing?.tier === "lifetime") ||
              (key.startsWith("pro") && billing?.tier === "pro");

            return (
              <div
                key={key}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  pres.highlight
                    ? "border-amber-500/40 bg-amber-950/10"
                    : "border-[#232a45] bg-[#0f1424]"
                }`}
              >
                {pres.badge && (
                  <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500 text-black">
                    {pres.badge}
                  </span>
                )}

                <Icon className={`w-6 h-6 ${pres.iconClass}`} />
                <h3 className="text-lg font-semibold text-gray-100 mt-3">{pres.title}</h3>
                <p className="text-sm text-gray-400 mt-1 min-h-[40px]">{pres.tagline}</p>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{price}</span>
                  <span className="text-gray-500 text-sm ml-1.5">{cadence}</span>
                </div>
                {key === "pro_yearly" && yearlySaving > 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    Save {money(yearlySaving)} a year
                  </p>
                )}

                <ul className="mt-5 space-y-2 flex-1">
                  {featureList(plan, key).map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.on ? (
                        <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      )}
                      <span className={f.on ? "text-gray-300" : "text-gray-600 line-through"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(key)}
                  disabled={loading !== null || owned}
                  className={`mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    pres.highlight
                      ? "bg-amber-500 hover:bg-amber-400 text-black"
                      : key === "free"
                      ? "border border-[#2c3454] text-gray-300 hover:bg-[#141a2e]"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {loading === key && <Loader2 className="w-4 h-4 animate-spin" />}
                  {owned ? "Current plan" : pres.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Credits are the one thing people misread, so spell out the cost. */}
        <section className="mt-14 max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-100 text-center">
            How AI credits work
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            Every AI action costs credits. They reset at the start of each period.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(catalogue.aiActionCosts).map(([action, cost]) => (
              <div
                key={action}
                className="rounded-lg border border-[#232a45] bg-[#0f1424] p-3 text-center"
              >
                <p className="text-2xl font-bold text-cyan-400">{cost}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {action.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Verified generation costs most: it runs the sandbox on every code
            example it produces, and regenerates any that fail.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
