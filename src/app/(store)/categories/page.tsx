import { getCategoryTree } from "@/lib/api/categories";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التصنيفات — TechA",
};

type TreeNode = { id: string; name: string; children: TreeNode[] };

function flattenTree(node: TreeNode[], depth: number): { id: string; name: string; depth: number }[] {
  const out: { id: string; name: string; depth: number }[] = [];
  for (const cat of node) {
    out.push({ id: cat.id, name: cat.name, depth });
    if (cat.children.length) out.push(...flattenTree(cat.children, depth + 1));
  }
  return out;
}

export default async function CategoriesPage() {
  let categories;

  try {
    categories = await getCategoryTree();
    categories = flattenTree(categories, 0);
  } catch {
    return <ErrorState title="Failed to load categories" />;
  }

  if (!categories || categories.length === 0) {
    return <EmptyState title="No categories available" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
