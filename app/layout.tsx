import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurora Identity — Firebase + Next.js",
  description:
    "Production-ready Next.js authentication with Firebase, OTP, React Hook Form, and Shadcn-style UI primitives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background antialiased flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
