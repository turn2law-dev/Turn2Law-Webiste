import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MessagesProvider } from "@/lib/messages-context";
import { ThemeProvider } from "@/lib/theme-context";
import { NotificationProvider } from "@/contexts/notification-context";
import RightDock from "@/components/ui/right-dock";

export const metadata: Metadata = {
  title: "Turn2Law - Your Trusted Legal Partner",
  description: "Instantly match with qualified lawyers for your legal needs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
