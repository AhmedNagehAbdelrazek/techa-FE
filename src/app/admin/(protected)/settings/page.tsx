"use client";

import { useEffect } from "react";
import SettingsPage from "@/components/admin/SettingsPage";

export default function AdminSettingsPage() {
  useEffect(() => { document.title = "الإعدادات — TechA"; }, []);
  return <SettingsPage />;
}
