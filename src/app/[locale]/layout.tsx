import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import DynamicHeader from "@/components/layout/DynamicHeader";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import GlobalMentorNotification from "@/components/notifications/GlobalMentorNotification";
import { ThemeProvider } from "@/components/theme-provider";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  const messages = await getMessages();

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <DynamicHeader user={session?.user} />
            <main className="flex-1 flex flex-col">
              {props.children}
            </main>
            <Footer />
            <Toaster />
            {session?.user && <GlobalMentorNotification />}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
