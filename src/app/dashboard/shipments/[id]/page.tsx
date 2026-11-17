"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RouteStrip } from "@/components/charts";
import { CopyButton } from "@/components/copy-button";
import { AssignForm, EventForm } from "@/components/dashboard/actions";
import { TrackingTimeline } from "@/components/tracking";
import { EmptyState, Icons, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { MODE_LABELS, SERVICE_LABELS, aedShort, faDateTime, num } from "@/lib/format";
import { useNavaran } from "@/lib/store";

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useNavaran();
  const id = Number(params?.id);
  const shipment = data.shipments.find((row) => row.id === id);

  if (!shipment) {
    return (
      <div className="card">
        <EmptyState title="محموله یافت نشد" description="این محموله در داده‌های مرورگر شما وجود ندارد." />
        <div className="flex justify-center pb-6">
          <Link href="/dashboard/shipments" className="btn btn-outline btn-sm">
            بازگشت به فهرست
          </Link>
        </div>
      </div>
    );
  }

  const events = data.events
    .filter((event) => event.shipmentId === shipment.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const customer = data.customers.find((row) => row.id === shipment.customerId) ?? null;
  const invoice = [...data.invoices]
    .filter((row) => row.shipmentId === shipment.id)
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0];
  const vehicle = data.vehicles.find((row) => row.id === shipment.vehicleId);
  const driver = data.drivers.find((row) => row.id === shipment.driverId);
  const margin = shipment.revenueAed - shipment.costAed;
  const marginPct = shipment.revenueAed ? Math.round((margin / shipment.revenueAed) * 100) : 0;
  const publicUrl = `https://navaran.ae/track/${shipment.trackingCode}`;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/shipments" className="text-[11px] text-slate-500 transition hover:text-lime">
            ← محموله‌ها
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl font-extrabold tracking-tight text-white">{shipment.trackingCode}</h1>
            <StatusBadge status={shipment.status} />
            <span className="badge badge-neutral">{MODE_LABELS[shipment.mode]}</span>
            <span className="badge badge-neutral">{SERVICE_LABELS[shipment.service]}</span>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            {shipment.originCity} → {shipment.destCity}
            {shipment.destCountry !== "AE" ? ` (${shipment.destCountry})` : ""} · {customer?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={publicUrl} label="کپی لینک رهگیری" />
          <Link href={`/track/${shipment.trackingCode}`} className="btn btn-outline btn-sm">
            صفحه عمومی
          </Link>
          <Link href="/dashboard/shipments/new" className="btn btn-primary btn-sm">
            + محموله جدید
          </Link>
        </div>
      </header>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <div className="card">
            <PanelHeader
              title="مسیر و وضعیت لحظه‌ای"
              subtitle={`آخرین به‌روزرسانی ${faDateTime(events[0]?.occurredAt ?? shipment.createdAt)}`}
              action={<span className="num text-[10px] text-lime">{num(shipment.progressPct)}٪ مسیر</span>}
            />
            <div className="p-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <RouteStrip origin={shipment.originCity} destination={shipment.destCity} progress={shipment.progressPct} />
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: "بارگیری", v: faDateTime(shipment.pickupAt) },
                    { l: "ETA", v: faDateTime(shipment.etaAt) },
                    { l: "تحویل", v: shipment.deliveredAt ? faDateTime(shipment.deliveredAt) : "در انتظار" },
                    { l: "اینکوترم", v: shipment.incoterm },
                  ].map((item) => (
                    <div key={item.l}>
                      <p className="text-[9px] text-slate-500">{item.l}</p>
                      <p className="num mt-0.5 text-[10.5px] font-medium text-slate-200">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { l: "نوع بار", v: shipment.cargoType },
                  { l: "وزن", v: `${num(shipment.weightKg)} kg` },
                  { l: "حجم", v: `${num(shipment.volumeM3)} m³` },
                  { l: "تعداد بسته", v: num(shipment.pieces) },
                  { l: "دما", v: shipment.temperatureC ? `${num(shipment.temperatureC)}°C` : "—" },
                  { l: "خودرو", v: vehicle?.plate ?? "تخصیص نیافته" },
                  { l: "راننده", v: driver?.name ?? "تخصیص نیافته" },
                  { l: "حاشیه", v: `${num(marginPct)}٪` },
                ].map((item) => (
                  <div key={item.l} className="rounded-xl border border-white/8 bg-[#080f19] px-3 py-2.5">
                    <p className="text-[9px] text-slate-500">{item.l}</p>
                    <p className="num mt-1 truncate text-[11px] font-semibold text-slate-200">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <PanelHeader
              title="تایم‌لاین ترکینگ"
              subtitle={`${num(events.length)} رویداد — همگام با پورتال مشتری`}
              action={
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ذخیره‌شده در مرورگر
                </span>
              }
            />
            <div className="p-5">
              <TrackingTimeline events={events} />
            </div>
            <EventForm shipmentId={shipment.id} defaultLocation={`${shipment.destCity}, ${shipment.destCountry}`} />
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card">
            <PanelHeader title="مشتری" />
            <div className="space-y-2 p-5 text-[11px]">
              <p className="text-[13px] font-bold text-white">{customer?.name ?? "—"}</p>
              <p className="text-slate-500">{customer?.industry}</p>
              <div className="mt-2 space-y-1.5 border-t border-white/8 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">رابط</span>
                  <span className="text-slate-200">{customer?.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تلفن</span>
                  <span className="num text-slate-200" dir="ltr">
                    {customer?.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ایمیل</span>
                  <span className="text-slate-200" dir="ltr">
                    {customer?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TRN</span>
                  <span className="num text-slate-200" dir="ltr">
                    {customer?.trn ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سقف اعتبار</span>
                  <span className="num text-slate-200">{aedShort(customer?.creditLimitAed ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <PanelHeader title="تخصیص ناوگان و راننده" subtitle="ظرفیت و مجوز مسیر بررسی شود" />
            <AssignForm
              shipmentId={shipment.id}
              vehicleId={shipment.vehicleId}
              driverId={shipment.driverId}
              fleet={data.vehicles}
              drivers={data.drivers}
            />
          </div>

          <div className="card">
            <PanelHeader title="مالی محموله" subtitle="درهم امارات · VAT ۵٪" />
            <div className="space-y-2 p-5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">کرایه فروش</span>
                <span className="num text-slate-200">{num(shipment.revenueAed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">هزینه مستقیم</span>
                <span className="num text-slate-200">{num(shipment.costAed)}</span>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-2">
                <span className="font-semibold text-white">سود ناخالص</span>
                <span className="num font-bold text-lime">{num(margin)}</span>
              </div>
              <div className="mt-2">
                <Progress value={marginPct} />
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                {invoice ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10.5px] text-slate-300">{invoice.number}</span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-slate-500">مبلغ با VAT</span>
                      <span className="num text-slate-200">{num(invoice.totalAed)}</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-slate-500">پرداخت‌شده</span>
                      <span className="num text-slate-200">{num(invoice.paidAed)}</span>
                    </div>
                    <Link href="/dashboard/accounting" className="mt-1 block text-[10.5px] text-lime hover:underline">
                      مدیریت در حسابداری ←
                    </Link>
                  </div>
                ) : (
                  <p className="text-[10.5px] text-slate-500">برای این محموله فاکتوری صادر نشده است.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold text-white">
              <span className="text-lime">
                <Icons.shield />
              </span>
              یادداشت عملیاتی
            </div>
            <p className="mt-2 text-[11px] leading-6 text-slate-400">{shipment.notes ?? "یادداشتی ثبت نشده است."}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
