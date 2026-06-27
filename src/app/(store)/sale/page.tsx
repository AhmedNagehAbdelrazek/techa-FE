import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/ProductGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales & Deals — TechA",
};

export default function SalesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Sales & Deals</h1>
      <p className="mb-8 text-muted-foreground">Discounted products available for a limited time</p>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid onSale />
      </Suspense>
    </div>
  );
}
