import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/context/ToastContext";
import LoadingProvider from "@/context/LoadingProvider";

export const metadata: Metadata = {
  title: "Atithi — India's Luxury Hotel Management Platform",
  description:
    "Atithi (अतिथि) — Discover and book India's finest hotels. From heritage palaces to beachside retreats. Built by Swaraj Chaudhari.",
  keywords:
    "Atithi, luxury hotels India, hotel booking, Jaipur palace, Kerala resort, Goa beach hotel, heritage stays, smart hotel management",
  openGraph: {
    title: "Atithi — Luxury Hotel Management Platform",
    description: "Atithi Devo Bhava. Experience India's finest hospitality.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/atithi-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/atithi-logo.svg" />
      </head>
      <body className="bg-cream-50 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <ToastProvider />
          <LoadingProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}