"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductFormAttributes() {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const detailsArray = useFieldArray({
    control,
    name: "details_attributes",
  });

  const specsArray = useFieldArray({
    control,
    name: "specs_attributes",
  });

  const aboutArray = useFieldArray({
    control,
    name: "about_points",
  });

  return (
    <div className="grid gap-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("About Points")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => aboutArray.append("")}
            disabled={aboutArray.fields.length >= 10}
          >
            <Plus className="size-3" />
            {t("Add Point")}
          </Button>
        </div>
        {aboutArray.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No about points added yet.")}</p>
        ) : (
          <div className="space-y-2">
            {aboutArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...control.register(`about_points.${index}`)}
                  placeholder={t("About point")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => aboutArray.remove(index)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("Details")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => detailsArray.append({ label: "", value: "" })}
            disabled={detailsArray.fields.length >= 20}
          >
            <Plus className="size-3" />
            {t("Add Detail")}
          </Button>
        </div>
        {detailsArray.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No details added yet.")}</p>
        ) : (
          <div className="space-y-2">
            {detailsArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...control.register(`details_attributes.${index}.label`)}
                  placeholder={t("Label")}
                  className="w-40"
                />
                <Input
                  {...control.register(`details_attributes.${index}.value`)}
                  placeholder={t("Value")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => detailsArray.remove(index)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("Specs")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => specsArray.append({ label: "", value: "" })}
            disabled={specsArray.fields.length >= 20}
          >
            <Plus className="size-3" />
            {t("Add Spec")}
          </Button>
        </div>
        {specsArray.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No specs added yet.")}</p>
        ) : (
          <div className="space-y-2">
            {specsArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...control.register(`specs_attributes.${index}.label`)}
                  placeholder={t("Label")}
                  className="w-40"
                />
                <Input
                  {...control.register(`specs_attributes.${index}.value`)}
                  placeholder={t("Value")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => specsArray.remove(index)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
