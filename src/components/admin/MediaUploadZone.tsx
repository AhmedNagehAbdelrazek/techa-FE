"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { uploadMedia, adminBannerSettingsKeys } from "@/lib/api/admin-banners-settings-media";

//   minimal upload zone — no drag-and-drop, just a styled file input
export function MediaUploadZoneSkeleton() {
  return null;
}

export function MediaUploadZone() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (files: File[]) => uploadMedia(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerSettingsKeys.media() });
      toast.success("Files uploaded");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const fileArray = Array.from(files);
    setIsUploading(true);
    try {
      await mutation.mutateAsync(fileArray);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {isUploading ? (
          "Uploading..."
        ) : (
          <span className="flex flex-col items-center gap-1">
            <Upload className="size-5" />
            Click to upload images
          </span>
        )}
      </button>
    </div>
  );
}
