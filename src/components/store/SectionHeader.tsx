import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string;
}

export function SectionHeader({ title, href, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center justify-between border-b border-border pb-3",
        className,
      )}
    >
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      )}
    </div>
  );
}
