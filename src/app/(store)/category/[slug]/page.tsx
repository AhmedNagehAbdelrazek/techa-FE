import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { ProductGrid, ProductGridSkeleton } from "@/components/store/ProductGrid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} - Techa`,
    description: `Browse ${category.name} products`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{category.name}</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid categorySlug={slug} />
      </Suspense>
    </div>
  );
}
