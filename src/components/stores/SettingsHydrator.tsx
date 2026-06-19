"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settings.store";

interface SettingsHydratorProps {
  siteName: string;
  logoUrl: string | null;
  currencyCode: string;
  currencySymbol: string;
  socialLinks: Record<string, string>;
  supportEmail: string | null;
  supportPhone: string | null;
}

export function SettingsHydrator(settings: SettingsHydratorProps) {
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    setSettings(settings);
  }, [setSettings, settings]);

  return null;
}
