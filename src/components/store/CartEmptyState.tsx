"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

export function CartEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="size-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">{t("Your cart is empty")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("Looks like you haven't added anything yet.")}
      </p>
      <Button asChild>
        <Link href="/">{t("Continue Shopping")}</Link>
      </Button>
    </div>
  );
}
