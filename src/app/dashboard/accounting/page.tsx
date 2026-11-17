"use client";

import Link from "next/link";
import { Donut, RevenueChart } from "@/components/charts";
import { Icons, KpiCard, PanelHeader, Progress, StatusBadge } from "@/components/ui";
import { ExpenseForm, MarkInvoiceSentButton, PaymentForm } from "@/components/dashboard/actions";
import { aedShort, faDateShort, num, relative } from "@/lib/format";
import { accountingSnapshot, dashboardSnapshot } from "@/lib/selectors";
import { useNavaran } from "@/lib/store";

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "انتقال بانکی",
  cheque: "چک",
  card: "کارت",
  cash: "نقدی",
};


const BUCKET_COLORS: Record<string, string> = {
  accent: "border-lime/25 bg-lime/[0.06] text-lime",
  info: "border-sky-400/25 bg-sky-400/[0.06] text-sky-300",
  warn: "border-amber/25 bg-amber/[0.06] text-amber",
  danger: "border-rose/25 bg-rose/[0.06] text-rose",
};

export default function AccountingPage() {
  const { data } = useNavaran();
  const snapshot = accountingSnapshot(data);
  const dashboard = dashboardSnapshot(data);
  const invoiceRows = snapshot.invoices.slice(0, 12);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white">حسابداری و مالی</h1>
            <span className="badge badge-neutral">AED · VAT 5%</span>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            فاکتورهای پایلوت امارات، دریافتی‌ها، مطالبات و سود ناخالص به تفکیک محموله.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/shipments/new" className="btn btn-outline btn-sm">
            + محموله و فاکتور
          </Link>
          <Link href="/dashboard/customers" className="btn btn-primary btn-sm">
            اعتبار مشتریان
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="صورت‌حساب صادرشده"
          value={aedShort(snapshot.billed).replace(" درهم", "")}
          unit="AED"
          hint={`${num(snapshot.invoices.length)} فاکتور`}
          icon={<Icons.wallet />}
        />
        <KpiCard
          label="وصول‌شده"
          value={aedShort(snapshot.collected).replace(" درهم", "")}
          unit="AED"
          hint={`${num(Math.round((snapshot.collected / Math.max(1, snapshot.billed)) * 100))}٪ از کل`}
          tone="accent"
          icon={<Icons.shield />}
        />
        <KpiCard
          label="مطالبات باز"
          value={aedShort(snapshot.outstanding).replace(" درهم", "")}
          unit="AED"
          hint={`${num(snapshot.invoices.filter((i) => i.status === "overdue").length)} فاکتور معوق`}
          tone="warn"
          icon={<Icons.radar />}
        />
        <KpiCard
          label="VAT قابل پرداخت"
          value={aedShort(snapshot.vatTotal).replace(" درهم", "")}
          unit="AED"
          hint="۵٪ مالیات بر ارزش افزوده"
          icon={<Icons.package />}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <PanelHeader title="روند درآمد و هزینه" subtitle="ماه‌های اخیر — درهم" />
          <div className="p-5">
            <RevenueChart series={dashboard.monthlyRevenue} height={200} />
          </div>
        </div>
        <div className="card">
          <PanelHeader title="سن‌بندی مطالبات" subtitle="بر اساس سررسید فاکتور" />
          <div className="grid grid-cols-2 gap-2 p-5">
            {snapshot.buckets.map((bucket) => (
              <div key={bucket.label} className={`rounded-xl border p-3 ${BUCKET_COLORS[bucket.tone] ?? BUCKET_COLORS.info}`}>
                <p className="text-[9.5px] opacity-80">{bucket.label}</p>
                <p className="num mt-1 text-[13px] font-extrabold">{num(bucket.amount)}</p>
                <p className="text-[8.5px] opacity-60">درهم</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 p-5">
            <Donut
              centerLabel="سود خالص"
              centerValue={aedShort(snapshot.netProfit).replace(" درهم", "")}
              slices={[
                { label: "سود ناخالص حمل", value: Math.max(0, snapshot.grossMargin), color: "#ccf75a" },
                { label: "هزینه‌های عملیاتی", value: snapshot.expenseTotal, color: "#fb7185" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <PanelHeader
          title="فاکتورها"
          subtitle="ثبت دریافتی و پیگیری سررسید"
          action={<span className="num text-[10px] text-slate-500">{num(snapshot.invoices.length)} فاکتور</span>}
        />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>شماره / صدور</th>
                <th>مشتری</th>
                <th>محموله</th>
                <th>مبلغ کل</th>
                <th>پرداخت‌شده</th>
                <th>مانده</th>
                <th>وضعیت</th>
                <th>ثبت دریافتی</th>
              </tr>
            </thead>
            <tbody>
              {invoiceRows.map((invoice) => {
                const remaining = invoice.totalAed - invoice.paidAed;
                return (
                  <tr key={invoice.id}>
                    <td>
                      <span className="font-mono text-[10.5px] text-slate-100">{invoice.number}</span>
                      <p className="num text-[9px] text-slate-600">{faDateShort(invoice.issueDate)}</p>
                    </td>
                    <td>
                      <span className="block max-w-[150px] truncate text-[11px] text-slate-200">{invoice.customerName}</span>
                    </td>
                    <td>
                      {invoice.trackingCode ? (
                        <Link
                          href={`/dashboard/shipments/${invoice.shipmentId}`}
                          className="font-mono text-[10px] text-slate-400 hover:text-lime"
                        >
                          {invoice.trackingCode}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-600">—</span>
                      )}
                    </td>
                    <td className="num text-[11px] text-slate-200">{num(invoice.totalAed)}</td>
                    <td className="num text-[11px] text-emerald-300">{num(invoice.paidAed)}</td>
                    <td className={`num text-[11px] ${remaining > 0 ? "text-amber" : "text-slate-500"}`}>{num(remaining)}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                      {invoice.status === "draft" && (
                        <MarkInvoiceSentButton invoiceId={invoice.id} />
                      )}
                    </td>
                    <td>
                      {remaining > 0 ? (
                        <PaymentForm invoiceId={invoice.id} remaining={remaining} />
                      ) : (
                        <span className="text-[10px] text-emerald-400">تسویه شده</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr]">
        <div className="card overflow-hidden">
          <PanelHeader title="آخرین دریافتی‌ها" subtitle="تطبیق بانکی" />
          <ul className="divide-y divide-white/6">
            {snapshot.payments.slice(0, 7).map((payment) => (
              <li key={payment.id} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <p className="font-mono text-[10.5px] text-slate-200">{payment.invoiceNumber}</p>
                  <p className="num text-[9px] text-slate-600">
                    {payment.reference} · {relative(payment.paidAt)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="num text-[11px] font-semibold text-emerald-300">{num(payment.amountAed)}</p>
                  <p className="text-[9px] text-slate-600">{METHOD_LABELS[payment.method] ?? payment.method}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <PanelHeader title="ثبت هزینه" subtitle="هزینه‌های عملیاتی امارات" />
          <ExpenseForm />
          <div className="border-t border-white/8 px-5 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">جمع هزینه‌ها</span>
              <span className="num font-bold text-rose">{num(snapshot.expenseTotal)}</span>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <PanelHeader title="ترکیب هزینه‌ها" subtitle="به تفکیک دسته" />
          <div className="space-y-3 p-5">
            {snapshot.expenseByCategory
              .sort((a, b) => b.amount - a.amount)
              .map((item) => {
                const max = Math.max(...snapshot.expenseByCategory.map((row) => row.amount), 1);
                return (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-400">{item.category}</span>
                      <span className="num text-slate-300">{num(item.amount)}</span>
                    </div>
                    <Progress value={Math.round((item.amount / max) * 100)} tone="teal" />
                  </div>
                );
              })}
          </div>
          <div className="border-t border-white/8 p-5">
            <div className="rounded-xl border border-lime/15 bg-lime/[0.05] p-3">
              <p className="text-[10px] text-lime">سود خالص عملیات</p>
              <p className="num mt-1 text-lg font-extrabold text-white">{aedShort(snapshot.netProfit)}</p>
              <p className="mt-1 text-[9px] text-slate-500">سود ناخالص منهای هزینه‌های ثبت‌شده</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <PanelHeader title="آخرین هزینه‌های ثبت‌شده" subtitle="جهت کنترل هزینه هر مسیر" />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>دسته</th>
                <th>شرح</th>
                <th>مبلغ (AED)</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.expenses.slice(0, 6).map((expense) => (
                <tr key={expense.id}>
                  <td className="num text-[10.5px] text-slate-400">{faDateShort(expense.incurredAt)}</td>
                  <td>
                    <span className="badge badge-neutral">{expense.category}</span>
                  </td>
                  <td className="text-[11px] text-slate-300">{expense.description}</td>
                  <td className="num text-[11px] text-slate-200">{num(expense.amountAed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
