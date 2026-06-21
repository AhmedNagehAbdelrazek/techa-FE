"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/forms/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AccountAddressForm } from "./AccountAddressForm";
import {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getDeliveryZones,
} from "@/lib/api/addresses";
import type { Address, DeliveryZone } from "@/lib/types/order";

type EditingState = { id: "new" } | { id: string } | null;

export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await listAddresses();
      setAddresses(data);
      setError(null);
    } catch {
      setError("Failed to load addresses");
      console.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchZones = useCallback(async () => {
    try {
      const data = await getDeliveryZones();
      setZones(data);
    } catch {
      console.error("Failed to load delivery zones");
    } finally {
      setIsLoadingZones(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchZones();
  }, [fetchAddresses, fetchZones]);

  async function handleCreate(data: Parameters<typeof createAddress>[0]) {
    const prev = addresses;
    const optimistic: Address = {
      id: `temp-${Date.now()}`,
      ...data,
      is_default: false,
    };
    setAddresses((curr) => [...curr, optimistic]);
    setEditing(null);

    try {
      const created = await createAddress(data);
      setAddresses((curr) => curr.map((a) => (a.id === optimistic.id ? created : a)));
      toast.success("Address added successfully!");
    } catch {
      setAddresses(prev);
      toast.error("Failed to add address. Please try again.");
    }
  }

  async function handleUpdate(id: string, data: Parameters<typeof updateAddress>[1]) {
    const prev = addresses;
    setAddresses((curr) =>
      curr.map((a) => (a.id === id ? { ...a, ...data } : a)),
    );
    setEditing(null);

    try {
      const updated = await updateAddress(id, data);
      setAddresses((curr) => curr.map((a) => (a.id === id ? updated : a)));
      toast.success("Address updated successfully!");
    } catch {
      setAddresses(prev);
      toast.error("Failed to update address. Please try again.");
    }
  }

  async function handleSetDefault(id: string) {
    const prev = addresses;
    setAddresses((curr) =>
      curr.map((a) => ({ ...a, is_default: a.id === id })),
    );

    try {
      const updated = await setDefaultAddress(id);
      setAddresses((curr) =>
        curr.map((a) => (a.id === id ? updated : { ...a, is_default: false })),
      );
      toast.success("Default address updated!");
    } catch {
      setAddresses(prev);
      toast.error("Failed to set default address. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    const prev = addresses;
    setAddresses((curr) => curr.filter((a) => a.id !== id));

    try {
      await deleteAddress(id);
      toast.success("Address deleted successfully!");
    } catch {
      setAddresses(prev);
      toast.error("Failed to delete address. Please try again.");
    }
  }

  function handleDeleteClick(addr: Address) {
    if (addr.is_default) {
      toast.error("Set another address as default first");
      return;
    }
    setConfirmDeleteId(addr.id);
  }

  if (isLoading || isLoadingZones) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading addresses">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchAddresses}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length < 10 ? (
        editing?.id === "new" ? (
          <AccountAddressForm
            zones={zones}
            onSubmit={handleCreate}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <Button
            variant="outline"
            onClick={() => setEditing({ id: "new" })}
            className="w-full"
          >
            <Plus className="size-4 ml-2" />
            Add New Address
          </Button>
        )
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Maximum 10 addresses reached
        </p>
      )}

      {addresses.length === 0 && !editing ? (
        <div className="py-12 text-center space-y-2">
          <MapPin className="size-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No addresses saved yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id}>
              {editing?.id === addr.id ? (
                <AccountAddressForm
                  zones={zones}
                  initialData={addr}
                  onSubmit={(data) => handleUpdate(addr.id, data)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {addr.label && (
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {addr.label}
                          </span>
                        )}
                        {addr.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{addr.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="text-sm text-muted-foreground">{addr.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing({ id: addr.id })}
                      aria-label={`Edit address${addr.label ? ` (${addr.label})` : ""}`}
                    >
                      <Pencil className="size-4 ml-1" />
                      Edit
                    </Button>

                    {!addr.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                        aria-label={`Set as default${addr.label ? ` (${addr.label})` : ""}`}
                      >
                        <Star className="size-4 ml-1" />
                        Set as Default
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(addr)}
                      aria-label={`Delete address${addr.label ? ` (${addr.label})` : ""}`}
                    >
                      <Trash2 className="size-4 ml-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
