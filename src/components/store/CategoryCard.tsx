import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Shirt, Home, Gamepad2, Dumbbell, Refrigerator } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
  };
  className?: string;
}

const iconMap: Record<string, typeof Monitor> = {
  electronics: Monitor,
  clothing: Shirt,
  home: Home,
  gaming: Gamepad2,
  fitness: Dumbbell,
  appliances: Refrigerator,
};

function getCategoryIcon(name: string) {
  const key = name.toLowerCase();
  const Icon = iconMap[key];
  return Icon ?? Monitor;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.name);

  return (
    <Link
      href={`/search?category=${category.id}`}
      className={cn(
        "flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-muted transition-colors group",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <span className="text-xs font-semibold text-center text-foreground">{category.name}</span>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg">
      <Skeleton className="w-14 h-14 rounded-full mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
