import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SettingsHydrator } from "@/components/stores/SettingsHydrator";
import { StoreInitializer } from "@/components/stores/StoreInitializer";
import { request } from "@/lib/api/Request";

async function getSettings() {
  try {
    return await request.get<{
      site_name?: string;
      logo_url?: string | null;
      currency_code?: string;
      currency_symbol?: string;
      social_links?: Record<string, string>;
      support_email?: string | null;
      support_phone?: string | null;
    }>("/api/settings/public");
  } catch {
    return null;
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  const defaults = {
    siteName: "Techa",
    logoUrl: null as string | null,
    currencyCode: "SAR",
    currencySymbol: "ر.س",
    socialLinks: {} as Record<string, string>,
    supportEmail: null as string | null,
    supportPhone: null as string | null,
  };

  const hydrated = settings
    ? {
        siteName: settings.site_name ?? defaults.siteName,
        logoUrl: settings.logo_url ?? defaults.logoUrl,
        currencyCode: settings.currency_code ?? defaults.currencyCode,
        currencySymbol: settings.currency_symbol ?? defaults.currencySymbol,
        socialLinks: settings.social_links ?? defaults.socialLinks,
        supportEmail: settings.support_email ?? defaults.supportEmail,
        supportPhone: settings.support_phone ?? defaults.supportPhone,
      }
    : defaults;

  return (
    <>
      <SettingsHydrator {...hydrated} />
      <StoreInitializer />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
