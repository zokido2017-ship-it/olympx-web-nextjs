import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { GoogleOAuthProviderWrapper } from "@/components/providers/google-oauth-provider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1F3A",
};

export const metadata: Metadata = {
  title: {
    default: "Sportxo",
    template: "%s | Sportxo",
  },
  description:
    "Premium multi-sport platform connecting athletes, teams, organisations, tournaments and sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <GoogleOAuthProviderWrapper>{children}</GoogleOAuthProviderWrapper>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                "rounded-xl border border-sportxo-border bg-sportxo-white text-sportxo-navy shadow-sportxo-card",
            },
          }}
        />
      </body>
    </html>
  );
}
