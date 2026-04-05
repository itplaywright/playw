import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicHeader from "@/components/layout/DynamicHeader";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import GlobalMentorNotification from "@/components/notifications/GlobalMentorNotification";

import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Playwright Platform",
  description: "Вивчення Playwright на TypeScript",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicHeader user={session?.user} />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <Toaster />
          {session?.user && <GlobalMentorNotification />}
        </ThemeProvider>
      </body>
    </html>
  );
}
