import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: 'Project AGOS-BD - Adaptive Geo-mapped Outreach System for Blood Donations',
  description: "Realtime blood donation outreach, verified reports, and emergency response mapping."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
