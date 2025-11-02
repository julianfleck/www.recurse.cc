import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReUI Test - Clean Installation",
  description: "Testing ReUI components with clean Tailwind v4 setup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
