import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
export const metadata: Metadata = {
  title: "FlytBase Command Centre",
  description: "Evidence-led customer success CRM for Questathon."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<SpeedInsights /></body></html>;
}
