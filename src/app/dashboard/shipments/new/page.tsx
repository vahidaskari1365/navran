"use client";

import Link from "next/link";
import { NewShipmentForm } from "@/components/dashboard/actions";
import { useNavaran } from "@/lib/store";

export default function NewShipmentPage() {
  const { data } = useNavaran();

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/shipments" className="text-[11px] text-slate-500 transition hover:text-lime">
            ← بازگشت به محموله‌ها
          </Link>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white">ثبت محموله جدید</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            کد رهگیری، بارنامه و (در صورت انتخاب) فاکتور با VAT ۵٪ به‌صورت خودکار صادر می‌شود.
          </p>
        </div>
        <span className="badge badge-accent">پایلوت امارات · دبی</span>
      </header>

      <NewShipmentForm
        customers={data.customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          emirate: customer.emirate,
        }))}
      />
    </div>
  );
}
