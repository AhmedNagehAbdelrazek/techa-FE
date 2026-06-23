"use client";

import { MediaGrid } from "@/components/admin/MediaGrid";

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Media</h1>
      <MediaGrid />
    </div>
  );
}
