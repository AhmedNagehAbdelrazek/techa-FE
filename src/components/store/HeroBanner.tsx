import { getBanners } from "@/lib/api/banners";
import { HeroBannerCarousel } from "./HeroBannerCarousel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export async function HeroBanner() {
  let banners;
  try {
    banners = await getBanners("hero");
  } catch (e){
    console.error(e);
    return <ErrorState title="Failed to load banners" />;
  }

  if (!banners || banners.length === 0) {
    return <EmptyState title="No banners available" />;
  }

  return <HeroBannerCarousel banners={banners} />;
}

export function HeroBannerSkeleton() {
  return (
    <Skeleton className="aspect-[21/9] w-full rounded-lg" />
  );
}
