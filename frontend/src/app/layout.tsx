import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MessagesProvider } from "@/lib/messages-context";
import { ThemeProvider } from "@/lib/theme-context";
import { NotificationProvider } from "@/contexts/notification-context";
import RightDock from "@/components/ui/right-dock";

export const metadata: Metadata = {
  title: {
    default: "Turn2Law | Expert Legal Matching & 24/7 AI Legal Assistance",
    template: "%s | Turn2Law",
  },
  description: "Instantly match with qualified, verified lawyers for your specific legal needs and get 24/7 AI legal support via LawGPT. Turn2Law simplifies access to justice.",
  keywords: [
    "legal matching",
    "hire a lawyer",
    "find a lawyer",
    "AI legal assistant",
    "LawGPT",
    "legal consultation",
    "attorney match",
    "legal advice AI",
    "trusted attorneys",
  ],
  authors: [{ name: "Turn2Law" }],
  creator: "Turn2Law",
  publisher: "Turn2Law",
  metadataBase: new URL("https://turn2law.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://turn2law.com",
    title: "Turn2Law | Expert Legal Matching & 24/7 AI Legal Assistance",
    description: "Instantly match with qualified, verified lawyers for your specific legal needs and get 24/7 AI legal support via LawGPT.",
    siteName: "Turn2Law",
    images: [
      {
        url: "/images/turn2law.jpeg",
        width: 1200,
        height: 630,
        alt: "Turn2Law - We Simplify Legal Access for Everyone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Turn2Law | Expert Legal Matching & 24/7 AI Legal Assistance",
    description: "Instantly match with qualified, verified lawyers for your specific legal needs and get 24/7 AI legal support via LawGPT.",
    images: ["/images/turn2law.jpeg"],
    creator: "@Turn2Law",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon-dark.svg"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon-light.svg"
          media="(prefers-color-scheme: light)"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <NotificationProvider>
            <MessagesProvider>
              {children}
              <RightDock />
              <Toaster />
            </MessagesProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
