import { getProducts } from "@/lib/api/products";
import { SectionHeader } from "@/components/store/SectionHeader";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export async function FeaturedProducts() {
  let result;
  try {
    result = await getProducts({ is_featured: true, limit: 8 });
  } catch {
    return <ErrorState title="Failed to load featured products" />;
  }

  const products = result.data;

  if (!products || products.length === 0) {
    return (
      <section>
        <SectionHeader title="Featured Products" />
        <EmptyState title="No featured products available" />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Featured Products" href="/products?featured=true" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section>
      <SectionHeader title="Featured Products" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
