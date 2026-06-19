import Image from "next/image";
import Link from "next/link";
import { getBanners } from "@/lib/api/banners";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export async function MidPageBanner() {
  let banners;
  try {
    banners = await getBanners("mid_page");
  } catch {
    return <ErrorState title="Failed to load banner" />;
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const banner = banners[0];

  const inner = (
    <div className="relative aspect-[21/7] w-full overflow-hidden rounded-lg">
      <Image
        src={banner.image_url}
        alt={banner.title}
        fill
        className="object-cover"
        loading="lazy"
      />
      {banner.title && (
        <div className="absolute inset-0 flex items-center bg-black/40 p-8">
          <div className="max-w-xl text-white">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              {banner.title}
            </h2>
            {banner.description && (
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                {banner.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (banner.link_url) {
    return <Link href={banner.link_url}>{inner}</Link>;
  }

  return inner;
}

export function MidPageBannerSkeleton() {
  return <Skeleton className="aspect-[21/7] w-full rounded-lg" />;
}
