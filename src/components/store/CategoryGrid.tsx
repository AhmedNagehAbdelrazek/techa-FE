import { getCategoryTree } from "@/lib/api/categories";
import { SectionHeader } from "@/components/store/SectionHeader";
import { CategoryCard, CategoryCardSkeleton } from "@/components/store/CategoryCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export async function CategoryGrid() {
  let categories;
  try {
    const tree = await getCategoryTree();
    categories = tree.filter((c) => c.image_url);
  } catch {
    return <ErrorState title="Failed to load categories" />;
  }

  if (!categories || categories.length === 0) {
    return (
      <section>
        <SectionHeader title="Shop by Category" />
        <EmptyState title="No categories available" />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Shop by Category" href="/categories" />
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

export function CategoryGridSkeleton() {
  return (
    <section>
      <SectionHeader title="Shop by Category" />
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
