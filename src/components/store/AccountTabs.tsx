"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, MapPin } from "lucide-react";

const TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "addresses", label: "Addresses", icon: MapPin },
] as const;

export function AccountTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "profile";

  function handleTabChange(value: string) {
    router.replace(`/account?tab=${value}`, { scroll: false });
  }

  return (
    <div className="flex gap-1 border-b mb-6" role="tablist">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
              isActive
                ? "border-primary text-primary pointer-events-none"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
