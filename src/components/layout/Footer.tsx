"use client";

import Link from "next/link";
import { useSettingsStore } from "@/lib/stores/settings.store";
import { useTranslation } from "@/lib/i18n/client";

export function Footer() {
  const { t } = useTranslation();
  const { siteName, socialLinks } = useSettingsStore();
  const footerLinks = [
    { label: t("Customer Service"), children: [
      { label: t("Contact"), href: "/contact" },
      { label: t("FAQs"), href: "/faqs" },
      { label: t("Returns"), href: "/returns" },
    ]},
    { label: t("About Us"), children: [
      { label: t("About"), href: "/about" },
      { label: t("Careers"), href: "/careers" },
      { label: t("Press"), href: "/press" },
    ]},
    { label: t("Legal"), children: [
      { label: t("Privacy Policy"), href: "/privacy" },
      { label: t("Terms"), href: "/terms" },
    ]},
  ];

  return (
    <footer className="bg-muted border-t border-border mt-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-foreground">{siteName}</span>
          <p className="text-sm text-secondary">
            {t("Efficiency, reliability, and accessibility. Your trusted platform for seamless shopping.")}
          </p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{group.label}</h4>
            {group.children.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-secondary hover:text-primary hover:underline decoration-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-border/50">
        <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-secondary">
            &copy; {new Date().getFullYear()} {siteName}. {t("Efficiency, reliability, and accessibility.")}
          </p>
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <Link
                  key={platform}
                  href={url}
                  className="text-sm text-secondary hover:text-primary transition-colors capitalize"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
