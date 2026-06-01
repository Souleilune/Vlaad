import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: 'Project AGOS-BD - Adaptive Geo-mapped Outreach System for Blood Donations',
  description: "Realtime blood donation outreach, verified reports, and emergency response mapping."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
