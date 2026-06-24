"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { TagsList } from "@/components/admin/TagsList";

export default function AdminTagsPage() {
  const { t } = useTranslation();
  useEffect(() => { document.title = "إدارة الوسوم — TechA"; }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("Tags")}</h1>
      <TagsList />
    </div>
  );
}
