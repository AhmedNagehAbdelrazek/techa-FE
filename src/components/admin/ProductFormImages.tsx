"use client";

import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";

import { uploadMedia } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";

interface ImageEntry {
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export function ProductFormImages() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const images: ImageEntry[] = watch("images") ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addImages = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const currentImages = watch("images") ?? [];
        const index = currentImages.length;
        setUploadingIndex(index);
        try {
          const result = await uploadMedia(file);
          const newImages = [
            ...(watch("images") ?? []),
            {
              url: result.url,
              alt_text: file.name,
              is_primary: currentImages.length === 0 && index === 0,
              sort_order: currentImages.length,
            },
          ];
          setValue("images", newImages, { shouldDirty: true });
        } catch {
          toast.error(t("Failed to upload: {name}", { name: file.name }));
        }
      }
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [watch, setValue, t],
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = (watch("images") ?? []).filter((_: ImageEntry, i: number) => i !== index);
      if (newImages.length > 0 && newImages.every((img: ImageEntry) => !img.is_primary)) {
        newImages[0].is_primary = true;
      }
      setValue("images", newImages, { shouldDirty: true });
    },
    [watch, setValue],
  );

  const setPrimary = useCallback(
    (index: number) => {
      const newImages = (watch("images") ?? []).map((img: ImageEntry, i: number) => ({
        ...img,
        is_primary: i === index,
      }));
      setValue("images", newImages, { shouldDirty: true });
    },
    [watch, setValue],
  );

  const moveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      const newImages = [...(watch("images") ?? [])];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= newImages.length) return;
      [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
      newImages.forEach((img: ImageEntry, i: number) => {
        img.sort_order = i;
      });
      setValue("images", newImages, { shouldDirty: true });
    },
    [watch, setValue],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingIndex !== null}
        >
          <Upload className="size-4" />
          {uploadingIndex !== null ? t("Uploading...") : t("Upload Images")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addImages(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("No images uploaded yet.")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-md border"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt_text}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              {image.is_primary && (
                <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  {t("Primary")}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-white hover:text-white"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-white hover:text-white"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === images.length - 1}
                >
                  <ArrowDown className="size-4" />
                </Button>
                {!image.is_primary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-yellow-400 hover:text-yellow-400"
                    onClick={() => setPrimary(index)}
                  >
                    <Star className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-red-400 hover:text-red-400"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
