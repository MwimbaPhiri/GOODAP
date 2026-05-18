import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agent Trust - AI Escrow and Task Verification",
  description: "AI-powered escrow, task verification, reputation scoring, and dispute workflows for Africa's work economy.",
  keywords: ["escrow", "AI verification", "fintech", "freelancers", "Zambia", "mobile money", "trust infrastructure"],
  authors: [{ name: "Agent Trust Team" }],
  openGraph: {
    title: "Agent Trust - Verified escrow for the AI era",
    description: "AI-powered escrow and task verification for freelancers, SMEs, delivery teams, and AI agents.",
    type: "website",
    locale: "en_US",
    url: "https://agenttrust.africa",
    siteName: "Agent Trust",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agent Trust - AI escrow and verification platform",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}