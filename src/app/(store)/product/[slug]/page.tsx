import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api/products";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  const primaryImage = product.images.find((i) => i.is_primary)?.url;
  return {
    title: `${product.name} - Techa`,
    description: product.description,
    openGraph: primaryImage
      ? { title: product.name, description: product.description, images: [{ url: primaryImage }] }
      : { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
