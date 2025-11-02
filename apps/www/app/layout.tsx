import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import Aurora from '@/components/backgrounds/Aurora/Aurora';
import Particles from '@/components/backgrounds/Particles/Particles';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/header';
import { ThemeProvider } from '@recurse/ui/components';
import { ScrollProvider } from '@/contexts/ScrollContext';
import { Providers } from './providers';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'recurse.cc - Universal Memory Layer',
  description:
    'RAGE (Recursive Agentic Graph Embeddings) transform raw text into persistent, structured memory for AI-native applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${jetbrainsMono.variable}`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
            storageKey="theme"
          >
            <ScrollProvider>
              <div className="relative min-h-screen bg-background">
                <Header />
                <main className="relative z-10 pt-[120px]">{children}</main>
                <Footer />
              </div>
              {/* Particles Background for Entire Site */}
              <div className="pointer-events-none fixed inset-0 z-0 opacity-80 dark:opacity-50">
                <Particles
                  className="text-red-orange-300 dark:text-white"
                  enableMouseFollow={true}
                  parallaxStrength={0.5}
                  particleColor="currentColor"
                  particleCount={80}
                  particleSize={3}
                  speed={0.3}
                />
              </div>

              {/* Aurora Background at Bottom */}
              <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 h-full scale-y-[-1] opacity-15 dark:opacity-15">
                <Aurora
                  amplitude={0.8}
                  blend={0.6}
                  colorStops={['#1976D2', '#8A9BB5', '#A0A9B5']}
                  speed={1.5}
                />
              </div>
            </ScrollProvider>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
