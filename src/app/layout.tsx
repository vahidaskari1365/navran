import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavaranProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "ناوران | پلتفرم هوشمند لجستیک و حمل‌ونقل — امارات",
  description:
    "ناوران، پلتفرم یکپارچه مدیریت بار، حمل‌ونقل، ترکینگ لحظه‌ای، مانیتورینگ ناوگان و حسابداری در امارات متحده عربی. پایلوت عملیاتی در دبی با پشتیبانی محلی.",
  keywords: ["لجستیک", "حمل و نقل", "مدیریت بار", "ترکینگ", "امارات", "دبی", "ناوگان", "انبارداری"],
  openGraph: {
    title: "ناوران | مرکز کنترل لجستیک امارات",
    description: "از بارگیری تا تسویه؛ یک پلتفرم برای کل زنجیره لجستیک در امارات.",
    locale: "fa_AE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-slate-200 antialiased">
        <NavaranProvider>{children}</NavaranProvider>
      </body>
    </html>
  );
}
