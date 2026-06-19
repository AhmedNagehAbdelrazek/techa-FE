import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-sm text-muted-foreground">
              View and edit your profile information
            </p>
          </div>
          <ProfileForm />
          <div className="border-t pt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
