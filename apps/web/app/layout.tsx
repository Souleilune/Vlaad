import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Vlaad | Blood Donation Tracker Platform",
  description: "Realtime community blood availability and emergency response dashboard."
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
