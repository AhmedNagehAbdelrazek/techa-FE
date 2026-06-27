"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
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
    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            {banner.link_url ? (
              <Link
                href={banner.link_url}
                className="relative block h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl"
              >
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6 md:px-8 max-w-2xl">
                  <div className="text-primary-foreground">
                    {banner.title && (
                      <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded mb-3 uppercase tracking-wider">
                        {banner.title}
                      </span>
                    )}
                    {banner.description && (
                      <>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                          {banner.description}
                        </h1>
                        <button className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity">
                          Shop the Sale
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6 md:px-8 max-w-2xl">
                  <div className="text-primary-foreground">
                    {banner.title && (
                      <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded mb-3 uppercase tracking-wider">
                        {banner.title}
                      </span>
                    )}
                    {banner.description && (
                      <>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                          {banner.description}
                        </h1>
                        <button className="inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity">
                          Shop the Sale
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
