// Site-wide banner shown when admin enables it from Settings → Update Banner.
// Dismissible per browser via localStorage so users aren't pestered.

import React, { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { useSettings } from "../../contexts/PlatformSettingsContext";

const UpdateBanner: React.FC = () => {
  const { settings } = useSettings();
  const dismissKey = `updateBannerDismissed:${settings.update.latestVersion}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(dismissKey) === "1";
    } catch {
      return false;
    }
  });

  if (!settings.update.bannerEnabled) return null;
  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-start gap-3">
        <Megaphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {settings.update.latestVersion && (
            <span className="font-semibold mr-2">
              v{settings.update.latestVersion}
            </span>
          )}
          <span className="opacity-95">
            {settings.update.releaseNotes || "New update available."}
          </span>
        </div>
        <button
          onClick={dismiss}
          className="opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
