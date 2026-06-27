"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const DIGITS = 6;

export function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(DIGITS).fill("")).slice(0, DIGITS);

  function handleChange(idx: number, char: string) {
    if (!/^\d$/.test(char)) return;
    const next = value.slice(0, idx) + char + value.slice(idx + 1);
    onChange(next.slice(0, DIGITS));
    if (idx < DIGITS - 1) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      onChange(value.slice(0, idx - 1) + value.slice(idx));
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < DIGITS - 1) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, DIGITS);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, DIGITS - 1);
      refs.current[nextFocus]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length: DIGITS }).map((_, idx) => (
        <Input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={idx === 0 ? handlePaste : undefined}
          disabled={disabled}
          aria-label={`Digit ${idx + 1}`}
          className={cn(
            "h-12 w-12 text-center text-lg font-semibold tabular-nums",
            error && "border-destructive",
          )}
        />
      ))}
    </div>
  );
}
