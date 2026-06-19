"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Chip {
  key: string;
  label: string;
}

interface FilterChipsProps {
  chips: Chip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 px-3 py-1">
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ml-1 rounded-full hover:bg-muted-foreground/20"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
