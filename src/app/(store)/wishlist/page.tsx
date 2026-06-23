import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WishlistPageClient } from "@/components/store/WishlistPageClient";

export const metadata: Metadata = {
  title: "المفضلة — TechA",
};

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Products you have saved
          </p>
        </div>
        <WishlistPageClient />
      </div>
    </ProtectedRoute>
  );
}
