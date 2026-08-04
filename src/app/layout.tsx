import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
        {children}
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
