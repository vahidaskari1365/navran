"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RouteStrip } from "@/components/charts";
import { EmptyState, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { MODE_LABELS, SERVICE_LABELS, aedShort, faDateShort, num, statusMeta } from "@/lib/format";
import { enrichShipments } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

const STATUS_FILTERS = [
  { value: "all", label: "همه" },
  { value: "booked", label: "ثبت شده" },
  { value: "in_transit", label: "در مسیر" },
  { value: "customs", label: "گمرک" },
  { value: "out_for_delivery", label: "توزیع نهایی" },
  { value: "delivered", label: "تحویل شده" },
  { value: "exception", label: "استثنا" },
];

export default function ShipmentsPage() {
  const { data } = useNavaran();
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") ?? "all");
    setMode(params.get("mode") ?? "all");
    const q = params.get("q") ?? "";
    setQuery(q);
    setApplied(q);
  }, []);

  const rows = useMemo(() => {
    const needle = applied.trim().toLowerCase();
    return enrichShipments(data).filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (mode !== "all" && row.mode !== mode) return false;
      if (!needle) return true;
      return [row.trackingCode, row.customerName ?? "", row.cargoType, row.destCity, row.originCity]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [data, status, mode, applied]);

  const totals = {
    weight: rows.reduce((sum, row) => sum + row.weightKg, 0),
    revenue: rows.reduce((sum, row) => sum + row.revenueAed, 0),
    cost: rows.reduce((sum, row) => sum + row.costAed, 0),
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">مدیریت حمل و نقل</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            {num(rows.length)} محموله · {aedShort(totals.revenue)} درآمد ثبت‌شده در این نما
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/loads" className="btn btn-outline btn-sm">
            تخته بار
          </Link>
          <Link href="/dashboard/shipments/new" className="btn btn-primary btn-sm">
            + ثبت محموله
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition ${
              status === item.value
                ? "border-lime/30 bg-lime/12 font-semibold text-lime"
                : "border-white/8 bg-white/[0.02] text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        className="card flex flex-wrap items-end gap-3 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(query);
        }}
      >
        <div className="min-w-[180px] flex-1">
          <label className="label" htmlFor="q">
            جستجو
          </label>
          <input
            id="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field h-9"
            placeholder="کد رهگیری، مشتری، مقصد یا نوع بار"
          />
        </div>
        <div>
          <label className="label" htmlFor="mode">
            شیوه حمل
          </label>
          <select id="mode" value={mode} onChange={(event) => setMode(event.target.value)} className="field h-9 w-36">
            <option value="all">همه</option>
            {Object.entries(MODE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-outline h-9">
          اعمال فیلتر
        </button>
        <button
          type="button"
          className="btn btn-ghost h-9 text-[11px]"
          onClick={() => {
            setQuery("");
            setApplied("");
            setStatus("all");
            setMode("all");
          }}
        >
          پاک‌سازی
        </button>
      </form>

      <div className="card overflow-hidden">
        <PanelHeader
          title="فهرست محموله‌ها"
          subtitle={`${num(totals.weight)} کیلوگرم بار در این نما`}
          action={<span className="num text-[10px] text-slate-500">حاشیه ناخالص: {aedShort(totals.revenue - totals.cost)}</span>}
        />
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>کد / سرویس</th>
                  <th>مشتری و بار</th>
                  <th>مسیر</th>
                  <th>ناوگان و راننده</th>
                  <th>ETA</th>
                  <th>وضعیت</th>
                  <th>مالی (AED)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        href={`/dashboard/shipments/${row.id}`}
                        className="font-mono text-[11px] text-slate-100 transition hover:text-lime"
                      >
                        {row.trackingCode}
                      </Link>
                      <p className="mt-0.5 text-[9.5px] text-slate-600">{SERVICE_LABELS[row.service]}</p>
                    </td>
                    <td>
                      <span className="block max-w-[170px] truncate text-[11.5px] text-slate-200">{row.customerName}</span>
                      <span className="text-[9.5px] text-slate-600">
                        {row.cargoType} · {num(row.weightKg)} kg
                      </span>
                    </td>
                    <td className="min-w-[180px]">
                      <RouteStrip origin={row.originCity} destination={row.destCity} progress={row.progressPct} compact />
                      <p className="mt-1 text-[9px] text-slate-600">
                        {MODE_LABELS[row.mode]} · {row.destCountry === "AE" ? "داخلی" : `بین‌المللی (${row.destCountry})`}
                      </p>
                    </td>
                    <td>
                      <span className="font-mono text-[10.5px] text-slate-300">{row.vehiclePlate ?? "—"}</span>
                      <p className="text-[9.5px] text-slate-600">{row.driverName ?? "بدون راننده"}</p>
                    </td>
                    <td>
                      <span className="num text-[10.5px] text-slate-300">{faDateShort(row.etaAt)}</span>
                      <div className="mt-1 w-16">
                        <Progress value={row.progressPct} tone={row.status === "exception" ? "rose" : "lime"} />
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td>
                      <span className="num block text-[11px] text-slate-200">{num(row.revenueAed)}</span>
                      <span className="num text-[9px] text-slate-600">هزینه {num(row.costAed)}</span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/shipments/${row.id}`}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-300 transition hover:border-lime/40 hover:text-lime"
                      >
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="محموله‌ای با این فیلتر یافت نشد"
            description="فیلترها را تغییر دهید یا محموله جدیدی ثبت کنید."
          />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(
          rows.reduce<Record<string, number>>((acc, row) => {
            acc[row.status] = (acc[row.status] ?? 0) + 1;
            return acc;
          }, {}),
        )
          .slice(0, 3)
          .map(([statusKey, count]) => (
            <div key={statusKey} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] text-slate-500">{statusMeta(statusKey).label}</p>
                <p className="num mt-1 text-lg font-extrabold text-white">{num(count)}</p>
              </div>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${statusMeta(statusKey).tone}`}>
                ▤
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
