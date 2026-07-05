import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "MediaPulse AI — AI-Powered PR & Media Monitoring",
    template: "%s · MediaPulse AI",
  },
  description:
    "Monitor how your organization is mentioned across news and public content. Analyze sentiment, detect reputation risks, generate reports and get AI-powered communication insights.",
  keywords: [
    "media monitoring", "PR", "sentiment analysis", "reputation", "AI", "press",
    "news monitoring", "competitor intelligence",
  ],
  authors: [{ name: "MediaPulse AI" }],
  openGraph: {
    title: "MediaPulse AI",
    description: "AI-powered PR & media monitoring platform.",
    type: "website",
    siteName: "MediaPulse AI",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
