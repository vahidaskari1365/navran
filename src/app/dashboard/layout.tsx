"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { DashboardSidebar, MobileNav } from "@/components/dashboard/sidebar";
import { BrandMark } from "@/components/ui";
import { faDate, num } from "@/lib/format";
import { navBadges } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data } = useNavaran();
  const badges = navBadges(data);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const today = faDate(new Date());

  return (
    <div className="min-h-screen bg-[#05090f] lg:grid lg:grid-cols-[252px_1fr]">
      <DashboardSidebar badges={badges} />
      <div className="min-w-0">
        <div className="sticky top-0 z-40 border-b border-white/8 bg-[#05090f]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
                <BrandMark className="h-7 w-7" />
                <span className="text-[13px] font-extrabold text-white">ناوران</span>
              </Link>
              <form
                className="hidden items-center sm:flex"
                onSubmit={(event) => {
                  event.preventDefault();
                  router.push(query.trim() ? `/dashboard/shipments?q=${encodeURIComponent(query.trim())}` : "/dashboard/shipments");
                }}
              >
                <div className="relative">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="جستجوی کد رهگیری، مشتری یا مقصد…"
                    className="field h-9 w-64 rounded-lg pr-9 text-[11.5px]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-500">⌕</span>
                </div>
              </form>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-lg border border-lime/20 bg-lime/[0.06] px-2.5 py-1.5 text-[10px] text-lime sm:flex">
                ✓ دسترسی آزاد — بدون ورود
              </span>
              <span className="num hidden rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-400 md:block">
                {today}
              </span>
              <Link
                href="/dashboard/monitoring"
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-[12px] text-slate-300 transition hover:text-white"
                aria-label="هشدارها"
              >
                ◔
                {badges.alerts > 0 && (
                  <span className="num absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">
                    {num(badges.alerts)}
                  </span>
                )}
              </Link>
              <Link href="/dashboard/shipments/new" className="btn btn-primary btn-sm">
                + ثبت محموله
              </Link>
            </div>
          </div>
        </div>
        <MobileNav />
        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
