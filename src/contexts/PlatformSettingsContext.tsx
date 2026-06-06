// PlatformSettingsProvider — fetches public platform settings once on mount,
// applies them to the document (title, CSS variables, data-theme attribute)
// and exposes them via useSettings() so any component can branch on flags.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface FeatureFlags {
  registrationOpen: boolean;
  googleOAuth: boolean;
  githubOAuth: boolean;
  aiAssistantEnabled: boolean;
  discussionsEnabled: boolean;
  gamificationEnabled: boolean;
  certificatesEnabled: boolean;
}

export interface PublicSettings {
  siteName: string;
  defaultTheme: "dark" | "light" | "system";
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  features: FeatureFlags;
  update: {
    bannerEnabled: boolean;
    latestVersion: string;
    releaseNotes: string;
  };
  maintenance: { enabled: boolean; message: string };
}

const DEFAULTS: PublicSettings = {
  siteName: "LearnCode AI",
  defaultTheme: "dark",
  primaryColor: "#8b5cf6",
  accentColor: "#00b4d8",
  logoUrl: "",
  features: {
    registrationOpen: true,
    googleOAuth: true,
    githubOAuth: true,
    aiAssistantEnabled: true,
    discussionsEnabled: true,
    gamificationEnabled: true,
    certificatesEnabled: true,
  },
  update: { bannerEnabled: false, latestVersion: "", releaseNotes: "" },
  maintenance: { enabled: false, message: "" },
};

interface Ctx {
  settings: PublicSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<Ctx>({
  settings: DEFAULTS,
  loading: true,
  refresh: async () => {},
});

// Apply visual settings to the DOM. Idempotent — safe to call repeatedly.
const applyToDocument = (s: PublicSettings) => {
  // Document title — used by the browser tab + bookmarks
  if (typeof document !== "undefined") {
    document.title = s.siteName;
    // CSS variables let buttons / borders react to admin-chosen colors
    const root = document.documentElement;
    root.style.setProperty("--primary-color", s.primaryColor);
    root.style.setProperty("--accent-color", s.accentColor);
    // Theme attribute — additional CSS in index.css can target [data-theme="light"]
    const theme =
      s.defaultTheme === "system"
        ? window.matchMedia?.("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : s.defaultTheme;
    root.setAttribute("data-theme", theme);
  }
};

export const PlatformSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const cacheKey = "platformSettingsCache_v1";
  // Cache lasts 5 min — keeps the UI snappy without spamming the API.
  const lastFetchRef = useRef(0);

  const refresh = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/public`, {
        credentials: "omit",
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json?.success && json.data) {
        const merged: PublicSettings = { ...DEFAULTS, ...json.data };
        setSettings(merged);
        applyToDocument(merged);
        localStorage.setItem(cacheKey, JSON.stringify(merged));
        lastFetchRef.current = Date.now();
      }
    } catch (err) {
      console.warn("platform settings fetch failed — using defaults", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bootstrap from cache so the visible colors don't flash to default
    // before the network call completes.
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as PublicSettings;
        setSettings(parsed);
        applyToDocument(parsed);
      }
    } catch {
      /* ignore */
    }
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading]);
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

// Convenience hook for the common pattern of "render only if X feature is enabled"
export const useFeatureFlag = (flag: keyof FeatureFlags) => {
  const { settings } = useSettings();
  return settings.features[flag];
};
