import type { Metadata } from "next";
import localFont from "next/font/local";
import { ProfileProvider } from "@/components/ProfileProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BreachGym — State Breach Notice Micro-Learning",
  description:
    "Duolingo-style training for law firm associates on US state data breach notification laws. Educational demo only — not legal advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
