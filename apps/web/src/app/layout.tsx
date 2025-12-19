import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTracking } from "@/components/PageTracking";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LoadingBar } from "@/components/common/LoadingBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI-BOS Vendor Portal",
    template: "%s | AI-BOS Vendor Portal",
  },
  description: "Vendor login platform for documents, statements, payments, and messaging",
  keywords: ["vendor", "portal", "documents", "payments", "statements"],
  authors: [{ name: "AI-BOS" }],
  openGraph: {
    type: "website",
    siteName: "AI-BOS Vendor Portal",
    title: "AI-BOS Vendor Portal",
    description: "Vendor login platform for documents, statements, payments, and messaging",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI-BOS Vendor Portal",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  twitter: {
    card: "summary",
    title: "AI-BOS Vendor Portal",
    description: "Vendor login platform for documents, statements, payments, and messaging",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ErrorBoundary>
            <LoadingBar />
            <PageTracking />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

