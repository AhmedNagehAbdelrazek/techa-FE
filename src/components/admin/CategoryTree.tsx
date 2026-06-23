"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";

import {
  getAdminCategories,
  deactivateAdminCategory,
  adminTaxonomyKeys,
  type AdminCategory,
} from "@/lib/api/admin-taxonomy";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function CategoryTreeSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

interface CategoryTreeProps {
  onEdit: (category: AdminCategory) => void;
  onAddSubcategory: (parentId: string) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function CategoryTree({ onEdit, onAddSubcategory }: CategoryTreeProps) {
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["categories"]?.includes("update") ?? false;
  const canDelete = permissions["categories"]?.includes("delete") ?? false;
  const canCreate = permissions["categories"]?.includes("create") ?? false;

  const { data: categories, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminTaxonomyKeys.categories(),
    queryFn: getAdminCategories,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTaxonomyKeys.categories() });
      toast.success("Category deactivated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate category");
    },
  });

  if (isLoading) return <CategoryTreeSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!categories?.length) return <EmptyState title="No categories yet." />;

  return (
    <div className="space-y-1">
      {categories.map((cat) => (
        <TreeNode
          key={cat.id}
          category={cat}
          depth={0}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreate={canCreate}
          onEdit={onEdit}
          onAddSubcategory={onAddSubcategory}
          onDeactivate={(id) => deactivateMutation.mutate(id)}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  category: AdminCategory;
  depth: number;
  canUpdate: boolean;
  canDelete: boolean;
  canCreate: boolean;
  onEdit: (category: AdminCategory) => void;
  onAddSubcategory: (parentId: string) => void;
  onDeactivate: (id: string) => void;
}

function TreeNode({
  category,
  depth,
  canUpdate,
  canDelete,
  canCreate,
  onEdit,
  onAddSubcategory,
  onDeactivate,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent group"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span className="flex-1 truncate text-sm font-medium">{category.name}</span>
        <Badge variant={category.is_active ? "default" : "secondary"} className="shrink-0">
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
        {canUpdate && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100"
            onClick={() => onEdit(category)}
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
        {canCreate && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100"
            onClick={() => onAddSubcategory(category.id)}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
        {canDelete && category.is_active && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate category?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate &ldquo;{category.name}&rdquo; and all its subcategories.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeactivate(category.id)}>
                  Deactivate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              depth={depth + 1}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canCreate={canCreate}
              onEdit={onEdit}
              onAddSubcategory={onAddSubcategory}
              onDeactivate={onDeactivate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
