"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ResetDemoButton } from "@/components/dashboard/actions";
import { BrandMark } from "@/components/ui";

const MAIN_NAV = [
  { href: "/dashboard", label: "مرکز کنترل", icon: "◈", badge: "activeShipments" as const },
  { href: "/dashboard/shipments", label: "محموله‌ها", icon: "▤" },
  { href: "/dashboard/loads", label: "تخته بار", icon: "▦", badge: "openLoads" as const },
  { href: "/dashboard/monitoring", label: "مانیتورینگ ناوگان", icon: "◉", badge: "alerts" as const },
];

const FINANCE_NAV = [
  { href: "/dashboard/accounting", label: "حسابداری و فاکتور", icon: "₳", badge: "overdueInvoices" as const },
  { href: "/dashboard/customers", label: "مشتریان و اعتبار", icon: "◍" },
];

const EXTERNAL_NAV = [
  { href: "/track", label: "رهگیری عمومی", icon: "⌕" },
  { href: "/", label: "وب‌سایت ناوران", icon: "⌂" },
];

type BadgeKey = "activeShipments" | "openLoads" | "alerts" | "overdueInvoices";

export function DashboardSidebar({ badges }: { badges: Record<BadgeKey, number> }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const item = (link: { href: string; label: string; icon: string; badge?: BadgeKey }) => {
    const active = isActive(link.href);
    const count = link.badge ? badges[link.badge] : 0;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[12.5px] transition ${
          active
            ? "bg-lime/12 font-semibold text-white ring-1 ring-lime/25"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span className={`text-[13px] ${active ? "text-lime" : "text-slate-500"}`}>{link.icon}</span>
          {link.label}
        </span>
        {count > 0 && (
          <span
            className={`num rounded-md px-1.5 py-0.5 text-[10px] ${
              active ? "bg-lime text-[#0a1206]" : "bg-white/8 text-slate-300"
            }`}
          >
            {new Intl.NumberFormat("fa-IR").format(count)}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-full flex-col overflow-y-auto border-l border-white/8 bg-[#060c14] px-4 py-5 lg:flex">
      <Link href="/" className="flex items-center gap-2 px-1">
        <BrandMark className="h-9 w-9" />
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-extrabold text-white">ناوران</span>
          <span className="text-[9px] tracking-[0.2em] text-slate-500 uppercase">Control Tower</span>
        </span>
      </Link>

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-200">مرکز کنترل دبی</span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> زنده
          </span>
        </div>
        <p className="mt-1 text-[9.5px] text-slate-500">پایلوت امارات · JAFZA</p>
        <p className="mt-1.5 rounded-md border border-lime/20 bg-lime/[0.07] px-1.5 py-1 text-center text-[9px] text-lime">
          دموی فرانت‌اند · بدون ورود
        </p>
      </div>

      <nav className="mt-5 space-y-1">
        <p className="mb-1.5 px-3 text-[9.5px] tracking-wide text-slate-600">عملیات</p>
        {MAIN_NAV.map(item)}
        <p className="mt-4 mb-1.5 px-3 text-[9.5px] tracking-wide text-slate-600">مالی و مشتریان</p>
        {FINANCE_NAV.map(item)}
        <p className="mt-4 mb-1.5 px-3 text-[9.5px] tracking-wide text-slate-600">دسترسی سریع</p>
        {EXTERNAL_NAV.map(item)}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-xl border border-lime/15 bg-lime/[0.05] p-3">
          <p className="text-[11px] font-semibold text-white">پشتیبانی محلی امارات</p>
          <p className="mt-1 text-[10px] leading-5 text-slate-400">
            تیم عملیات دبی، پاسخ کمتر از ۳۰ دقیقه در ساعات کاری.
          </p>
          <a href="tel:+97148872210" className="num mt-2 block text-[11px] font-semibold text-lime" dir="ltr">
            +971 4 887 2210
          </a>
        </div>
        <ResetDemoButton />
        <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.025] p-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lime to-emerald-500 text-[11px] font-bold text-[#0a1206]">
            سح
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-slate-200">سارا حکیمی</p>
            <p className="text-[9.5px] text-slate-500">مدیر عملیات — دبی</p>
          </div>
          <span className="text-slate-600">⋯</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const links = [...MAIN_NAV, ...FINANCE_NAV];
  return (
    <div className="scroll-thin flex gap-1.5 overflow-x-auto border-b border-white/8 bg-[#060c14] px-4 py-2 lg:hidden">
      {links.map((link) => {
        const active = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] whitespace-nowrap transition ${
              active ? "bg-lime/15 font-semibold text-lime" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
