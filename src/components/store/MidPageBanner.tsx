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

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link
        href={banner.link_url ?? "#"}
        className="md:col-span-2 relative h-[250px] rounded-xl overflow-hidden bg-muted group cursor-pointer"
      >
        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent flex flex-col justify-end p-5 text-primary-foreground">
          {banner.title && (
            <span className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">{banner.title}</span>
          )}
          {banner.description && (
            <>
              <h3 className="text-xl font-semibold mb-1">{banner.description}</h3>
              <span className="text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                Shop Furniture <span className="text-lg leading-none">→</span>
              </span>
            </>
          )}
        </div>
      </Link>
      <div className="relative h-[250px] rounded-xl overflow-hidden bg-primary/10 flex flex-col justify-center items-center text-center p-5">
        <h3 className="text-lg font-bold text-primary mb-1">New Wardrobe</h3>
        <p className="text-sm text-secondary mb-3">Essentials for every day.</p>
        <button className="bg-card text-foreground text-xs font-semibold px-4 py-2 rounded hover:bg-muted transition-colors">
          Explore
        </button>
      </div>
    </section>
  );
}

export function MidPageBannerSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="md:col-span-2 h-[250px] rounded-xl" />
      <Skeleton className="h-[250px] rounded-xl" />
    </section>
  );
}
