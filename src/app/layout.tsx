import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GSAPProvider from "@/components/providers/GSAPProvider";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const seasons = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-seasons",
  display: "swap",
});

export const metadata: Metadata = {
  title: "thesocialplug.",
  description: "irl > scrolling",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${seasons.variable}`}>
      <body>
        <GSAPProvider />
        {children}
      </body>
    </html>
  );
}
