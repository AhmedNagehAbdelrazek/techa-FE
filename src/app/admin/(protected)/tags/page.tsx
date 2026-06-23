"use client";

import { TagsList } from "@/components/admin/TagsList";

export default function AdminTagsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tags</h1>
      <TagsList />
    </div>
  );
}
