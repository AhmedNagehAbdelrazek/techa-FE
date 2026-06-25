import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroBanner, HeroBannerSkeleton } from "@/components/store/HeroBanner";
import {
  FeaturedProducts,
  FeaturedProductsSkeleton,
} from "@/components/store/FeaturedProducts";
import {
  CategoryGrid,
  CategoryGridSkeleton,
} from "@/components/store/CategoryGrid";
import {
  NewArrivals,
  NewArrivalsSkeleton,
} from "@/components/store/NewArrivals";
import {
  MidPageBanner,
  MidPageBannerSkeleton,
} from "@/components/store/MidPageBanner";

export const metadata: Metadata = {
  title: "TechA — متجر التكنولوجيا",
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4 md:px-8 py-6">
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBanner />
      </Suspense>
      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<MidPageBannerSkeleton />}>
        <MidPageBanner />
      </Suspense>
      <Suspense fallback={<NewArrivalsSkeleton />}>
        <NewArrivals />
      </Suspense>
    </div>
  );
}
