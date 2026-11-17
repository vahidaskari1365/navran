"use client";

import Link from "next/link";
import { Donut, FleetMap, LaneBars, RevenueChart, RouteStrip } from "@/components/charts";
import { Icons, KpiCard, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { SimulateTelemetryOutline } from "@/components/dashboard/actions";
import { SERVICE_LABELS, SEVERITY_META, aedShort, countdown, num, relative, statusMeta } from "@/lib/format";
import { dashboardSnapshot } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  in_transit: "#ccf75a",
  customs: "#fbbf24",
  out_for_delivery: "#22d3ee",
  booked: "#60a5fa",
  picked_up: "#818cf8",
  delivered: "#34d399",
  exception: "#fb7185",
};

export default function DashboardPage() {
  const { data } = useNavaran();
  const snapshot = dashboardSnapshot(data);
  const unresolved = snapshot.alerts.filter((a) => !a.isResolved).slice(0, 4);
  const recentShipments = snapshot.shipments.slice(0, 7);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> پایلوت امارات
            </span>
            <span className="text-[10px] text-slate-500">آخرین همگام‌سازی: {relative(new Date())}</span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-[24px]">
            مرکز کنترل عملیات — دبی
          </h1>
          <p className="mt-1 text-[12px] text-slate-500">
            نمای یکپارچه محموله‌ها، ناوگان و وضعیت مالی در امارات و کریدورهای خلیج.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SimulateTelemetryOutline />
          
          <Link href="/dashboard/loads" className="btn btn-outline btn-sm">
            تخته بار
          </Link>
          <Link href="/dashboard/shipments/new" className="btn btn-primary btn-sm">
            + ثبت محموله
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="محموله‌های فعال"
          value={num(snapshot.activeShipments.length)}
          unit="محموله"
          icon={<Icons.package />}
          hint={`از ${num(snapshot.shipments.length)} محموله ثبت‌شده`}
          trend={{ value: `${num(snapshot.openLoads)} بار باز`, positive: true }}
        />
        <KpiCard
          label="تحویل به‌موقع"
          value={`${num(snapshot.onTimeRate)}٪`}
          hint={`${num(snapshot.deliveries.length)} تحویل تکمیل‌شده`}
          trend={{ value: "۱.۴٪+", positive: true }}
          tone="accent"
          icon={<Icons.shield />}
        />
        <KpiCard
          label="درآمد ماه جاری"
          value={aedShort(snapshot.monthlyRevenue[5]?.revenue ?? 0).replace(" درهم", "")}
          unit="AED"
          hint={`حاشیه ناخالص ${aedShort(snapshot.grossMargin)}`}
          trend={{ value: `${num(Math.abs(snapshot.monthlyDelta))}٪`, positive: snapshot.monthlyDelta >= 0 }}
          icon={<Icons.wallet />}
        />
        <KpiCard
          label="مطالبات باز"
          value={aedShort(snapshot.receivables).replace(" درهم", "")}
          unit="AED"
          hint={`${num(snapshot.overdueCount)} فاکتور معوق`}
          tone={snapshot.overdueCount > 0 ? "warn" : "default"}
          icon={<Icons.radar />}
          trend={{ value: `${num(snapshot.openInvoiceCount)} فاکتور باز`, positive: false }}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <PanelHeader
            title="درآمد و هزینه عملیاتی"
            subtitle="شش ماه اخیر · درهم امارات"
            action={
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="rounded-md border border-white/10 px-2 py-1">AED</span>
                <span className="rounded-md border border-white/10 px-2 py-1">VAT 5%</span>
              </div>
            }
          />
          <div className="p-5">
            <RevenueChart series={snapshot.monthlyRevenue} height={210} />
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/8 pt-4">
              {[
                { l: "درآمد کل", v: aedShort(snapshot.totalRevenue) },
                { l: "هزینه عملیاتی", v: aedShort(snapshot.totalCost) },
                { l: "سود ناخالص", v: aedShort(snapshot.grossMargin) },
              ].map((item) => (
                <div key={item.l}>
                  <p className="text-[10px] text-slate-500">{item.l}</p>
                  <p className="num mt-1 text-[12px] font-semibold text-slate-200">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <PanelHeader
            title="ترکیب وضعیت محموله‌ها"
            subtitle="کل محموله‌های سامانه"
            action={<span className="num text-[10px] text-slate-500">{num(snapshot.shipments.length)} محموله</span>}
          />
          <div className="p-5">
            <Donut
              centerLabel="محموله فعال"
              centerValue={num(snapshot.activeShipments.length)}
              slices={snapshot.statusSplit.map((slice) => ({
                label: statusMeta(slice.status).label,
                value: slice.value,
                color: STATUS_COLORS[slice.status] ?? "#64748b",
              }))}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <div className="card overflow-hidden">
          <PanelHeader
            title="ناوگان روی نقشه"
            subtitle="موقعیت آخرین پینگ · دبی و امارات شمالی"
            action={
              <Link href="/dashboard/monitoring" className="text-[11px] text-lime hover:underline">
                مانیتورینگ کامل ←
              </Link>
            }
          />
          <div className="p-4">
            <FleetMap vehicles={snapshot.vehicles} height={288} />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { l: "در حرکت", v: num(snapshot.vehicles.filter((v) => v.status === "on_route").length) },
                { l: "آماده", v: num(snapshot.vehicles.filter((v) => v.status === "idle").length) },
                { l: "تعمیرات", v: num(snapshot.vehicles.filter((v) => v.status === "maintenance").length) },
                { l: "میانگین سوخت", v: `${num(Math.round(snapshot.vehicles.reduce((s, v) => s + v.fuelPct, 0) / Math.max(1, snapshot.vehicles.length)))}٪` },
              ].map((item) => (
                <div key={item.l} className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2">
                  <p className="text-[9px] text-slate-500">{item.l}</p>
                  <p className="num mt-0.5 text-[11px] font-semibold text-slate-200">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card flex flex-col">
          <PanelHeader
            title="هشدارهای مرکز کنترل"
            subtitle={`${num(unresolved.length)} هشدار باز`}
            action={
              <Link href="/dashboard/monitoring" className="text-[11px] text-lime hover:underline">
                همه ←
              </Link>
            }
          />
          <ul className="flex-1 divide-y divide-white/6">
            {unresolved.map((alert) => {
              const meta = SEVERITY_META[alert.severity] ?? SEVERITY_META.info;
              return (
                <li key={alert.id} className="flex gap-3 px-5 py-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] ${
                      alert.severity === "critical"
                        ? "bg-rose/15 text-rose"
                        : alert.severity === "warning"
                          ? "bg-amber/15 text-amber"
                          : "bg-sky-400/15 text-sky-300"
                    }`}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-slate-200">{alert.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-5 text-slate-500">{alert.detail}</p>
                    <p className="num mt-1 text-[9px] text-slate-600">{relative(alert.createdAt)}</p>
                  </div>
                </li>
              );
            })}
            {!unresolved.length && (
              <li className="px-5 py-10 text-center text-[11px] text-slate-500">هشدار بازی وجود ندارد.</li>
            )}
          </ul>
          <div className="border-t border-white/8 p-4">
            <Link href="/dashboard/accounting" className="flex items-center justify-between rounded-xl border border-amber/20 bg-amber/[0.06] px-3 py-2.5">
              <span className="text-[11px] text-amber">مطالبات معوق نیازمند پیگیری</span>
              <span className="num text-[12px] font-bold text-amber">{aedShort(snapshot.overdueAmount)}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
        <div className="card overflow-hidden">
          <PanelHeader
            title="محموله‌های اخیر"
            subtitle="آخرین به‌روزرسانی‌ها از مرکز کنترل"
            action={
              <Link href="/dashboard/shipments" className="text-[11px] text-lime hover:underline">
                همه محموله‌ها ←
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>کد رهگیری</th>
                  <th>مسیر</th>
                  <th>مشتری</th>
                  <th>پیشرفت</th>
                  <th>وضعیت</th>
                  <th>مبلغ</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <Link
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="font-mono text-[11px] text-slate-200 transition hover:text-lime"
                      >
                        {shipment.trackingCode}
                      </Link>
                      <p className="mt-0.5 text-[9.5px] text-slate-600">{SERVICE_LABELS[shipment.service]}</p>
                    </td>
                    <td className="min-w-[170px]">
                      <RouteStrip
                        origin={shipment.originCity}
                        destination={shipment.destCity}
                        progress={shipment.progressPct}
                        compact
                      />
                    </td>
                    <td>
                      <span className="block max-w-[150px] truncate text-[11px] text-slate-300">
                        {shipment.customerName}
                      </span>
                      <span className="text-[9.5px] text-slate-600">{shipment.cargoType}</span>
                    </td>
                    <td className="w-24">
                      <div className="flex items-center gap-2">
                        <Progress value={shipment.progressPct} />
                        <span className="num text-[10px] text-slate-400">{num(shipment.progressPct)}٪</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="num whitespace-nowrap text-[11px] text-slate-300">{num(shipment.revenueAed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card">
            <PanelHeader title="آخرین رویدادها" subtitle="جریان زنده ترکینگ" />
            <ul className="divide-y divide-white/6">
              {snapshot.activity.map((event) => (
                <li key={event.id} className="px-5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                      <span className={`h-1.5 w-1.5 rounded-full ${statusMeta(event.status).dot}`} />
                      {event.title}
                    </span>
                    <span className="num text-[9px] text-slate-600">{relative(event.occurredAt)}</span>
                  </div>
                  <p className="mt-0.5 pr-3 font-mono text-[9.5px] text-slate-500">
                    {event.trackingCode} · {event.location}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <PanelHeader title="پرترافیک‌ترین مقاصد" subtitle="بر اساس درآمد" />
            <div className="p-5">
              <LaneBars lanes={snapshot.topLanes} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "تناژ در حال جابه‌جایی", v: `${num(snapshot.totalWeight)} کیلوگرم`, s: "کل محموله‌های ثبت‌شده" },
          { l: "بارهای باز تخته بار", v: `${num(snapshot.openLoads)} بار`, s: "آماده جذب ناوگان" },
          { l: "میانگین درآمد محموله", v: aedShort(Math.round(snapshot.totalRevenue / Math.max(1, snapshot.shipments.length))), s: "درهم" },
          { l: "راننده در دسترس", v: `${num(snapshot.drivers.filter((d) => d.status === "available").length)} نفر`, s: "برای تخصیص فوری" },
        ].map((item) => (
          <div key={item.l} className="card px-4 py-3.5">
            <p className="text-[10px] text-slate-500">{item.l}</p>
            <p className="num mt-1 text-[14px] font-extrabold text-white">{item.v}</p>
            <p className="mt-0.5 text-[9.5px] text-slate-600">{item.s}</p>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 border-lime/15 bg-lime/[0.04] p-5">
        <div>
          <p className="text-[13px] font-bold text-white">آماده برای بستن دوره مالی این ماه؟</p>
          <p className="mt-1 text-[11px] text-slate-400">
            فاکتورهای ارسال‌شده، دریافتی‌ها و مطالبات معوق در ماژول حسابداری آماده بررسی است.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/accounting" className="btn btn-primary btn-sm">
            مشاهده حسابداری
          </Link>
          <Link href="/dashboard/shipments" className="btn btn-outline btn-sm">
            لیست محموله‌ها
          </Link>
        </div>
      </div>

      <p className="pb-2 text-center text-[10px] text-slate-600">
        پنجره بعدی تحویل:{" "}
        {snapshot.activeShipments[0] ? `محموله ${snapshot.activeShipments[0].trackingCode} تا ${countdown(snapshot.activeShipments[0].etaAt)}` : "—"}
      </p>
    </div>
  );
}
