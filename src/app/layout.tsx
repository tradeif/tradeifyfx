import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import { FirebaseAuthProvider } from "@/lib/firebaseAuth";
import GlobalSparkParticles from "@/components/hero/GlobalSparkParticles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRADEIFYFX | Premium Trading Education & Signals",
  description: "Master Forex, Gold, and Crypto trading with elite price action, Smart Money Concepts (SMC), live market sessions, and verified trade signals. Phone: +91 9799450432.",
  keywords: ["Forex Trading", "Gold Trading", "Crypto Trading", "Smart Money Concepts", "Trading Signals", "TRADEIFYFX"],
  authors: [{ name: "TRADEIFYFX" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-app-bg text-app-fg transition-colors duration-300 selection:bg-gold selection:text-black relative overflow-x-hidden">
        <FirebaseAuthProvider>
          <AppStateProvider>
            <GlobalSparkParticles particleCount={35} />
            <div className="relative z-10 flex flex-col min-h-full">
              {children}
            </div>
          </AppStateProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
