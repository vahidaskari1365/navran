import Link from "next/link";
import { BrandLock, BrandMark } from "@/components/ui";

const NAV = [
  { href: "/#services", label: "خدمات" },
  { href: "/#platform", label: "پلتفرم" },
  { href: "/track", label: "ترکینگ" },
  { href: "/#coverage", label: "پوشش امارات" },
  { href: "/#accounting", label: "حسابداری" },
  { href: "/#pilot", label: "پایلوت امارات" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#05090f]/85 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <BrandLock />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[13px] text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-300 sm:flex">
            <span className="text-sm leading-none">🇦🇪</span> دبی · پایلوت عملیاتی
          </span>
          <Link href="/dashboard" className="btn btn-primary btn-sm sm:px-4 sm:py-2 sm:text-[13px]">
            ورود به مرکز کنترل
          </Link>
          <details className="relative lg:hidden">
            <summary className="btn btn-outline btn-sm list-none px-2.5 [&::-webkit-details-marker]:hidden">☰</summary>
            <div className="absolute left-0 top-11 w-56 rounded-2xl border border-white/10 bg-[#0a121d] p-2 shadow-2xl">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="relative border-t border-white/8 bg-[#04070c] pt-14 pb-8">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <p className="text-sm font-extrabold text-white">ناوران لجستیک</p>
                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">Navaran Logistics FZ-LLC</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[12px] leading-6 text-slate-500">
              پلتفرم یکپارچه مدیریت بار، حمل‌ونقل، ترکینگ، مانیتورینگ ناوگان و حسابداری. پایلوت عملیاتی در دبی و
              پشتیبانی محلی در امارات متحده عربی.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <span className="rounded-full border border-white/10 px-2 py-1">مجوز منطقه آزاد DMCC</span>
              <span className="rounded-full border border-white/10 px-2 py-1">TRN 100482731500003</span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold text-white">پلتفرم</p>
            <ul className="space-y-2 text-[12px] text-slate-500">
              {[
                { href: "/#services", label: "مدیریت بار" },
                { href: "/dashboard/shipments", label: "حمل و نقل" },
                { href: "/track", label: "ترکینگ محموله" },
                { href: "/dashboard/monitoring", label: "مانیتورینگ ناوگان" },
                { href: "/dashboard/accounting", label: "حسابداری و فاکتور" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-lime">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold text-white">مسیرهای اصلی</p>
            <ul className="space-y-2 text-[12px] text-slate-500">
              <li>دبی → ابوظبی · ۲ ساعت</li>
              <li>جبل علی → ریاض · ۲۴ ساعت</li>
              <li>دبی → دوحه · ۲۴ ساعت</li>
              <li>شارجه → فجیره · ۳ ساعت</li>
              <li>دبی → مسقط · ۴۸ ساعت</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[12px] font-semibold text-white">دفتر عملیات دبی</p>
            <ul className="space-y-2 text-[12px] text-slate-500">
              <li>JAFZA، جبل علی، دبی، امارات</li>
              <li dir="ltr" className="text-right">+971 4 887 2210</li>
              <li dir="ltr" className="text-right">ops@navaran.ae</li>
              <li>شنبه تا پنجشنبه · ۸ تا ۱۸ GST</li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> پشتیبانی محلی ۲۴/۷
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-5 text-[11px] text-slate-600 sm:flex-row">
          <span>© ۲۰۲۶ ناوران لجستیک — تمام حقوق محفوظ است.</span>
          <span>طراحی و راه‌اندازی: تیم ناوران · مدیریت و پشتیبانی مستقر در امارات</span>
        </div>
      </div>
    </footer>
  );
}
