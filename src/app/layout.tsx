import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "plaid.asion.ai | TrustFlow AI",
  description:
    "TrustFlow AI is an agentic payment risk copilot for AI-initiated wallet funding, bank transfers, and account connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
