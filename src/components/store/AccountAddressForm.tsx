"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { Select } from "@/components/forms/Select";
import { FormField } from "@/components/forms/FormField";
import type { Address, DeliveryZone } from "@/lib/types/order";

const addressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  zone_id: z.string().min(1, "Delivery zone is required"),
  label: z.string().optional(),
  building: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  notes: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AccountAddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>;
  initialData?: Address;
  onCancel: () => void;
  zones: DeliveryZone[];
}

export function AccountAddressForm({
  onSubmit,
  initialData,
  onCancel,
  zones,
}: AccountAddressFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData
      ? {
          full_name: initialData.full_name,
          phone: initialData.phone,
          street: initialData.street,
          city: initialData.city,
          zone_id: initialData.zone_id,
          label: initialData.label ?? "",
          building: initialData.building ?? "",
          apartment: initialData.apartment ?? "",
          landmark: initialData.landmark ?? "",
          notes: initialData.notes ?? "",
        }
      : {
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
        },
  });

  const watchZoneId = watch("zone_id");
  const selectedZone = zones.find((z) => z.id === watchZoneId);
  const cityOptions = selectedZone?.regions.map((r) => ({ value: r, label: r })) ?? [];

  useEffect(() => {
    if (!selectedZone?.regions.includes(getValues("city") ?? "")) {
      setValue("city", "");
    }
  }, [watchZoneId, selectedZone, setValue, getValues]);

  const zoneOptions = zones.map((z) => ({
    value: z.id,
    label: z.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <h3 className="font-medium text-sm">
        {isEditing ? "Edit Address" : "New Address"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full Name" error={errors.full_name?.message} required>
          <Input
            {...register("full_name")}
            placeholder="Ahmed Ali"
            aria-label="Full Name"
            error={!!errors.full_name}
          />
        </FormField>

        <FormField label="Phone" error={errors.phone?.message} required>
          <Input
            {...register("phone")}
            type="tel"
            placeholder="+966501234567"
            aria-label="Phone"
            error={!!errors.phone}
          />
        </FormField>
      </div>

      <FormField label="Label (optional)" error={errors.label?.message}>
        <Input
          {...register("label")}
          placeholder="Home / Work"
          aria-label="Address label"
          error={!!errors.label}
        />
      </FormField>

      <FormField label="Street" error={errors.street?.message} required>
        <Input
          {...register("street")}
          placeholder="Street name and number"
          aria-label="Street"
          error={!!errors.street}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="City" error={errors.city?.message} required>
          <Select
            {...register("city")}
            options={[
              { value: "", label: cityOptions.length ? "Select a city..." : "Select a delivery zone first" },
              ...cityOptions,
            ]}
            disabled={cityOptions.length === 0}
            error={!!errors.city}
            aria-label="City"
          />
        </FormField>

        <FormField label="Delivery Zone" error={errors.zone_id?.message} required>
          <Select
            {...register("zone_id")}
            options={[{ value: "", label: "Select a zone..." }, ...zoneOptions]}
            error={!!errors.zone_id}
            aria-label="Delivery Zone"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Building (optional)" error={errors.building?.message}>
          <Input
            {...register("building")}
            placeholder="Building number"
            aria-label="Building"
            error={!!errors.building}
          />
        </FormField>

        <FormField label="Apartment (optional)" error={errors.apartment?.message}>
          <Input
            {...register("apartment")}
            placeholder="Apartment number"
            aria-label="Apartment"
            error={!!errors.apartment}
          />
        </FormField>
      </div>

      <FormField label="Landmark (optional)" error={errors.landmark?.message}>
        <Input
          {...register("landmark")}
          placeholder="Nearby landmark"
          aria-label="Landmark"
          error={!!errors.landmark}
        />
      </FormField>

      <FormField label="Notes (optional)" error={errors.notes?.message}>
        <Input
          {...register("notes")}
          placeholder="Delivery instructions"
          aria-label="Notes"
          error={!!errors.notes}
        />
      </FormField>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Address"
              : "Add Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
