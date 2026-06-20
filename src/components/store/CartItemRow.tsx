"use client";

import Image from "next/image";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types/cart";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-4 border-b py-4 last:border-b-0">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.product_image ? (
          <Image
            src={item.product_image}
            alt={item.product_name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{item.product_name}</p>
            {item.variant_label && (
              <p className="text-xs text-muted-foreground">{item.variant_label}</p>
            )}
            {item.price_changed && (
              <Badge variant="outline" className="mt-1 gap-1 border-amber-300 bg-amber-50 text-amber-700 text-[10px]">
                <AlertTriangle className="size-3" />
                Price changed
              </Badge>
            )}
          </div>
          <p className="shrink-0 font-medium text-sm">
            {formatPrice(item.total_price)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              disabled={item.qty <= 1}
              onClick={() => onUpdateQty(item.id, item.qty - 1)}
              aria-label="Decrease quantity"
            >
              -
            </Button>
            <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdateQty(item.id, item.qty + 1)}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {formatPrice(item.unit_price)} each
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => onRemove(item.id)}
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


