import { useState } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { creatorAPI, type CreatorProfile } from "../../services/creatorAPI";
import { useToast } from "../../contexts/ToastContext";

// Two-letter codes because Stripe Connect requires the payout country up front
// and cannot change it after the account is created.
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

interface Props {
  profile: CreatorProfile;
  onSubmitted: () => void;
}

export default function CreatorApply({ profile, onSubmitted }: Props) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    expertise: "",
    portfolioUrls: "",
    payoutCountry: "US",
    motivation: "",
  });

  const isRejected = profile.status === "rejected";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) {
      showToast("A display name is required", "error");
      return;
    }

    setSaving(true);
    try {
      await creatorAPI.apply({
        displayName: form.displayName.trim(),
        headline: form.headline.trim() || undefined,
        bio: form.bio.trim() || undefined,
        expertise: form.expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolioUrls: form.portfolioUrls
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        payoutCountry: form.payoutCountry,
        motivation: form.motivation.trim() || undefined,
      });
      showToast("Application submitted — we'll review it shortly", "success");
      onSubmitted();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not submit application", "error");
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full bg-[#0f1424] border border-[#232a45] rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 transition-colors";
  const label = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Become a creator</h1>
        <p className="text-gray-400 mt-2">
          Publish your own courses and earn <strong className="text-cyan-400">70%</strong> of
          every sale. Applications are reviewed by our team.
        </p>
      </div>

      {isRejected && profile.review?.reason && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">
                Your previous application wasn't approved
              </p>
              <p className="text-sm text-red-200/80 mt-1">{profile.review.reason}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className={label}>
            Display name <span className="text-red-400">*</span>
          </label>
          <input
            className={field}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="How your name appears on courses"
            maxLength={60}
          />
        </div>

        <div>
          <label className={label}>Headline</label>
          <input
            className={field}
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="Senior backend engineer · 8 years Python"
            maxLength={120}
          />
        </div>

        <div>
          <label className={label}>About you</label>
          <textarea
            className={`${field} min-h-[110px] resize-y`}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Your background and what you want to teach"
            maxLength={1500}
          />
        </div>

        <div>
          <label className={label}>Areas of expertise</label>
          <input
            className={field}
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
            placeholder="Python, Data structures, Web APIs"
          />
          <p className="text-xs text-gray-500 mt-1">Comma separated</p>
        </div>

        <div>
          <label className={label}>Links to your work</label>
          <textarea
            className={`${field} min-h-[80px] resize-y font-mono text-sm`}
            value={form.portfolioUrls}
            onChange={(e) => setForm({ ...form, portfolioUrls: e.target.value })}
            placeholder={"https://github.com/you\nhttps://yourblog.dev"}
          />
          <p className="text-xs text-gray-500 mt-1">
            One per line. This is the main thing reviewers look at.
          </p>
        </div>

        <div>
          <label className={label}>
            Payout country <span className="text-red-400">*</span>
          </label>
          <select
            className={field}
            value={form.payoutCountry}
            onChange={(e) => setForm({ ...form, payoutCountry: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-amber-400/80 mt-1">
            Stripe cannot change this later — pick where you'll be paid.
          </p>
        </div>

        <div>
          <label className={label}>Why do you want to teach here?</label>
          <textarea
            className={`${field} min-h-[90px] resize-y`}
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            maxLength={1000}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit application
            </>
          )}
        </button>
      </form>
    </div>
  );
}
