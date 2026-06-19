import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/lib/types/category";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent",
        className,
      )}
    >
      <div className="relative aspect-square w-full max-w-[120px] overflow-hidden rounded-full">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-2xl text-muted-foreground">
              {category.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-center">{category.name}</span>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
      <Skeleton className="aspect-square w-full max-w-[120px] rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
