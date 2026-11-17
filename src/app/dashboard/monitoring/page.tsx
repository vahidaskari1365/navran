"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FleetMap, RouteStrip } from "@/components/charts";
import { Icons, KpiCard, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { ResolveAlertButton, TelemetryButton } from "@/components/dashboard/actions";
import { EQUIPMENT_LABELS, SEVERITY_META, faTime, num, relative, statusMeta } from "@/lib/format";
import { fleetSnapshot } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

export default function MonitoringPage() {
  const { data } = useNavaran();
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") ?? "all");
  }, []);

  const snapshot = fleetSnapshot(data);
  const vehicles = status === "all" ? snapshot.vehicles : snapshot.vehicles.filter((v) => v.status === status);
  const openAlerts = snapshot.alerts.filter((alert) => !alert.isResolved);
  const avgFuel = Math.round(
    snapshot.vehicles.reduce((sum, vehicle) => sum + vehicle.fuelPct, 0) / Math.max(1, snapshot.vehicles.length),
  );

  const tempIssue = (type: string, temp: number) =>
    type === "reefer" ? temp > 8 || temp < -25 : temp > 45;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white">مانیتورینگ ناوگان</h1>
            <span className="badge badge-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> تله‌متری زنده
            </span>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            {num(snapshot.vehicles.length)} خودرو، {num(snapshot.inTransit.length)} محموله در مسیر — پینگ هر ۵ دقیقه در امارات.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TelemetryButton />
          <Link href="/dashboard/shipments" className="btn btn-outline btn-sm">
            محموله‌های در مسیر
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="خودرو در حرکت"
          value={num(snapshot.vehicles.filter((v) => v.status === "on_route").length)}
          unit={`از ${num(snapshot.vehicles.length)}`}
          hint="تخصیص‌یافته به محموله"
          tone="accent"
          icon={<Icons.truck />}
        />
        <KpiCard
          label="هشدار باز"
          value={num(openAlerts.length)}
          unit="مورد"
          hint={`${num(snapshot.alerts.length)} رخداد امروز`}
          tone={openAlerts.length ? "danger" : "default"}
          icon={<Icons.radar />}
        />
        <KpiCard label="میانگین سوخت" value={`${num(avgFuel)}٪`} hint="بر اساس آخرین پینگ" icon={<Icons.wallet />} />
        <KpiCard
          label="راننده در دسترس"
          value={num(snapshot.drivers.filter((d) => d.status === "available").length)}
          unit="نفر"
          hint={`${num(snapshot.drivers.length)} راننده ثبت‌شده`}
          icon={<Icons.shield />}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden">
          <PanelHeader
            title="نقشه زنده امارات"
            subtitle="موقعیت آخرین پینگ — بزرگ‌نمایی خودکار بر پایه مختصات GPS"
            action={
              <span className="num flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {faTime(new Date())} GST
              </span>
            }
          />
          <div className="p-4">
            <FleetMap vehicles={snapshot.vehicles} height={330} />
          </div>
        </div>

        <div className="card flex flex-col overflow-hidden">
          <PanelHeader title="رخدادها و هشدارها" subtitle="قواعد پایش دما، تأخیر و مالی" />
          <ul className="flex-1 divide-y divide-white/6">
            {snapshot.alerts.map((alert) => {
              const meta = SEVERITY_META[alert.severity] ?? SEVERITY_META.info;
              return (
                <li key={alert.id} className={`px-4 py-3 ${alert.isResolved ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${meta.tone}`}>{meta.label}</span>
                        <span className="num text-[9px] text-slate-600">{relative(alert.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] font-semibold text-slate-200">{alert.title}</p>
                      <p className="mt-0.5 text-[10px] leading-5 text-slate-500">{alert.detail}</p>
                    </div>
                    {!alert.isResolved ? (
                      <ResolveAlertButton alertId={alert.id} />
                    ) : (
                      <span className="badge badge-neutral">بسته شده</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { value: "all", label: "همه خودروها" },
          { value: "on_route", label: "در مسیر" },
          { value: "idle", label: "آماده به کار" },
          { value: "maintenance", label: "تعمیرات" },
        ].map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/dashboard/monitoring" : `/dashboard/monitoring?status=${filter.value}`}
            className={`rounded-lg border px-3 py-1.5 text-[11px] transition ${
              status === filter.value
                ? "border-lime/30 bg-lime/12 font-semibold text-lime"
                : "border-white/8 bg-white/[0.02] text-slate-400 hover:text-white"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <PanelHeader title="ناوگان" subtitle="وضعیت، راننده و تله‌متری هر خودرو" />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>پلاک / نوع</th>
                <th>موقعیت</th>
                <th>راننده</th>
                <th>سرعت</th>
                <th>دمای محفظه</th>
                <th>سوخت</th>
                <th>پینگ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const issue = tempIssue(vehicle.type, vehicle.tempC);
                return (
                  <tr key={vehicle.id}>
                    <td>
                      <span className="font-mono text-[11px] text-slate-100">{vehicle.plate}</span>
                      <p className="text-[9.5px] text-slate-600">
                        {EQUIPMENT_LABELS[vehicle.type] ?? vehicle.type} · {num(vehicle.capacityKg / 1000)} تن
                      </p>
                    </td>
                    <td>
                      <span className="text-[11px] text-slate-300">{vehicle.currentCity}</span>
                      <p className="num text-[9px] text-slate-600" dir="ltr">
                        {vehicle.lat.toFixed(3)}, {vehicle.lng.toFixed(3)}
                      </p>
                    </td>
                    <td>
                      <span className="text-[11px] text-slate-300">{vehicle.driverName ?? "—"}</span>
                      <p className="num text-[9px] text-slate-600">
                        {vehicle.driverRating ? `★ ${String(vehicle.driverRating).replace(".", "٫")}` : "بدون راننده"}
                      </p>
                    </td>
                    <td>
                      <span className={`num text-[11px] ${vehicle.speedKph > 0 ? "text-slate-200" : "text-slate-600"}`}>
                        {num(vehicle.speedKph)} km/h
                      </span>
                    </td>
                    <td>
                      <span className={`num text-[11px] ${issue ? "font-bold text-rose" : "text-slate-200"}`}>
                        {num(Math.round(vehicle.tempC))}°C
                      </span>
                      {vehicle.type === "reefer" && <p className="text-[9px] text-slate-600">زنجیره سرد</p>}
                    </td>
                    <td className="w-28">
                      <div className="flex items-center gap-2">
                        <Progress value={vehicle.fuelPct} tone={vehicle.fuelPct < 30 ? "amber" : "lime"} />
                        <span className="num text-[9.5px] text-slate-400">{num(vehicle.fuelPct)}٪</span>
                      </div>
                    </td>
                    <td>
                      <span className="num text-[10px] text-slate-400">{relative(vehicle.lastPingAt)}</span>
                    </td>
                    <td>
                      <StatusBadge status={vehicle.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <PanelHeader title="محموله‌های در مسیر" subtitle="پیشرفت مسیر و زمان تخمینی رسیدن" />
          <ul className="divide-y divide-white/6">
            {snapshot.inTransit.map((shipment) => (
              <li key={shipment.id} className="px-5 py-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/shipments/${shipment.id}`}
                    className="font-mono text-[10.5px] text-slate-200 hover:text-lime"
                  >
                    {shipment.trackingCode}
                  </Link>
                  <span className="num text-[9.5px] text-slate-500">
                    ETA {relative(shipment.etaAt)}
                  </span>
                </div>
                <RouteStrip
                  origin={shipment.originCity}
                  destination={shipment.destCity}
                  progress={shipment.progressPct}
                  compact
                />
              </li>
            ))}
            {!snapshot.inTransit.length && (
              <li className="px-5 py-8 text-center text-[11px] text-slate-500">محموله‌ای در مسیر نیست.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <PanelHeader title="رانندگان" subtitle="وضعیت و امتیاز عملکرد" />
          <ul className="divide-y divide-white/6">
            {snapshot.drivers.map((driver) => (
              <li key={driver.id} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <p className="text-[11.5px] font-medium text-slate-200">{driver.name}</p>
                  <p className="num text-[9.5px] text-slate-600" dir="ltr">
                    {driver.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-[10px] text-amber">★ {String(driver.rating).replace(".", "٫")}</span>
                  <StatusBadge status={driver.status} />
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-white/8 px-5 py-2.5 text-[9.5px] text-slate-600">
            وضعیت رانندگان بر اساس ساعات مجاز رانندگی و تخصیص فعلی محاسبه می‌شود ({statusMeta("available").label} /{" "}
            {statusMeta("rest").label}).
          </p>
        </div>
      </div>
    </div>
  );
}
