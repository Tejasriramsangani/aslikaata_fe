import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ASLI KAATA - Real Weight. Real Value.",
  description: "Doorstep scrap collection with digital precision weighing, instant payment, and live market rates.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A3D2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        {/* Responsive Container: Edge-to-edge native on mobile; Centered luxury frame on desktop/tablet */}
        <div className="min-h-screen w-full bg-gradient-to-br from-[#041A12] via-[#0A3D2B] to-[#062418] flex items-center justify-center p-0 md:py-8 md:px-4">
          <div className="w-full max-w-md min-h-screen md:min-h-[860px] md:max-h-[920px] md:h-[88vh] md:rounded-[40px] bg-[#F8FAFC] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col md:border-[7px] md:border-slate-800/90">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
