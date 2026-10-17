import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofTrail — Evidence-First Dispute Investigation",
  description:
    "Evidence-first investigation assistant for short-delivery quantity disputes between small B2B suppliers and buyers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
