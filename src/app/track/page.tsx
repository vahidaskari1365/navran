"use client";

import Link from "next/link";
import { TrackingWidget } from "@/components/landing/tracking-widget";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Icons, SectionHeading } from "@/components/ui";
import { sampleTrackingCodes } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

export default function TrackPage() {
  const { data } = useNavaran();
  const codes = sampleTrackingCodes(data, 4);

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg radial-fade opacity-60" />
        <div
          className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle,rgba(204,247,90,.16),transparent 65%)" }}
        />
        <div className="shell relative py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow mx-auto">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
              رهگیری عمومی · بدون نیاز به ورود
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-[38px]">
              محموله شما کجاست؟
            </h1>
            <p className="mt-3 text-[13px] leading-7 text-slate-400">
              کد رهگیری ناوران (مثل <span className="font-mono text-lime">NAV-7K42QD</span>) را وارد کنید تا مسیر،
              رویدادها و زمان تخمینی تحویل را ببینید.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <TrackingWidget samples={codes} variant="inline" />
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Icons.radar />,
                title: "پینگ GPS هر ۵ دقیقه",
                desc: "موقعیت، سرعت و دمای محفظه در مرکز کنترل دبی ثبت می‌شود.",
              },
              {
                icon: <Icons.package />,
                title: "تایم‌لاین کامل رویدادها",
                desc: "از صدور بارنامه و بارگیری تا گمرک، توزیع نهایی و امضای تحویل.",
              },
              {
                icon: <Icons.shield />,
                title: "هشدار پیش‌دستانه",
                desc: "در صورت تأخیر یا انحراف شرایط، وضعیت استثنا به مشتری اعلام می‌شود.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0b1521] text-lime">
                  {item.icon}
                </span>
                <h2 className="mt-4 text-[13px] font-bold text-white">{item.title}</h2>
                <p className="mt-1.5 text-[12px] leading-6 text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="card mt-10 grid gap-6 p-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <SectionHeading
              eyebrow="برای باربران"
              title="می‌خواهید همه محموله‌ها را یک‌جا ببینید؟"
              description="با ورود به مرکز کنترل، تخته بار، محموله‌های فعال، ناوگان و فاکتورها را مدیریت کنید."
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn btn-primary">
                ورود به مرکز کنترل
                <Icons.arrow />
              </Link>
              <Link href="/dashboard/loads" className="btn btn-outline">
                تخته بار
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
