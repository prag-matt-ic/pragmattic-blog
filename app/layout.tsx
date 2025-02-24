import "./globals.css";

import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";

// import Footer from '@/components/Footer'

const fontSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { template: "%s | Pragmattic", default: "Pragmattic Blog" },
  description:
    "Web development, design, and engineering articles by Matthew Frawley.",
  authors: [{ name: "Matthew Frawley" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} w-full bg-black font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
