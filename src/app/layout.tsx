import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ASLI KAATA Operations Cockpit | Admin ERP",
  description: "Enterprise Operations & Logistics Command Portal: Real-time Dispatch, Fleet Ledger, Scrap Rates, and Cash Float Reconciliation.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full dark`}>
      <body className="min-h-full w-full bg-[#0F172A] text-slate-100 antialiased selection:bg-emerald-600 selection:text-white">
        {/* Full-width Responsive Web Application */}
        <div className="min-h-screen w-full flex flex-col bg-[#0F172A]">
          {children}
        </div>
      </body>
    </html>
  );
}
