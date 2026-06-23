"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getSettings, updateSettings, adminBannerSettingsKeys, uploadMedia, type Setting } from "@/lib/api/admin-banners-settings-media";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { SettingsGroup } from "./SettingsGroup";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

function SettingsGroupsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <SettingsGroupsSkeleton />
    </div>
  );
}

export default function SettingsPage() {
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["settings"]?.includes("update") ?? false;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminBannerSettingsKeys.settings(),
    queryFn: getSettings,
  });

  // ponytail: mutable values in local state — no form library, no zod validation for settings
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});

  // Sync values when data loads
  const initialValuesRef = useRef<string | null>(null);
  if (data && initialValuesRef.current !== JSON.stringify(data.data)) {
    initialValuesRef.current = JSON.stringify(data.data);
    const merged: Record<string, string | number | boolean> = {};
    Object.values(data.data).flat().forEach((s) => {
      merged[s.key] = s.value;
    });
    setValues(merged);
  }

  const handleChange = useCallback((key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveMutation = useMutation({
    mutationFn: () => updateSettings({ settings: values }),
    onSuccess: () => {
      initialValuesRef.current = null; // force re-sync on next load
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save settings"),
  });

  // ponytail: inline image upload via hidden file input
  const handleUploadImage = useCallback(
    async (key: string) => {
      setUploadingKey(key);
      fileInputRef.current?.click();
    },
    [],
  );

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadingKey) return;
    try {
      const res = await uploadMedia([file]);
      const url = res.data[0].url;
      setValues((prev) => ({ ...prev, [uploadingKey!]: url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
      // reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (isLoading) return <SettingsPageSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;

  const groups = data?.data ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {canUpdate && (
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {Object.entries(groups).map(([groupName, groupSettings]) => (
          <SettingsGroup
            key={groupName}
            title={groupName}
            settings={groupSettings as Setting[]}
            values={values}
            onChange={handleChange}
            onUploadImage={handleUploadImage}
          />
        ))}
      </div>
      {/* ponytail: hidden file input for inline image upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileSelected} />
    </div>
  );
}
