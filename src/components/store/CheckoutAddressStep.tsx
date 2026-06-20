"use client";

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { listAddresses, createAddress, getDeliveryZones } from "@/lib/api/addresses";
import type { Address, DeliveryZone, CreateAddressRequest } from "@/lib/types/order";

interface CheckoutAddressStepProps {
  addresses: Address[];
  selectedAddressId: string | null;
  isAddingNewAddress: boolean;
  onUpdate: (patch: Record<string, unknown>) => void;
  onContinue: () => void;
}

export function CheckoutAddressStep({
  addresses,
  selectedAddressId,
  isAddingNewAddress,
  onUpdate,
  onContinue,
}: CheckoutAddressStepProps) {
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    zone_id: "",
    label: "",
    building: "",
    apartment: "",
    landmark: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      try {
        setZonesLoading(true);
        const [addrList, zoneList] = await Promise.all([
          listAddresses(),
          getDeliveryZones(),
        ]);
        onUpdate({ addresses: addrList });
        setZones(zoneList);

        if (addrList.length > 0) {
          const defaultAddr = addrList.find((a) => a.is_default);
          onUpdate({
            selectedAddressId: defaultAddr ? defaultAddr.id : addrList[0].id,
          });
        }
      } catch {
        toast.error("Failed to load addresses");
      } finally {
        setLoading(false);
        setZonesLoading(false);
      }
    }
    load();
  }, [onUpdate]);

  async function handleCreateAddress() {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.zone_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      toast.error("Please enter a valid Egyptian phone number (11 digits starting with 01)");
      return;
    }

    setSaving(true);
    try {
      const created = await createAddress(newAddress);
      const updatedAddresses = [...addresses, created];
      onUpdate({
        addresses: updatedAddresses,
        selectedAddressId: created.id,
        isAddingNewAddress: false,
      });
      setNewAddress({
        full_name: "",
        phone: "",
        street: "",
        city: "",
        zone_id: "",
        label: "",
        building: "",
        apartment: "",
        landmark: "",
        notes: "",
      });
      toast.success("Address added successfully");
    } catch {
      toast.error("Failed to create address");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-12 w-32" />
      </div>
    );
  }

  if (addresses.length === 0 && !isAddingNewAddress) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No saved addresses found. Please add a delivery address.
          </p>
          <Button
            className="mt-4"
            onClick={() => onUpdate({ isAddingNewAddress: true })}
          >
            Add Address
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Delivery Address</h2>

      {addresses.length > 0 && (
        <RadioGroup
          value={selectedAddressId ?? ""}
          onValueChange={(value) => onUpdate({ selectedAddressId: value })}
        >
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary"
            >
              <RadioGroupItem value={addr.id} className="mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-medium">{addr.full_name}</div>
                <div className="text-muted-foreground">{addr.street}</div>
                <div className="text-muted-foreground">
                  {addr.city}
                  {addr.building ? `, Building ${addr.building}` : ""}
                  {addr.apartment ? `, Apt ${addr.apartment}` : ""}
                </div>
                <div className="text-muted-foreground">{addr.phone}</div>
                {addr.is_default && (
                  <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Default
                  </span>
                )}
              </div>
            </label>
          ))}
        </RadioGroup>
      )}

      {!isAddingNewAddress ? (
        <Button
          variant="outline"
          onClick={() => onUpdate({ isAddingNewAddress: true })}
        >
          + Add New Address
        </Button>
      ) : (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">New Address</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                value={newAddress.full_name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, full_name: e.target.value })
                }
                placeholder="Recipient name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone *</label>
              <Input
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                placeholder="01000000000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">City *</label>
              <Input
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                placeholder="City"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Street *</label>
              <Input
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, street: e.target.value })
                }
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery Zone *</label>
              {zonesLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                  value={newAddress.zone_id}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, zone_id: e.target.value })
                  }
                >
                  <option value="">Select zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Label</label>
              <Input
                value={newAddress.label ?? ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value || undefined })
                }
                placeholder="Home, Work, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Building</label>
              <Input
                value={newAddress.building ?? ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, building: e.target.value || undefined })
                }
                placeholder="Building name/number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Apartment</label>
              <Input
                value={newAddress.apartment ?? ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, apartment: e.target.value || undefined })
                }
                placeholder="Apartment number"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Landmark</label>
              <Input
                value={newAddress.landmark ?? ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, landmark: e.target.value || undefined })
                }
                placeholder="Nearby landmark"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Delivery Notes</label>
              <Input
                value={newAddress.notes ?? ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, notes: e.target.value || undefined })
                }
                placeholder="Any special instructions"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateAddress}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Select"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onUpdate({ isAddingNewAddress: false })}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <Button
          onClick={onContinue}
          disabled={!selectedAddressId}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
