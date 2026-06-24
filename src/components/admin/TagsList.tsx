"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import {
  getAdminTags,
  createAdminTag,
  updateAdminTag,
  deleteAdminTag,
  adminTaxonomyKeys,
  type AdminTag,
} from "@/lib/api/admin-taxonomy";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TagsListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

interface TagsListProps {
  onEdit?: (tag: AdminTag) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function TagsList(_props: TagsListProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["tags"]?.includes("create") ?? false;
  const canUpdate = permissions["tags"]?.includes("update") ?? false;
  const canDelete = permissions["tags"]?.includes("delete") ?? false;

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tags, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminTaxonomyKeys.tags(),
    queryFn: getAdminTags,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const slug = newName.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, "");
      return createAdminTag({ name: newName.trim(), slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.tags() });
      setNewName("");
      toast.success(t("Tag created"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to create tag"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, "");
      return updateAdminTag(id, { name, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.tags() });
      setEditingId(null);
      toast.success(t("Tag updated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to update tag"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.tags() });
      toast.success(t("Tag deleted"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to delete tag"));
    },
  });

  const startEdit = useCallback((tag: AdminTag) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      updateMutation.mutate({ id: editingId, name: editValue.trim() });
    } else {
      setEditingId(null);
    }
  }, [editingId, editValue, updateMutation]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  if (isLoading) return <TagsListSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("New tag name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) createMutation.mutate();
            }}
            className="max-w-sm"
          />
          <Button
            size="sm"
            disabled={!newName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="size-4" />
            {t("Add")}
          </Button>
        </div>
      )}
      {!tags?.length ? (
        <EmptyState title={t("No tags yet.")} />
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 rounded-md border px-4 py-2.5"
            >
              {editingId === tag.id ? (
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="max-w-xs"
                />
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">{tag.slug}</span>
                </>
              )}
              <div className="flex items-center gap-1">
                {canUpdate && editingId !== tag.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => startEdit(tag)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                )}
                {canDelete && editingId !== tag.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("Delete tag?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("This will permanently delete {{name}}.", { name: tag.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(tag.id)}>
                          {t("Delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
