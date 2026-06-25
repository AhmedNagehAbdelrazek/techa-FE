"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Banner } from "@/lib/types/banner";

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  return (
    <Carousel opts={{ loop: true, align: "start" }}>
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            {banner.link_url ? (
              <Link
                href={banner.link_url}
                className="relative block aspect-[21/9] w-full overflow-hidden rounded-lg"
              >
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
                {banner.title && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-8">
                    <div className="text-white">
                      <h2 className="font-display text-2xl font-bold tracking-wider sm:text-3xl lg:text-4xl">
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
              </Link>
            ) : (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
                {banner.title && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-8">
                    <div className="text-white">
                      <h2 className="font-display text-2xl font-bold tracking-wider sm:text-3xl lg:text-4xl">
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
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
