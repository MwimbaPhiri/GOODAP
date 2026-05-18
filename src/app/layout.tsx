import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://agenttrust.africa"),
  title: "Agent Trust - AI Governance and Execution Safety",
  description: "A verification and governance layer that prevents unverified AI agent outputs from triggering real-world actions.",
  keywords: ["AI safety", "AI governance", "agentic AI", "verification", "execution gate", "audit logs", "trust infrastructure"],
  authors: [{ name: "Agent Trust Team" }],
  openGraph: {
    title: "Agent Trust - Trust gate for autonomous AI agents",
    description: "Verify AI agent outputs before execution with explainable trust scores and audit logs.",
    type: "website",
    locale: "en_US",
    url: "https://agenttrust.africa",
    siteName: "Agent Trust",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agent Trust - AI governance platform",
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