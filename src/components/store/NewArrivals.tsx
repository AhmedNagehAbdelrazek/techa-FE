import { getProducts } from "@/lib/api/products";
import { SectionHeader } from "@/components/store/SectionHeader";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export async function NewArrivals() {
  let result;
  try {
    result = await getProducts({ sort: "newest", limit: 8 });
  } catch {
    return <ErrorState title="Failed to load new arrivals" />;
  }

  const products = result.data;

  if (!products || products.length === 0) {
    return (
      <section>
        <SectionHeader title="New Arrivals" />
        <EmptyState title="No new arrivals available" />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="New Arrivals" href="/search?sort=newest" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function NewArrivalsSkeleton() {
  return (
    <section>
      <SectionHeader title="New Arrivals" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
