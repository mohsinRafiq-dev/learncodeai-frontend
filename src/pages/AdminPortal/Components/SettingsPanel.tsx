import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";

interface FeatureFlags {
  registrationOpen: boolean;
  googleOAuth: boolean;
  githubOAuth: boolean;
  aiAssistantEnabled: boolean;
  discussionsEnabled: boolean;
  gamificationEnabled: boolean;
  certificatesEnabled: boolean;
}

interface PlatformSettings {
  siteName: string;
  defaultTheme: "dark" | "light" | "system";
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  features: FeatureFlags;
  maintenance: { enabled: boolean; message: string };
  update: {
    currentVersion: string;
    latestVersion: string;
    releaseNotes: string;
    bannerEnabled: boolean;
  };
  execution: {
    memoryLimitMb: number;
    cpuLimit: number;
    timeoutSeconds: number;
  };
}

const FEATURE_LABELS: Record<keyof FeatureFlags, string> = {
  registrationOpen: "Open Registration",
  googleOAuth: "Google OAuth",
  githubOAuth: "GitHub OAuth",
  aiAssistantEnabled: "AI Assistant",
  discussionsEnabled: "Discussions",
  gamificationEnabled: "Gamification",
  certificatesEnabled: "Certificates",
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    adminAPI
      .getPlatformSettings()
      .then((res: { success: boolean; data: PlatformSettings }) => {
        if (res?.success) setSettings(res.data);
      })
      .catch((err: Error) =>
        setMessage({ type: "err", text: err.message || "Failed to load settings" })
      )
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateNested = <
    K extends "features" | "maintenance" | "update" | "execution",
    F extends keyof PlatformSettings[K]
  >(
    section: K,
    field: F,
    value: PlatformSettings[K][F]
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [field]: value },
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminAPI.updatePlatformSettings(
        settings as unknown as Record<string, unknown>
      );
      if (res?.success) {
        setSettings(res.data);
        setMessage({ type: "ok", text: "Settings saved." });
      } else {
        setMessage({ type: "err", text: res?.message || "Failed to save settings." });
      }
    } catch (err) {
      const e = err as Error;
      setMessage({ type: "err", text: e.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-gray-400 p-8">Unable to load platform settings.</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-sm text-gray-400 mb-1">Admin Panel / Settings</div>
            <h1 className="text-3xl font-bold text-gray-100">Platform Settings</h1>
            <p className="text-gray-400 text-sm mt-1">
              Control branding, feature toggles, and platform-wide options.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-sm font-medium flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-md text-sm ${
              message.type === "ok"
                ? "bg-green-900/30 text-green-400 border border-green-500/30"
                : "bg-red-900/30 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Branding */}
        <Section title="Branding">
          <Field label="Site Name">
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Default Theme">
            <select
              value={settings.defaultTheme}
              onChange={(e) =>
                update(
                  "defaultTheme",
                  e.target.value as PlatformSettings["defaultTheme"]
                )
              }
              className={inputCls}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </Field>
          <Field label="Primary Color">
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Accent Color">
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Logo URL" full>
            <input
              type="text"
              value={settings.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </Field>
        </Section>

        {/* Feature Toggles */}
        <Section title="Feature Toggles">
          {(Object.keys(FEATURE_LABELS) as (keyof FeatureFlags)[]).map((k) => (
            <ToggleRow
              key={k}
              label={FEATURE_LABELS[k]}
              checked={settings.features[k]}
              onChange={(v) => updateNested("features", k, v)}
            />
          ))}
        </Section>

        {/* Maintenance */}
        <Section title="Maintenance Mode">
          <ToggleRow
            label="Enable maintenance mode"
            checked={settings.maintenance.enabled}
            onChange={(v) => updateNested("maintenance", "enabled", v)}
          />
          <Field label="Maintenance Message" full>
            <textarea
              rows={3}
              value={settings.maintenance.message}
              onChange={(e) =>
                updateNested("maintenance", "message", e.target.value)
              }
              className={inputCls}
            />
          </Field>
        </Section>

        {/* Update Banner */}
        <Section title="Update Banner">
          <ToggleRow
            label="Show update banner"
            checked={settings.update.bannerEnabled}
            onChange={(v) => updateNested("update", "bannerEnabled", v)}
          />
          <Field label="Current Version">
            <input
              type="text"
              value={settings.update.currentVersion}
              onChange={(e) =>
                updateNested("update", "currentVersion", e.target.value)
              }
              className={inputCls}
            />
          </Field>
          <Field label="Latest Version">
            <input
              type="text"
              value={settings.update.latestVersion}
              onChange={(e) =>
                updateNested("update", "latestVersion", e.target.value)
              }
              className={inputCls}
            />
          </Field>
          <Field label="Release Notes" full>
            <textarea
              rows={3}
              value={settings.update.releaseNotes}
              onChange={(e) =>
                updateNested("update", "releaseNotes", e.target.value)
              }
              className={inputCls}
            />
          </Field>
        </Section>

        {/* Execution Limits */}
        <Section title="Code Execution Limits">
          <Field label="Memory Limit (MB)">
            <input
              type="number"
              value={settings.execution.memoryLimitMb}
              onChange={(e) =>
                updateNested(
                  "execution",
                  "memoryLimitMb",
                  Number(e.target.value)
                )
              }
              className={inputCls}
            />
          </Field>
          <Field label="CPU Limit (cores)">
            <input
              type="number"
              step="0.1"
              value={settings.execution.cpuLimit}
              onChange={(e) =>
                updateNested("execution", "cpuLimit", Number(e.target.value))
              }
              className={inputCls}
            />
          </Field>
          <Field label="Timeout (seconds)">
            <input
              type="number"
              value={settings.execution.timeoutSeconds}
              onChange={(e) =>
                updateNested(
                  "execution",
                  "timeoutSeconds",
                  Number(e.target.value)
                )
              }
              className={inputCls}
            />
          </Field>
        </Section>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg p-6 mb-6">
      <h2 className="text-white font-semibold text-lg mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between md:col-span-2 px-1 py-2 cursor-pointer">
      <span className="text-sm text-gray-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-[#2a3050]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}
