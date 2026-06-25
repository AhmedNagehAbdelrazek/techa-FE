import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/ProductGrid";

interface SearchPageProps {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { search } = await searchParams;
  const query = search ?? "";
  return {
    title: query ? `Search: ${query} - Techa` : "Search - Techa",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { search } = await searchParams;
  const query = search ?? "";

  // if (!query.trim()) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <h1 className="mb-6 text-2xl font-bold">Search</h1>
  //       <EmptyState title="Enter a search term" description="Type a keyword to find products" />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid searchQuery={query} />
      </Suspense>
    </div>
  );
}
