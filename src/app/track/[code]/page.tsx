"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteStrip } from "@/components/charts";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { TrackingTimeline } from "@/components/tracking";
import { Icons, StatusBadge } from "@/components/ui";
import { MODE_LABELS, SERVICE_LABELS, countdown, faDateTime, num, percent } from "@/lib/format";
import { publicMetrics, trackingByCode } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

export default function TrackingResultPage() {
  const params = useParams<{ code: string }>();
  const { data } = useNavaran();
  const decoded = decodeURIComponent(params?.code ?? "");
  const result = trackingByCode(data, decoded);
  const metrics = publicMetrics(data);

  if (!result) {
    return (
      <>
        <SiteHeader />
        <main className="shell py-24">
          <div className="card mx-auto max-w-lg p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber/30 bg-amber/10 text-amber">
              !
            </span>
            <h1 className="mt-4 text-lg font-bold text-white">محموله‌ای با این کد یافت نشد</h1>
            <p className="mt-2 text-[12px] leading-6 text-slate-400">
              کد <span className="font-mono text-slate-200">{decoded}</span> در سامانه ناوران ثبت نشده است. کد را
              بررسی کنید یا با مرکز کنترل دبی تماس بگیرید.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/track" className="btn btn-primary btn-sm">
                تلاش دوباره
              </Link>
              <a href="tel:+97148872210" className="btn btn-outline btn-sm" dir="ltr">
                +971 4 887 2210
              </a>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { shipment, events } = result;
  const isDelivered = shipment.status === "delivered";

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg radial-fade opacity-50" />
        <div className="shell relative py-10 sm:py-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/track" className="btn btn-ghost btn-sm -mr-2">
              <span className="rotate-180">
                <Icons.arrow />
              </span>
              رهگیری دیگر
            </Link>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
              آخرین همگام‌سازی مرکز کنترل دبی
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
            <div className="space-y-5">
              <div className="card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 p-5">
                  <div>
                    <p className="text-[10px] text-slate-500">کد رهگیری</p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">{shipment.trackingCode}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {shipment.customerName} · {MODE_LABELS[shipment.mode] ?? shipment.mode} ·{" "}
                      {SERVICE_LABELS[shipment.service] ?? shipment.service}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={shipment.status} />
                    <span className="num text-[10px] text-slate-500">ETA: {faDateTime(shipment.etaAt)}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <RouteStrip
                      origin={shipment.originCity}
                      destination={shipment.destCity}
                      progress={shipment.progressPct}
                    />
                    <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        بارگیری: <span className="num text-slate-300">{faDateTime(shipment.pickupAt)}</span>
                      </span>
                      <span>
                        {isDelivered ? "تحویل شده" : "باقی‌مانده"}:{" "}
                        <span className="num text-lime">
                          {isDelivered ? faDateTime(shipment.deliveredAt) : countdown(shipment.etaAt)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { l: "نوع بار", v: shipment.cargoType },
                      { l: "وزن", v: `${num(shipment.weightKg)} کیلوگرم` },
                      { l: "تعداد", v: `${num(shipment.pieces)} بسته` },
                      { l: "حجم", v: `${num(shipment.volumeM3)} متر مکعب` },
                      { l: "خودرو", v: shipment.vehiclePlate ?? "در انتظار تخصیص" },
                      { l: "راننده", v: shipment.driverName ?? "تخصیص نیافته" },
                      { l: "دما", v: shipment.temperatureC ? `${num(shipment.temperatureC)}°C` : "کنترل‌نشده" },
                      { l: "اینکوترم", v: shipment.incoterm },
                    ].map((item) => (
                      <div key={item.l} className="rounded-xl border border-white/8 bg-[#080f19] px-3 py-2.5">
                        <p className="text-[9px] text-slate-500">{item.l}</p>
                        <p className="num mt-1 truncate text-[11px] font-semibold text-slate-200">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <h2 className="text-sm font-bold text-white">تایم‌لاین محموله</h2>
                  <span className="num text-[10px] text-slate-500">{num(events.length)} رویداد</span>
                </div>
                <div className="p-5">
                  <TrackingTimeline events={events} />
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="card p-5">
                <h2 className="text-sm font-bold text-white">خلاصه وضعیت</h2>
                <div className="mt-4 space-y-3 text-[11px]">
                  {[
                    { l: "مبدأ", v: shipment.originCity },
                    {
                      l: "مقصد",
                      v: `${shipment.destCity}${shipment.destCountry !== "AE" ? ` (${shipment.destCountry})` : ""}`,
                    },
                    { l: "مشتری", v: shipment.customerName ?? "—" },
                    { l: "پیشرفت مسیر", v: `${num(shipment.progressPct)}٪` },
                    { l: "خدمت", v: SERVICE_LABELS[shipment.service] ?? shipment.service },
                    { l: "زمان تحویل", v: faDateTime(shipment.etaAt) },
                  ].map((row) => (
                    <div key={row.l} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0">
                      <span className="text-slate-500">{row.l}</span>
                      <span className="num text-left font-medium text-slate-200">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="p-5" style={{ background: "linear-gradient(150deg,rgba(204,247,90,.12),transparent 70%)" }}>
                  <p className="text-[10px] text-lime">دقت شبکه ناوران</p>
                  <p className="num mt-1 text-2xl font-extrabold text-white">{num(metrics.onTimeRate)}٪</p>
                  <p className="mt-1 text-[11px] text-slate-400">تحویل به‌موقع در پایلوت دبی</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                      <p className="text-[9px] text-slate-500">ناوگان فعال</p>
                      <p className="num text-[11px] font-semibold text-white">{num(metrics.activeFleet)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                      <p className="text-[9px] text-slate-500">سهم محموله</p>
                      <p className="num text-[11px] font-semibold text-white">
                        {num(percent(shipment.weightKg, 25000))}٪ ظرفیت
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-bold text-white">نیاز به کمک دارید؟</h2>
                <p className="mt-1.5 text-[11px] leading-6 text-slate-400">
                  مرکز کنترل دبی، شنبه تا پنجشنبه ۸ تا ۱۸ (GST) و خط اضطراری عملیات ۲۴ ساعته پاسخگوی شماست.
                </p>
                <div className="mt-3 space-y-2">
                  <a href="tel:+97148872210" className="btn btn-outline btn-sm w-full" dir="ltr">
                    +971 4 887 2210
                  </a>
                  <a href="mailto:ops@navaran.ae" className="btn btn-ghost btn-sm w-full text-[11px]" dir="ltr">
                    ops@navaran.ae
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
