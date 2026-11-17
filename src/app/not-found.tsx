import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Icons } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg radial-fade opacity-50" />
        <div className="shell relative flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <span className="font-mono text-6xl font-extrabold text-lime/80">۴۰۴</span>
          <h1 className="mt-4 text-xl font-bold text-white">این مسیر در شبکه پیدا نشد</h1>
          <p className="mt-2 max-w-md text-[12px] leading-6 text-slate-400">
            صفحه‌ای که دنبال آن هستید جابه‌جا شده یا وجود ندارد. می‌توانید از مرکز کنترل یا صفحه رهگیری ادامه دهید.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-primary btn-sm">
              صفحه اصلی
              <Icons.arrow />
            </Link>
            <Link href="/track" className="btn btn-outline btn-sm">
              رهگیری محموله
            </Link>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              مرکز کنترل
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
