"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import {
  getProducts,
  getCategoryOptions,
  getBrandOptions,
  deleteProduct,
  bulkUpdateProducts,
  adminProductsKeys,
  type AdminProductListParams,
  type AdminProductListItem,
} from "@/lib/api/admin-products";
import { useAdminStore } from "@/lib/stores/admin.store";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-md border">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

interface ProductsTableProps {
  searchParams: {
    search?: string;
    category_id?: string;
    brand_id?: string;
    is_active?: string;
    page?: string;
  };
}

export function ProductsTable({ searchParams }: ProductsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? {});
  const canUpdate = permissions["products"]?.includes("update") ?? false;
  const canDelete = permissions["products"]?.includes("delete") ?? false;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filters: AdminProductListParams = {
    search: searchParams.search || "",
    category_id: searchParams.category_id || "",
    brand_id: searchParams.brand_id || "",
    is_active: searchParams.is_active || "",
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 20,
  };

  const { data: listData, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminProductsKeys.list(filters),
    queryFn: () => getProducts(filters),
  });

  const { data: categoryOptions } = useQuery({
    queryKey: adminProductsKeys.categories,
    queryFn: getCategoryOptions,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: brandOptions } = useQuery({
    queryKey: adminProductsKeys.brands,
    queryFn: getBrandOptions,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() });
      toast.success("Product deactivated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate product");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: "activate" | "deactivate" }) =>
      bulkUpdateProducts(ids, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() });
      setSelectedIds(new Set());
      toast.success("Bulk update completed");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Bulk update failed");
    },
  });

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(searchParams)) {
        if (v !== undefined) params.set(k, v);
      }
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/admin/products?${qs}` : "/admin/products", { scroll: false });
    },
    [router, searchParams],
  );

  const updateUrlParamRef = useRef(updateUrlParam);
  updateUrlParamRef.current = updateUrlParam;

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrlParamRef.current("search", searchInput || undefined);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters.page]);

  const allSelected = useMemo(() => {
    if (!listData?.data) return false;
    return listData.data.length > 0 && listData.data.every((p) => selectedIds.has(p.id));
  }, [listData, selectedIds]);

  const toggleAll = useCallback(() => {
    if (!listData?.data) return;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(listData.data.map((p) => p.id)));
    }
  }, [listData, allSelected]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const meta = listData?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? 1;

  const pageRange = useMemo(() => {
    const delta = 2;
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const clearFilters = useCallback(() => {
    router.replace("/admin/products", { scroll: false });
    setSearchInput("");
  }, [router]);

  const hasActiveFilters = !!(searchParams.search || searchParams.category_id || searchParams.brand_id || searchParams.is_active);

  if (isLoading) return <ProductsTableSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load products"
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const products = listData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={searchParams.category_id || "all"}
          onValueChange={(v) => updateUrlParam("category_id", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.brand_id || "all"}
          onValueChange={(v) => updateUrlParam("brand_id", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brandOptions?.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.is_active || "all"}
          onValueChange={(v) => updateUrlParam("is_active", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && canUpdate && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkMutation.mutate({ ids: Array.from(selectedIds), action: "activate" })}
            disabled={bulkMutation.isPending}
          >
            Activate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkMutation.mutate({ ids: Array.from(selectedIds), action: "deactivate" })}
            disabled={bulkMutation.isPending}
          >
            Deactivate
          </Button>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No products match your filters" : "No products yet"}
          description={hasActiveFilters ? "Try adjusting your search or filters." : "Add your first product to get started."}
          action={hasActiveFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="text-right">
                {canUpdate && (
                  <TableHead className="w-12">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                )}
                <TableHead className="w-12" />
                <TableHead className="text-right">Name</TableHead>
                <TableHead className="text-right">Category</TableHead>
                <TableHead className="text-right">Brand</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Status</TableHead>
                {(canUpdate || canDelete) && <TableHead className="w-32" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  onToggle={() => toggleOne(product.id)}
                  showCheckbox={canUpdate}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onDeactivate={() => deleteMutation.mutate(product.id)}
                  isDeactivating={deleteMutation.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({meta?.total ?? 0} products)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => updateUrlParam("page", String(currentPage - 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            {pageRange.map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-sm text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  className="size-8"
                  onClick={() => updateUrlParam("page", String(p))}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => updateUrlParam("page", String(currentPage + 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductRowProps {
  product: AdminProductListItem;
  selected: boolean;
  onToggle: () => void;
  showCheckbox: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onDeactivate: () => void;
  isDeactivating: boolean;
}

function ProductRow({
  product,
  selected,
  onToggle,
  showCheckbox,
  canUpdate,
  canDelete,
  onDeactivate,
  isDeactivating,
}: ProductRowProps) {
  const thumbnailUrl = product.primary_image?.url;

  const nameContent = canUpdate ? (
    <Link
      href={`/admin/products/${product.id}/edit`}
      className="font-medium hover:text-primary hover:underline"
    >
      {product.name}
    </Link>
  ) : (
    <span className="font-medium">{product.name}</span>
  );

  return (
    <TableRow>
      {showCheckbox && (
        <TableCell className="text-left ">
          <Checkbox checked={selected} onCheckedChange={onToggle} />
        </TableCell>
      )}
      <TableCell>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.primary_image?.alt_text ?? product.name}
            width={40}
            height={40}
            className="size-10 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
            N/A
          </div>
        )}
      </TableCell>
      <TableCell>{nameContent}</TableCell>
      <TableCell className="text-muted-foreground">{product.category?.name ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{product.brand?.name ?? "—"}</TableCell>
      <TableCell className="text-right">
        {product.discount_percent > 0 ? (
          <div className="flex flex-col items-start justify-between">
            <span className="text-xs text-muted-foreground line-through w-full text-left">
              {formatPrice(product.price)}
            </span>
            <span className="font-medium text-destructive">
              {formatPrice(product.price * (1 - product.discount_percent / 100))}
            </span>
          </div>
        ) : (
          <span className="font-medium">{formatPrice(product.price)}</span>
        )}
      </TableCell>
      <TableCell className="text-right">{product.stock_qty}</TableCell>
      <TableCell>
        <Badge variant={product.is_active ? "default" : "secondary"}>
          {product.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      {(canUpdate || canDelete) && (
        <TableCell>
          <div className="flex items-center gap-1">
            {canUpdate && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate product?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide &ldquo;{product.name}&rdquo; from the storefront. The product data is preserved and can be reactivated later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeactivate} disabled={isDeactivating}>
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
