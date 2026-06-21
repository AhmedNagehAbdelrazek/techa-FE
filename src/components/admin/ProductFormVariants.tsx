"use client";

import { useCallback } from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface VariantFormValues {
  id?: string;
  version?: number;
  options: { option_name: string; option_value: string }[];
  sku: string;
  price: number;
  discount_percent: number;
  stock_qty: number;
  is_active: boolean;
  _destroy?: boolean;
}

export function ProductFormVariants() {
  const { control, watch, getValues } = useFormContext();

  const variantsArray = useFieldArray({
    control,
    name: "variants",
  });

  const variants: VariantFormValues[] = watch("variants") ?? [];

  const addVariant = useCallback(() => {
    variantsArray.append({
      options: [{ option_name: "", option_value: "" }],
      sku: "",
      price: 0,
      discount_percent: 0,
      stock_qty: 0,
      is_active: true,
    });
  }, [variantsArray]);

  const addOption = useCallback(
    (variantIndex: number) => {
      const currentOptions = getValues(`variants.${variantIndex}.options`) ?? [];
      if (currentOptions.length >= 10) {
        toast.error("Maximum 10 options per variant");
        return;
      }
      variantsArray.update(variantIndex, {
        ...getValues(`variants.${variantIndex}`),
        options: [...currentOptions, { option_name: "", option_value: "" }],
      });
    },
    [variantsArray, getValues],
  );

  const removeOption = useCallback(
    (variantIndex: number, optionIndex: number) => {
      const currentOptions = getValues(`variants.${variantIndex}.options`) ?? [];
      if (currentOptions.length <= 1) return;
      variantsArray.update(variantIndex, {
        ...getValues(`variants.${variantIndex}`),
        options: currentOptions.filter((_: unknown, i: number) => i !== optionIndex),
      });
    },
    [variantsArray, getValues],
  );

  const removeVariant = useCallback(
    (index: number) => {
      const variant = variants[index];
      if (variant.id) {
        variantsArray.update(index, { ...variant, _destroy: true });
      } else {
        variantsArray.remove(index);
      }
    },
    [variantsArray, variants],
  );

  const getOptionCombinationKey = useCallback(
    (variantIndex: number): string => {
      const current = variants[variantIndex];
      if (!current || !current.options) return "";
      return current.options
        .map((o) => `${o.option_name}:${o.option_value}`)
        .sort()
        .join("|");
    },
    [variants],
  );

  const visibleVariants = variants.filter((v) => !v._destroy);
  const activeCombinations = new Map<string, number>();
  visibleVariants.forEach((v) => {
    const key = getOptionCombinationKey(variants.indexOf(v));
    if (key) {
      if (activeCombinations.has(key)) {
        activeCombinations.set(key, activeCombinations.get(key)! + 1);
      } else {
        activeCombinations.set(key, 1);
      }
    }
  });

  return (
    <div className="space-y-6">
      {visibleVariants.length === 0 && (
        <p className="text-sm text-muted-foreground">No variants added yet.</p>
      )}

      {variants.map((variant, index) => {
        if (variant._destroy) return null;
        const comboKey = getOptionCombinationKey(index);
        const comboCount = activeCombinations.get(comboKey) ?? 0;
        const isDuplicated = comboKey && comboCount > 1;

        return (
          <div
            key={index}
            className="rounded-md border p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Variant {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => removeVariant(index)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>

            {variant.id && (
              <input type="hidden" {...control.register(`variants.${index}.id`)} />
            )}
            {variant.version !== undefined && (
              <input type="hidden" {...control.register(`variants.${index}.version`)} />
            )}
            <input type="hidden" {...control.register(`variants.${index}._destroy`)} />

            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Options</Label>
                {variant.options?.map((_, optIndex) => (
                  <div key={optIndex} className="mb-1 flex items-center gap-2">
                    <Input
                      {...control.register(`variants.${index}.options.${optIndex}.option_name`)}
                      placeholder="Name (e.g. Color)"
                      className="w-36"
                    />
                    <Input
                      {...control.register(`variants.${index}.options.${optIndex}.option_value`)}
                      placeholder="Value (e.g. Red)"
                      className="w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeOption(index, optIndex)}
                      disabled={(variant.options?.length ?? 0) <= 1}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => addOption(index)}
                >
                  <Plus className="size-3" />
                  Add Option
                </Button>
              </div>

              {isDuplicated && (
                <p className="text-xs text-destructive">
                  Duplicate option combination detected
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">SKU</Label>
                  <Input
                    {...control.register(`variants.${index}.sku`)}
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...control.register(`variants.${index}.price`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Discount %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...control.register(`variants.${index}.discount_percent`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...control.register(`variants.${index}.stock_qty`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Controller
                control={control}
                name={`variants.${index}.is_active`}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                    <Label className="text-sm">Active</Label>
                  </div>
                )}
              />
            </div>
          </div>
        );
      })}

      {variants.length < 20 && (
        <Button type="button" variant="outline" onClick={addVariant}>
          <Plus className="size-4" />
          Add Variant
        </Button>
      )}
    </div>
  );
}
