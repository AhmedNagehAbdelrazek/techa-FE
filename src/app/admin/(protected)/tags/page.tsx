"use client";

import { useEffect } from "react";
import { TagsList } from "@/components/admin/TagsList";

export default function AdminTagsPage() {
  useEffect(() => { document.title = "إدارة الوسوم — TechA"; }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tags</h1>
      <TagsList />
    </div>
  );
}
