import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOODAP - AI-Powered Event Management Platform",
  description: "Create, manage, and facilitate amazing events with AI-powered templates and Web3 integration.",
  keywords: ["events", "AI", "Web3", "tickets", "merchandise", "virtual events"],
  authors: [{ name: "GOODAP Team" }],
  openGraph: {
    title: "GOODAP - AI-Powered Event Management",
    description: "Create amazing events with AI templates and Web3 features",
    type: "website",
    locale: "en_US",
    url: "https://goodapp.com",
    siteName: "GOODAP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GOODAP - Event Management Platform",
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
        <meta name="theme-color" content="#8b5cf6" />
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