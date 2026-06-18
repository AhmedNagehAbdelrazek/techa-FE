import { cn } from "@/lib/utils";

interface EmptyStateProps {
  className?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border p-8 text-center",
        className,
      )}
    >
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
