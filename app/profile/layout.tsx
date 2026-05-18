import type { ReactNode } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marcus Thorne — Athlete dashboard | Olympx",
  description: "Premium sports athlete dashboard — stats, insights, sponsors, and activity.",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
