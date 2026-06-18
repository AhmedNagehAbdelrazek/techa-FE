import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  variant?: "spinner" | "skeleton";
  label?: string;
}

export function LoadingState({
  className,
  variant = "spinner",
  label,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)} role="status" aria-label={label ?? "Loading"}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <span className="sr-only">{label ?? "Loading..."}</span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center p-8", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">{label ?? "Loading..."}</span>
    </div>
  );
}
