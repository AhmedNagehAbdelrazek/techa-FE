"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

import { getTagOptions, adminProductsKeys } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function ProductFormTags() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const selectedTags: { id: string; name: string }[] = watch("tags") ?? [];
  const [open, setOpen] = useState(false);
  const [createValue, setCreateValue] = useState("");

  const { data: allTags } = useQuery({
    queryKey: adminProductsKeys.tags,
    queryFn: getTagOptions,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const selectedIds = new Set(selectedTags.map((t) => t.id));
  const availableTags = (allTags ?? []).filter((t) => !selectedIds.has(t.id));

  const toggleTag = (tag: { id: string; name: string }) => {
    const exists = selectedTags.find((t) => t.id === tag.id);
    const newTags = exists
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag];
    setValue("tags", newTags, { shouldDirty: true });
    setOpen(false);
  };

  const removeTag = (id: string) => {
    setValue(
      "tags",
      selectedTags.filter((t) => t.id !== id),
      { shouldDirty: true },
    );
  };

  const handleCreate = () => {
    if (!createValue.trim()) return;
    const newTag = { id: createValue.trim().toLowerCase().replace(/\s+/g, "-"), name: createValue.trim() };
    setValue("tags", [...selectedTags, newTag], { shouldDirty: true });
    setCreateValue("");
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">{t("Search tags...")}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t("Search tags...")} onValueChange={setCreateValue} />
            <CommandList>
              <CommandEmpty>
                {createValue.trim() ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={handleCreate}
                  >
                    <Plus className="size-4" />
                    {t('Create "{value}"', { value: createValue.trim() })}
                  </button>
                ) : (
                  t("No tags found")
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => toggleTag(tag)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedIds.has(tag.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1">
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
