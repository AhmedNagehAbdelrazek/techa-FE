"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

interface ErrorStateProps {
  className?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  className,
  title: titleProp,
  message: messageProp,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const title = titleProp ?? t("Something went wrong");
  const message = messageProp ?? t("An unexpected error occurred. Please try again.");
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border p-8 text-center",
        className,
      )}
      role="alert"
    >
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("Try again")}
        </button>
      )}
    </div>
  );
}
