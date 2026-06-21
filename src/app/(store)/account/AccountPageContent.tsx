"use client";

import { useSearchParams } from "next/navigation";
import { AccountTabs } from "@/components/store/AccountTabs";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AccountAddresses } from "@/components/store/AccountAddresses";

export function AccountPageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <div>
      <AccountTabs />
      {activeTab === "profile" ? (
        <div role="tabpanel" id="tab-profile">
          <ProfileForm />
          <div className="border-t pt-6 mt-6">
            <LogoutButton />
          </div>
        </div>
      ) : (
        <div role="tabpanel" id="tab-addresses">
          <AccountAddresses />
        </div>
      )}
    </div>
  );
}
