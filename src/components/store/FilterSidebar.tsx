import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterSidebar({ children, className }: FilterSidebarProps) {
  return (
    <aside className={cn("w-64 shrink-0", className)}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {children}
      </div>
    </aside>
  );
}
