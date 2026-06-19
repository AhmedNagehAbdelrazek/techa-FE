"use client";

import Link from "next/link";
import { useSettingsStore } from "@/lib/stores/settings.store";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  const { siteName, socialLinks } = useSettingsStore();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">{siteName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your Trusted Online Store
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
            {Object.keys(socialLinks).length > 0 ? (
              <div className="flex gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <Link
                    key={platform}
                    href={url}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Coming soon</p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
