"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

import {
  getAdminZones,
  getAdminRates,
  deactivateAdminZone,
  adminCouponZoneKeys,
  type AdminZone,
  type AdminShippingRate,
} from "@/lib/api/admin-coupons-zones";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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

export function ZonesTableSkeleton() {
  return (
    <div className="rounded-md border">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-none" />
      ))}
    </div>
  );
}

interface ZonesTableProps {
  onEditZone: (zone: AdminZone) => void;
  onAddRate: (zone: AdminZone) => void;
  onEditRate: (rate: AdminShippingRate) => void;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

function ZoneRates({
  zoneId,
  canUpdate,
  onEditRate,
}: {
  zoneId: string;
  canUpdate: boolean;
  onEditRate: (rate: AdminShippingRate) => void;
}) {
  const { t } = useTranslation();
  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: adminCouponZoneKeys.rates(zoneId),
    queryFn: () => getAdminRates(zoneId),
  });

  if (ratesLoading) return <Skeleton className="h-8 w-full" />;
  if (!ratesData?.rates.length) return <p className="py-2 text-sm text-muted-foreground">{t("No rates defined.")}</p>;

  return (
    <div className="py-2 space-y-1">
      {ratesData.rates.map((rate) => (
        <div key={rate.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-1.5 text-sm">
          <span>
            {t("{{charge}} ({{min}}–{{max}} days)", { charge: `$${rate.charge}`, min: rate.estimated_days_min, max: rate.estimated_days_max })}
            {rate.free_above_amount ? t(" — Free above {{amount}}", { amount: `$${rate.free_above_amount}` }) : ""}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={rate.is_active ? "default" : "secondary"}>
              {rate.is_active ? t("Active") : t("Inactive")}
            </Badge>
            {canUpdate && (
              <Button variant="ghost" size="icon" className="size-6" onClick={() => onEditRate(rate)}>
                <Pencil className="size-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ZonesTable({ onEditZone, onAddRate, onEditRate }: ZonesTableProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["product-sections"]?.includes("update") ?? false;
  const canDelete = permissions["product-sections"]?.includes("delete") ?? false;
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  function toggleExpand(zoneId: string) {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    }); 
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminCouponZoneKeys.zones(),
    queryFn: getAdminZones,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponZoneKeys.zones() });
      toast.success(t("Zone deactivated"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("Failed to deactivate zone"));
    },
  });

  if (isLoading) return <ZonesTableSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (!data?.zones.length) return <EmptyState title={t("No delivery zones found.")} />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>{t("Name")}</TableHead>
            <TableHead>{t("Regions")}</TableHead>
            <TableHead className="w-20">{t("Status")}</TableHead>
            {(canUpdate || canDelete) && <TableHead className="w-24">{t("Actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.zones.map((zone) => (
            <>
              <TableRow key={zone.id} className="cursor-pointer" onClick={() => toggleExpand(zone.id)}>
                <TableCell>
                  {expandedZones.has(zone.id) ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{zone.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {zone.regions.join(", ")}
                </TableCell>
                <TableCell>
                  <Badge variant={zone.is_active ? "default" : "secondary"}>
                    {zone.is_active ? t("Active") : t("Inactive")}
                  </Badge>
                </TableCell>
                {(canUpdate || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={(e) => { e.stopPropagation(); onEditZone(zone); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && zone.is_active && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t("Deactivate zone?")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("This will deactivate {{name}} and all its shipping rates.", { name: zone.name })}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deactivateMutation.mutate(zone.id)}
                              >
                                {t("Deactivate")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
              {expandedZones.has(zone.id) && (
                <TableRow key={`${zone.id}-rates`}>
                  <TableCell colSpan={5}>
                    <div className="px-2 py-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{t("Shipping Rates")}</span>
                        {canUpdate && (
                          <Button variant="outline" size="sm" onClick={() => onAddRate(zone)}>
                            <Plus className="size-3.5" />
                            {t("Add Rate")}
                          </Button>
                        )}
                      </div>
                      <ZoneRates zoneId={zone.id} canUpdate={canUpdate} onEditRate={onEditRate} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
