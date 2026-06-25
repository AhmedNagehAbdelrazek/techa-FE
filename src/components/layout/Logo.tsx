import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

export function Logo({ src, alt = "Techa", className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={120}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />
      ) : (
        <span className="font-display text-xl font-bold tracking-wider">{alt}</span>
      )}
    </Link>
  );
}
