"use client";

import Link from "next/link";
import { useState } from "react";
import { BidButton, ConvertLoadButton, NewLoadForm } from "@/components/dashboard/actions";
import { EmptyState, KpiCard, PanelHeader, StatusBadge } from "@/components/ui";
import { EQUIPMENT_LABELS, aedShort, faDateTime, num, relative } from "@/lib/format";
import { loadBoard } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

const FILTERS = [
  { value: "all", label: "همه بارها" },
  { value: "open", label: "بار باز" },
  { value: "bidding", label: "در حال پیشنهاد" },
  { value: "assigned", label: "تخصیص یافته" },
];

export default function LoadsPage() {
  const { data } = useNavaran();
  const [status, setStatus] = useState("all");
  const { rows, summary } = loadBoard(data, status);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">مدیریت بار</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            تخته بار زنده برای جذب باربران امارات و تخصیص ناوگان — {num(summary.open + summary.bidding)} بار فعال.
          </p>
        </div>
        <Link href="/dashboard/shipments" className="btn btn-outline btn-sm">
          محموله‌های فعال
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="بار باز" value={num(summary.open)} unit="بار" hint="آماده دریافت پیشنهاد" tone="accent" />
        <KpiCard label="در حال پیشنهاد" value={num(summary.bidding)} unit="بار" hint="رقابت نرخ فعال" />
        <KpiCard label="تخصیص یافته" value={num(summary.assigned)} unit="بار" hint="تبدیل‌شده به محموله" />
        <KpiCard
          label="ارزش کل بارها"
          value={aedShort(summary.value).replace(" درهم", "")}
          unit="AED"
          hint={`${num(summary.weight)} کیلوگرم ظرفیت`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] transition ${
              status === filter.value
                ? "border-lime/30 bg-lime/12 font-semibold text-lime"
                : "border-white/8 bg-white/[0.02] text-slate-400 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {rows.length ? (
            rows.map((load) => (
              <article key={load.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 px-5 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{load.reference}</span>
                      <StatusBadge status={load.status} />
                      <span className="badge badge-neutral">{EQUIPMENT_LABELS[load.equipment] ?? load.equipment}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] font-bold text-white">{load.shipperName}</p>
                  </div>
                  <div className="text-left">
                    <p className="num text-[13px] font-extrabold text-lime">{num(load.budgetAed)} درهم</p>
                    <p className="text-[9.5px] text-slate-500">بودجه اعلامی</p>
                  </div>
                </div>
                <div className="grid gap-4 px-5 py-3.5 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="text-slate-200">{load.originCity}</span>
                      <span className="text-slate-600">←</span>
                      <span className="text-slate-200">{load.destCity}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {load.cargoType} · {num(load.weightKg)} کیلوگرم
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    <p>
                      آماده بارگیری: <span className="num text-slate-300">{faDateTime(load.readyDate)}</span>
                    </p>
                    <p className="num mt-0.5">
                      {num(load.bidCount)} پیشنهاد · {relative(load.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BidButton loadId={load.id} disabled={load.status === "assigned"} />
                    <ConvertLoadButton loadId={load.id} disabled={load.status === "assigned"} />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="card">
              <EmptyState title="باری با این وضعیت موجود نیست" description="فیلتر دیگری را انتخاب کنید." />
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card overflow-hidden">
            <PanelHeader title="ثبت بار جدید" subtitle="ظرف ۲ دقیقه روی تخته بار" />
            <NewLoadForm />
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold text-white">قواعد تخته بار</p>
            <ul className="mt-2.5 space-y-2 text-[10.5px] leading-5 text-slate-400">
              <li className="flex gap-2">
                <span className="text-lime">•</span> هر بار تا ۴۸ ساعت روی تخته فعال می‌ماند.
              </li>
              <li className="flex gap-2">
                <span className="text-lime">•</span> پس از تخصیص، بارنامه و کد رهگیری خودکار صادر می‌شود.
              </li>
              <li className="flex gap-2">
                <span className="text-lime">•</span> نرخ پیشنهادی باید شامل عوارض و سوخت باشد.
              </li>
              <li className="flex gap-2">
                <span className="text-lime">•</span> بارهای زنجیره سرد نیازمند خودروی یخچالی است.
              </li>
            </ul>
          </div>
          <div className="card border-lime/15 bg-lime/[0.05] p-5">
            <p className="text-[11px] font-bold text-white">شبکه باربران امارات</p>
            <p className="mt-1 text-[10.5px] leading-5 text-slate-400">
              در پایلوت دبی، بارهای داخلی و کریدورهای خلیج با ناوگان قراردادی پوشش داده می‌شود.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
