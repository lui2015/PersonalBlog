import type { Metadata } from "next";
import { Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/effects/ParticleBackground";
import BootAnimation from "@/components/effects/BootAnimation";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CyberSpace - 个人空间",
  description: "赛博朋克风格个人空间 - 博客、视频、相册",
  keywords: ["个人博客", "赛博朋克", "技术博客"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <BootAnimation />
        <ParticleBackground />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
