import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Loading from "@/components/global/loading";
import { Toaster } from "@/components/ui/sonner";
import ModalProvider from "@/providers/modal-provider";
import { SidebarCollapseProvider } from "@/providers/sidebar-collapse-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Propject Management App",
  description: "Project Management App for PMP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ModalProvider>
            <SidebarCollapseProvider>
              <Toaster richColors />

              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full w-full">
                    <Loading variant="dots" size="lg" text="Chargement..." />
                  </div>
                }
              >
                {children}
              </Suspense>
            </SidebarCollapseProvider>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
