import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TooltipProvider } from '@/components/providers/TooltipProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { I18nProvider } from '@/lib/i18n/provider';
import { translations } from '@/lib/i18n/translations';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Techa',
  icons:{
    icon: '/favicon.svg',
  },
  description: 'Your Trusted Online Store',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${inter.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <I18nProvider initialTranslations={translations}>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </I18nProvider>
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
