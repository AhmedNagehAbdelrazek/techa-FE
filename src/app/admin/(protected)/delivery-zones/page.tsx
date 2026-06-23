"use client";

import { Suspense, useState } from "react";
import { Plus } from "lucide-react";

import { ZonesTable } from "@/components/admin/ZonesTable";
import { ZoneFormDialog } from "@/components/admin/ZoneFormDialog";
import { RateFormDialog } from "@/components/admin/RateFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminZone, AdminShippingRate } from "@/lib/api/admin-coupons-zones";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminDeliveryZonesPage() {
  return (
    <Suspense fallback={<DeliveryZonesPageSkeleton />}>
      <AdminDeliveryZonesPageContent />
    </Suspense>
  );
}

function DeliveryZonesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-28 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function AdminDeliveryZonesPageContent() {
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["zones"]?.includes("create") ?? false;

  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<AdminZone | null>(null);

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateZoneId, setRateZoneId] = useState("");
  const [editingRate, setEditingRate] = useState<AdminShippingRate | null>(null);

  function handleAddZone() {
    setEditingZone(null);
    setZoneDialogOpen(true);
  }

  function handleEditZone(zone: AdminZone) {
    setEditingZone(zone);
    setZoneDialogOpen(true);
  }

  function handleAddRate(zone: AdminZone) {
    setRateZoneId(zone.id);
    setEditingRate(null);
    setRateDialogOpen(true);
  }

  function handleEditRate(rate: AdminShippingRate) {
    setRateZoneId(rate.delivery_zone_id);
    setEditingRate(rate);
    setRateDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Zones</h1>
        {canCreate && (
          <Button onClick={handleAddZone}>
            <Plus className="size-4" />
            Add Zone
          </Button>
        )}
      </div>
      <ZonesTable
        onEditZone={handleEditZone}
        onAddRate={handleAddRate}
        onEditRate={handleEditRate}
      />
      <ZoneFormDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        initialData={editingZone}
      />
      <RateFormDialog
        open={rateDialogOpen}
        onOpenChange={setRateDialogOpen}
        zoneId={rateZoneId}
        initialData={editingRate}
      />
    </div>
  );
}
