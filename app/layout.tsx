import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { LanguageProvider } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLMMerch - Cognitive Wearables That Make You 1300% Smarter",
  description: "Skateboard bar approved. Educational tees that actually teach ML/AI concepts. Not streetwear. Not clothing. Cognitive Wearables. 100% fabric, NO electronic chips attached!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <Providers>
            <LanguageToggle />
            {children}
            <Analytics />
            <SpeedInsights />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
