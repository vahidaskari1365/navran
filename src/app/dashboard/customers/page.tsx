"use client";

import Link from "next/link";
import { Icons, KpiCard, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { aedShort, faDateShort, num, percent } from "@/lib/format";
import { customersOverview } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

export default function CustomersPage() {
  const { data } = useNavaran();
  const customers = customersOverview(data);
  const totals = {
    credit: customers.reduce((sum, customer) => sum + customer.creditLimitAed, 0),
    balance: customers.reduce((sum, customer) => sum + customer.balanceAed, 0),
    revenue: customers.reduce((sum, customer) => sum + customer.revenueAed, 0),
    active: customers.reduce((sum, customer) => sum + customer.activeCount, 0),
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">مشتریان و اعتبار</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            {num(customers.length)} مشتری B2B در امارات — مانده مطالبات، سقف اعتبار و عملکرد حمل.
          </p>
        </div>
        <Link href="/dashboard/shipments" className="btn btn-outline btn-sm">
          محموله‌های مشتریان
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="مشتریان فعال" value={num(customers.length)} unit="شرکت" hint="پایلوت دبی" icon={<Icons.shield />} />
        <KpiCard label="مجموع سقف اعتبار" value={aedShort(totals.credit).replace(" درهم", "")} unit="AED" hint="قابل تمدید سالانه" />
        <KpiCard
          label="مانده مطالبات"
          value={aedShort(totals.balance).replace(" درهم", "")}
          unit="AED"
          tone="warn"
          hint={`${num(percent(totals.balance, totals.credit))}٪ از سقف اعتبار`}
          icon={<Icons.wallet />}
        />
        <KpiCard
          label="درآمد ثبت‌شده"
          value={aedShort(totals.revenue).replace(" درهم", "")}
          unit="AED"
          tone="accent"
          hint={`${num(totals.active)} محموله فعال`}
        />
      </div>

      <div className="card overflow-hidden">
        <PanelHeader title="پرتفوی مشتریان" subtitle="ترتیب بر اساس سقف اعتبار" />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>مشتری</th>
                <th>حوزه فعالیت</th>
                <th>رابط / تماس</th>
                <th>محموله</th>
                <th>درآمد (AED)</th>
                <th>مانده بدهی</th>
                <th>استفاده از اعتبار</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const usage = percent(customer.balanceAed, customer.creditLimitAed);
                return (
                  <tr key={customer.id}>
                    <td>
                      <p className="max-w-[180px] truncate text-[11.5px] font-semibold text-slate-100">{customer.name}</p>
                      <p className="num text-[9px] text-slate-600" dir="ltr">
                        TRN {customer.trn ?? "—"}
                      </p>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{customer.industry}</span>
                      <p className="mt-1 text-[9.5px] text-slate-600">{customer.emirate}</p>
                    </td>
                    <td>
                      <p className="text-[11px] text-slate-300">{customer.contactName}</p>
                      <p className="num text-[9.5px] text-slate-600" dir="ltr">
                        {customer.phone}
                      </p>
                    </td>
                    <td>
                      <p className="num text-[11px] text-slate-200">{num(customer.shipmentCount)}</p>
                      <p className="num text-[9px] text-slate-600">{num(customer.activeCount)} فعال</p>
                    </td>
                    <td className="num text-[11px] text-slate-200">{num(customer.revenueAed)}</td>
                    <td className={`num text-[11px] ${customer.balanceAed > 0 ? "text-amber" : "text-slate-500"}`}>
                      {num(customer.balanceAed)}
                    </td>
                    <td className="w-32">
                      <div className="flex items-center gap-2">
                        <Progress value={usage} tone={usage > 70 ? "rose" : usage > 40 ? "amber" : "lime"} />
                        <span className="num text-[9.5px] text-slate-400">{num(usage)}٪</span>
                      </div>
                      <p className="num mt-1 text-[8.5px] text-slate-600">سقف {num(customer.creditLimitAed)}</p>
                    </td>
                    <td>
                      <StatusBadge status={customer.status} />
                      <p className="num mt-1 text-[8.5px] text-slate-600">{faDateShort(customer.createdAt)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {customers.slice(0, 3).map((customer) => (
          <div key={customer.id} className="card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-white">{customer.name}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {customer.industry} · {customer.emirate}
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/12 text-[10px] font-bold text-lime">
                {aedShort(customer.creditLimitAed).replace(" هزار درهم", "K").replace(" درهم", "")}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-[10.5px]">
              <div className="flex justify-between">
                <dt className="text-slate-500">محموله‌های فعال</dt>
                <dd className="num text-slate-200">{num(customer.activeCount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">مانده مطالبات</dt>
                <dd className="num text-amber">{num(customer.balanceAed)} درهم</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">ایمیل</dt>
                <dd className="text-slate-300" dir="ltr">
                  {customer.email}
                </dd>
              </div>
            </dl>
            <Link
              href={`/dashboard/shipments?q=${encodeURIComponent(customer.name)}`}
              className="btn btn-outline btn-sm mt-4 w-full"
            >
              مشاهده محموله‌ها
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
