"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import phoneCodes from "@/lib/data/phoneCodes";

interface PhoneCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

interface PhoneOption {
  value: string;
  code: string;
  name: string;
  emoji: string;
}

const options: PhoneOption[] = phoneCodes
  .filter((c) => c.name && c.phone?.[0] && c.phone[0].length > 1 && c.emoji)
  .flatMap((c) =>
    c.phone!.map((code) => ({
      value: code,
      code,
      name: c.name!,
      emoji: c.emoji!,
    })),
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export function PhoneCodeSelect({
  value,
  onChange,
  error,
}: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Country code"
          className={cn(
            "w-[130px] shrink-0 justify-between px-3",
            error && "border-destructive",
          )}
        >
          {selected ? (
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">{selected.emoji}</span>
              <span className="text-xs text-muted-foreground">
                {selected.code}
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
          <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={`${opt.name}-${opt.code}-${opt.value}`}
                  value={`${opt.name} ${opt.code}`}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="w-6 text-center text-base">
                    {opt.emoji}
                  </span>
                  <span className="w-14 shrink-0 text-xs font-mono text-muted-foreground">
                    {opt.code}
                  </span>
                  <span className="text-xs text-muted-foreground/40">|</span>
                  <span className="flex-1 truncate text-sm">{opt.name}</span>
                  {opt.value === value && (
                    <Check className="ml-auto size-4 shrink-0 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
