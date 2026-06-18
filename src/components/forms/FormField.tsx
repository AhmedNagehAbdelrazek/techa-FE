"use client";

import { useId, type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required }: FormFieldProps) {
  const id = useId();

  return (
    <div className="space-y-2" role="group">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}
      </label>
      <div aria-describedby={error ? `${id}-error` : undefined}>{children}</div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
