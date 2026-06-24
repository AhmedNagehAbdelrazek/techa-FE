import { getProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/store/ProductCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التخفيضات — TechA",
};

export default async function SalesPage() {
  let result;
  try {
    result = await getProducts({ has_discount: true, limit: 50 });
  } catch {
    return <ErrorState title="Failed to load sales" />;
  }

  if (!result.data || result.data.length === 0) {
    return <EmptyState title="No deals available right now" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Sales & Deals</h1>
      <p className="mb-8 text-muted-foreground">Discounted products available for a limited time</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {result.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
