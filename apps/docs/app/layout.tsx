import { JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={jetbrainsMono.variable}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
