import { MainLayout } from "@/components/Layout";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban Copilot",
  description: "Agent Kanban Board with Copilot integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainLayout
          health="healthy"
          breadcrumbs={[
            { label: "Projects" },
            { label: "Alpha Core" },
          ]}
        >
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
