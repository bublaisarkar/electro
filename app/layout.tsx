import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const siteUrl = process.env.NEXTAUTH_URL || "https://your-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Electro Store – Your Trusted Electronics Shop",
    template: "%s | Electro Store",
  },
  description:
    "Shop the latest electronics, gadgets, and tech accessories. Quality products at affordable prices.",
  keywords: ["electronics", "gadgets", "ecommerce", "tech", "shop"],
  openGraph: {
    title: "Electro Store – Your Trusted Electronics Shop",
    description:
      "Shop the latest electronics, gadgets, and tech accessories.",
    url: siteUrl,
    siteName: "Electro Store",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electro Store",
    description: "Shop the latest electronics, gadgets, and tech accessories.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${outfit.className} antialiased text-gray-700`}
        suppressHydrationWarning
      >
        <SessionProviderWrapper>
          <Toaster />
          <AppContextProvider>{children}</AppContextProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}