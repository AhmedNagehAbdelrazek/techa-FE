import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccountPageContent } from "./AccountPageContent";

export const metadata: Metadata = {
  title: "حسابي — TechA",
};

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and addresses
            </p>
          </div>
          <AccountPageContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
