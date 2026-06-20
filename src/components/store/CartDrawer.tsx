"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart.store";
import { CartItemRow } from "@/components/store/CartItemRow";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);
  const updateItemQty = useCartStore((s) => s.updateItemQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative rounded-md p-2 hover:bg-accent" aria-label="Open cart">
          <ShoppingCart className="size-5" />
          {itemCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-sm flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-4" />
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-2 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQty={updateItemQty}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="mb-4 flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full" asChild>
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}


