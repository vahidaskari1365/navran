"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useNavaran } from "@/lib/store";
import { EMIRATES, EQUIPMENT_LABELS, MODE_LABELS, SERVICE_LABELS, statusMeta } from "@/lib/format";

const EVENT_STATUSES = ["booked", "picked_up", "in_transit", "customs", "out_for_delivery", "delivered", "exception", "cancelled"];
const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "انتقال بانکی",
  cheque: "چک",
  card: "کارت",
  cash: "نقدی",
};
const EXPENSE_CATEGORIES = ["سوخت", "عوارض جاده", "دستمزد راننده", "نگهداری", "انبار", "بیمه", "گمرک", "پشتیبانی"];

function Notice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-[11px] ${
        tone === "success"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-rose/30 bg-rose/10 text-rose"
      }`}
    >
      {children}
    </div>
  );
}

export function TelemetryButton() {
  const { simulateTelemetry } = useNavaran();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => {
        simulateTelemetry();
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "✓ تله‌متری به‌روز شد" : "↻ دریافت پینگ جدید"}
    </button>
  );
}

export function SimulateTelemetryOutline() {
  const { simulateTelemetry } = useNavaran();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={() => {
        simulateTelemetry();
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "✓ به‌روزرسانی شد" : "↻ به‌روزرسانی تله‌متری"}
    </button>
  );
}

export function ResolveAlertButton({ alertId }: { alertId: number }) {
  const { resolveAlert } = useNavaran();
  return (
    <button type="button" onClick={() => resolveAlert(alertId)} className="btn btn-outline btn-sm whitespace-nowrap text-[10px]">
      بستن
    </button>
  );
}

export function BidButton({ loadId, disabled }: { loadId: number; disabled?: boolean }) {
  const { placeBid } = useNavaran();
  const [sent, setSent] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled || sent}
      onClick={() => {
        placeBid(loadId);
        setSent(true);
      }}
      className="btn btn-outline btn-sm disabled:opacity-60"
    >
      {sent ? "✓ پیشنهاد ثبت شد" : "ثبت پیشنهاد"}
    </button>
  );
}

export function ConvertLoadButton({ loadId, disabled }: { loadId: number; disabled?: boolean }) {
  const { convertLoad } = useNavaran();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const created = convertLoad(loadId);
        if (created) router.push(`/dashboard/shipments/${created.id}`);
      }}
      className="btn btn-primary btn-sm disabled:opacity-60"
    >
      تبدیل به محموله
    </button>
  );
}

export function MarkInvoiceSentButton({ invoiceId }: { invoiceId: number }) {
  const { markInvoiceSent } = useNavaran();
  return (
    <button type="button" onClick={() => markInvoiceSent(invoiceId)} className="text-[9.5px] text-lime hover:underline">
      ارسال فاکتور
    </button>
  );
}

export function PaymentForm({ invoiceId, remaining }: { invoiceId: number; remaining: number }) {
  const { recordPayment } = useNavaran();
  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState("bank_transfer");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  if (state === "done") return <span className="text-[10px] text-emerald-400">✓ ثبت شد</span>;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <input
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        type="number"
        min="1"
        aria-label="مبلغ دریافتی"
        className="field num h-7 w-20 px-2 text-[10px]"
      />
      <select
        value={method}
        onChange={(event) => setMethod(event.target.value)}
        aria-label="روش پرداخت"
        className="field h-7 w-24 px-1 text-[10px]"
      >
        {Object.entries(METHOD_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-primary h-7 px-2 text-[10px]"
        onClick={() => {
          if (amount > 0) {
            recordPayment(invoiceId, amount, method);
            setState("done");
          } else {
            setState("error");
          }
        }}
      >
        ثبت
      </button>
    </div>
  );
}

export function ExpenseForm() {
  const { addExpense } = useNavaran();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("سوخت");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  return (
    <form
      className="space-y-2.5 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!description.trim() || !amount || Number(amount) <= 0) {
          setMessage({ tone: "error", text: "شرح و مبلغ هزینه را وارد کنید." });
          return;
        }
        addExpense(category, description.trim(), Number(amount), date);
        setDescription("");
        setAmount("");
        setMessage({ tone: "success", text: "هزینه ثبت شد." });
        setTimeout(() => setMessage(null), 2600);
      }}
    >
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <div>
        <label className="label" htmlFor="expense-desc">
          شرح هزینه
        </label>
        <input
          id="expense-desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="field h-8 text-[11px]"
          placeholder="دیزل ناوگان — ENOC"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="expense-amount">
            مبلغ (AED)
          </label>
          <input
            id="expense-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value === "" ? "" : Number(event.target.value))}
            type="number"
            min="1"
            className="field num h-8 text-[11px]"
          />
        </div>
        <div>
          <label className="label" htmlFor="expense-cat">
            دسته
          </label>
          <select
            id="expense-cat"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field h-8 text-[11px]"
          >
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="expense-date">
          تاریخ
        </label>
        <input
          id="expense-date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          className="field num h-8 text-[11px]"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-full">
        ثبت هزینه
      </button>
    </form>
  );
}

export function EventForm({ shipmentId, defaultLocation }: { shipmentId: number; defaultLocation: string }) {
  const { addTrackingEvent } = useNavaran();
  const [status, setStatus] = useState("in_transit");
  const [location, setLocation] = useState(defaultLocation);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <form
      action=""
      className="border-t border-white/8 bg-white/[0.015] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        addTrackingEvent(shipmentId, status, location, note);
        setNote("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2600);
      }}
    >
      <p className="mb-3 text-[11px] font-bold text-white">ثبت رویداد جدید در مرکز کنترل</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="event-status">
            وضعیت جدید
          </label>
          <select
            id="event-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field h-9 text-[11.5px]"
          >
            {EVENT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {statusMeta(item).label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="event-location">
            موقعیت
          </label>
          <input
            id="event-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="field h-9 text-[11.5px]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="event-note">
            یادداشت برای مشتری
          </label>
          <input
            id="event-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="field h-9 text-[11.5px]"
            placeholder="مثلاً: خروج از مرکز توزیع، تماس راننده با گیرنده"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && <span className="text-[10.5px] text-emerald-400">✓ رویداد ثبت و وضعیت به‌روزرسانی شد</span>}
        <button type="submit" className="btn btn-primary btn-sm">
          ثبت رویداد و به‌روزرسانی وضعیت
        </button>
      </div>
    </form>
  );
}

export function AssignForm({
  shipmentId,
  vehicleId,
  driverId,
  fleet,
  drivers,
}: {
  shipmentId: number;
  vehicleId: number | null;
  driverId: number | null;
  fleet: { id: number; plate: string; type: string; currentCity: string }[];
  drivers: { id: number; name: string; phone: string }[];
}) {
  const { assignResources } = useNavaran();
  const [vehicle, setVehicle] = useState(vehicleId ? String(vehicleId) : "");
  const [driver, setDriver] = useState(driverId ? String(driverId) : "");
  const [saved, setSaved] = useState(false);

  return (
    <form
      action=""
      className="space-y-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        assignResources(shipmentId, vehicle ? Number(vehicle) : null, driver ? Number(driver) : null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2600);
      }}
    >
      <div>
        <label className="label" htmlFor="vehicleId">
          خودرو
        </label>
        <select id="vehicleId" value={vehicle} onChange={(event) => setVehicle(event.target.value)} className="field h-9 text-[11.5px]">
          <option value="">بدون تخصیص</option>
          {fleet.map((item) => (
            <option key={item.id} value={item.id}>
              {item.plate} — {EQUIPMENT_LABELS[item.type] ?? item.type} ({item.currentCity})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="driverId">
          راننده
        </label>
        <select id="driverId" value={driver} onChange={(event) => setDriver(event.target.value)} className="field h-9 text-[11.5px]">
          <option value="">بدون تخصیص</option>
          {drivers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {item.phone}
            </option>
          ))}
        </select>
      </div>
      {saved && <Notice tone="success">تخصیص ذخیره شد.</Notice>}
      <button type="submit" className="btn btn-outline btn-sm w-full">
        ذخیره تخصیص
      </button>
    </form>
  );
}

function localInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NewShipmentForm({ customers }: { customers: { id: number; name: string; emirate: string }[] }) {
  const { createShipment } = useNavaran();
  const router = useRouter();
  const [form, setForm] = useState({
    customerId: customers[0]?.id ? String(customers[0].id) : "",
    cargoType: "",
    weightKg: "",
    volumeM3: "20",
    pieces: "1",
    temperatureC: "",
    originCity: "دبی",
    originEmirate: "دبی",
    destCity: "",
    destEmirate: "ابوظبی",
    destCountry: "AE",
    mode: "road",
    service: "ftl",
    incoterm: "DAP",
    pickupAt: localInput(new Date(Date.now() + 2 * 3600 * 1000)),
    etaAt: localInput(new Date(Date.now() + 26 * 3600 * 1000)),
    revenueAed: "3500",
    costAed: "",
    notes: "",
    issueInvoice: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const set = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.customerId) next.customerId = "مشتری را انتخاب کنید.";
    if (!form.cargoType.trim()) next.cargoType = "نوع بار الزامی است.";
    if (!form.weightKg || Number(form.weightKg) <= 0) next.weightKg = "وزن بار باید بزرگ‌تر از صفر باشد.";
    if (!form.originCity.trim()) next.originCity = "مبدأ الزامی است.";
    if (!form.destCity.trim()) next.destCity = "مقصد الزامی است.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    const revenue = Number(form.revenueAed) || 0;
    const created = createShipment({
      customerId: Number(form.customerId),
      originCity: form.originCity.trim(),
      originEmirate: form.originEmirate,
      destCity: form.destCity.trim(),
      destEmirate: form.destEmirate,
      destCountry: form.destCountry,
      mode: form.mode,
      service: form.service,
      cargoType: form.cargoType.trim(),
      weightKg: Number(form.weightKg),
      volumeM3: Number(form.volumeM3) || 1,
      pieces: Number(form.pieces) || 1,
      incoterm: form.incoterm,
      temperatureC: form.temperatureC ? Number(form.temperatureC) : null,
      pickupAt: new Date(form.pickupAt).toISOString(),
      etaAt: new Date(form.etaAt).toISOString(),
      revenueAed: revenue,
      costAed: Number(form.costAed) || Math.round(revenue * 0.65),
      notes: form.notes,
      issueInvoice: form.issueInvoice,
    });
    if (created) router.push(`/dashboard/shipments/${created.id}`);
    else setPending(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset className="card p-5">
        <legend className="px-2 text-[12px] font-bold text-white">۱. مشتری و بار</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="customerId">
              مشتری / صاحب بار *
            </label>
            <select id="customerId" className="field" value={form.customerId} onChange={(event) => set("customerId", event.target.value)}>
              <option value="" disabled>
                انتخاب مشتری…
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} — {customer.emirate}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="mt-1 text-[10.5px] text-rose">{errors.customerId}</p>}
          </div>
          <div>
            <label className="label" htmlFor="cargoType">
              نوع بار *
            </label>
            <input
              id="cargoType"
              className="field"
              value={form.cargoType}
              onChange={(event) => set("cargoType", event.target.value)}
              placeholder="غذای یخچالی، قطعات…"
            />
            {errors.cargoType && <p className="mt-1 text-[10.5px] text-rose">{errors.cargoType}</p>}
          </div>
          <div>
            <label className="label" htmlFor="weightKg">
              وزن (کیلوگرم) *
            </label>
            <input
              id="weightKg"
              type="number"
              min="1"
              className="field num"
              value={form.weightKg}
              onChange={(event) => set("weightKg", event.target.value)}
              placeholder="12000"
            />
            {errors.weightKg && <p className="mt-1 text-[10.5px] text-rose">{errors.weightKg}</p>}
          </div>
          <div>
            <label className="label" htmlFor="volumeM3">
              حجم (متر مکعب)
            </label>
            <input
              id="volumeM3"
              type="number"
              min="0"
              className="field num"
              value={form.volumeM3}
              onChange={(event) => set("volumeM3", event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="pieces">
              تعداد بسته
            </label>
            <input
              id="pieces"
              type="number"
              min="1"
              className="field num"
              value={form.pieces}
              onChange={(event) => set("pieces", event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="temperatureC">
              دمای مورد نیاز (°C)
            </label>
            <input
              id="temperatureC"
              type="number"
              className="field num"
              value={form.temperatureC}
              onChange={(event) => set("temperatureC", event.target.value)}
              placeholder="4"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-2 text-[12px] font-bold text-white">۲. مسیر و سرویس</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="originCity">
              مبدأ *
            </label>
            <input
              id="originCity"
              className="field"
              value={form.originCity}
              onChange={(event) => set("originCity", event.target.value)}
              placeholder="جبل علی (دبی)"
            />
            {errors.originCity && <p className="mt-1 text-[10.5px] text-rose">{errors.originCity}</p>}
          </div>
          <div>
            <label className="label" htmlFor="destCity">
              مقصد *
            </label>
            <input
              id="destCity"
              className="field"
              value={form.destCity}
              onChange={(event) => set("destCity", event.target.value)}
              placeholder="ابوظبی"
            />
            {errors.destCity && <p className="mt-1 text-[10.5px] text-rose">{errors.destCity}</p>}
          </div>
          <div>
            <label className="label" htmlFor="destEmirate">
              استان / امیرات مقصد
            </label>
            <select id="destEmirate" className="field" value={form.destEmirate} onChange={(event) => set("destEmirate", event.target.value)}>
              {EMIRATES.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="originEmirate">
              امیرات مبدأ
            </label>
            <select id="originEmirate" className="field" value={form.originEmirate} onChange={(event) => set("originEmirate", event.target.value)}>
              {EMIRATES.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="destCountry">
              کشور مقصد
            </label>
            <select id="destCountry" className="field" value={form.destCountry} onChange={(event) => set("destCountry", event.target.value)}>
              <option value="AE">امارات (AE)</option>
              <option value="SA">عربستان (SA)</option>
              <option value="QA">قطر (QA)</option>
              <option value="KW">کویت (KW)</option>
              <option value="OM">عمان (OM)</option>
              <option value="BH">بحرین (BH)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="mode">
              شیوه حمل
            </label>
            <select id="mode" className="field" value={form.mode} onChange={(event) => set("mode", event.target.value)}>
              {Object.entries(MODE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="service">
              نوع سرویس
            </label>
            <select id="service" className="field" value={form.service} onChange={(event) => set("service", event.target.value)}>
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="incoterm">
              اینکوترم
            </label>
            <select id="incoterm" className="field" value={form.incoterm} onChange={(event) => set("incoterm", event.target.value)}>
              {["DAP", "DDP", "EXW", "FOB", "CIF"].map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pickupAt">
              زمان بارگیری
            </label>
            <input
              id="pickupAt"
              type="datetime-local"
              className="field num"
              value={form.pickupAt}
              onChange={(event) => set("pickupAt", event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="etaAt">
              زمان تخمینی تحویل
            </label>
            <input
              id="etaAt"
              type="datetime-local"
              className="field num"
              value={form.etaAt}
              onChange={(event) => set("etaAt", event.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-2 text-[12px] font-bold text-white">۳. قیمت‌گذاری و فاکتور</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="revenueAed">
              کرایه فروش (درهم)
            </label>
            <input
              id="revenueAed"
              type="number"
              min="0"
              className="field num"
              value={form.revenueAed}
              onChange={(event) => set("revenueAed", event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="costAed">
              هزینه مستقیم (درهم)
            </label>
            <input
              id="costAed"
              type="number"
              min="0"
              className="field num"
              value={form.costAed}
              onChange={(event) => set("costAed", event.target.value)}
              placeholder="خودکار ۶۵٪"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-[11.5px] text-slate-300">
              <input
                type="checkbox"
                checked={form.issueInvoice}
                onChange={(event) => set("issueInvoice", event.target.checked)}
                className="h-4 w-4 accent-lime"
              />
              صدور فاکتور با VAT ۵٪
            </label>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="notes">
              یادداشت عملیاتی
            </label>
            <textarea
              id="notes"
              rows={3}
              className="field"
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
              placeholder="دسترسی به بارانداز، شرایط تخلیه…"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10.5px] text-slate-500">
          با ثبت محموله، کد رهگیری و بارنامه دیجیتال به‌صورت خودکار صادر می‌شود. داده‌ها در همین مرورگر ذخیره می‌شوند.
        </p>
        <button type="submit" disabled={pending} className="btn btn-primary px-6 disabled:opacity-60">
          {pending ? "در حال ثبت…" : "ثبت محموله و صدور بارنامه"}
        </button>
      </div>
    </form>
  );
}

export function NewLoadForm() {
  const { createLoad } = useNavaran();
  const [form, setForm] = useState({
    shipperName: "",
    originCity: "دبی",
    destCity: "ابوظبی",
    cargoType: "",
    equipment: "curtain",
    weightKg: "",
    budgetAed: "2500",
    readyDate: "",
    contactPhone: "+971 50 000 0000",
  });
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="space-y-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.shipperName.trim() || !form.cargoType.trim() || !form.weightKg) {
          setMessage({ tone: "error", text: "صاحب بار، نوع بار و وزن الزامی است." });
          return;
        }
        createLoad({
          shipperName: form.shipperName.trim(),
          originCity: form.originCity,
          destCity: form.destCity,
          cargoType: form.cargoType.trim(),
          equipment: form.equipment,
          weightKg: Number(form.weightKg),
          readyDate: form.readyDate ? new Date(form.readyDate).toISOString() : "",
          budgetAed: Number(form.budgetAed) || 0,
          contactPhone: form.contactPhone,
        });
        setForm((prev) => ({ ...prev, shipperName: "", cargoType: "", weightKg: "" }));
        setMessage({ tone: "success", text: "بار جدید به تخته بار اضافه شد." });
        setTimeout(() => setMessage(null), 2800);
      }}
    >
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <div>
        <label className="label" htmlFor="shipperName">
          صاحب بار *
        </label>
        <input
          id="shipperName"
          className="field h-9 text-[11.5px]"
          value={form.shipperName}
          onChange={(event) => set("shipperName", event.target.value)}
          placeholder="Al Maya Foods"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="load-origin">
            مبدأ *
          </label>
          <input
            id="load-origin"
            className="field h-9 text-[11.5px]"
            value={form.originCity}
            onChange={(event) => set("originCity", event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="load-dest">
            مقصد *
          </label>
          <select id="load-dest" className="field h-9 text-[11.5px]" value={form.destCity} onChange={(event) => set("destCity", event.target.value)}>
            {EMIRATES.map((emirate) => (
              <option key={emirate} value={emirate}>
                {emirate}
              </option>
            ))}
            <option value="ریاض">ریاض (SA)</option>
            <option value="دوحه">دوحه (QA)</option>
            <option value="کویت‌سیتی">کویت‌سیتی (KW)</option>
            <option value="مسقط">مسقط (OM)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="load-cargo">
          نوع بار *
        </label>
        <input
          id="load-cargo"
          className="field h-9 text-[11.5px]"
          value={form.cargoType}
          onChange={(event) => set("cargoType", event.target.value)}
          placeholder="غذای یخچالی"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="load-equipment">
            نوع خودرو
          </label>
          <select id="load-equipment" className="field h-9 text-[11.5px]" value={form.equipment} onChange={(event) => set("equipment", event.target.value)}>
            {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="load-weight">
            وزن (kg) *
          </label>
          <input
            id="load-weight"
            type="number"
            min="1"
            className="field num h-9 text-[11.5px]"
            value={form.weightKg}
            onChange={(event) => set("weightKg", event.target.value)}
            placeholder="12000"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="load-budget">
            بودجه (درهم)
          </label>
          <input
            id="load-budget"
            type="number"
            min="0"
            className="field num h-9 text-[11.5px]"
            value={form.budgetAed}
            onChange={(event) => set("budgetAed", event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="load-ready">
            آماده بارگیری
          </label>
          <input
            id="load-ready"
            type="datetime-local"
            className="field num h-9 text-[11.5px]"
            value={form.readyDate}
            onChange={(event) => set("readyDate", event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="load-phone">
          تماس
        </label>
        <input
          id="load-phone"
          dir="ltr"
          className="field num h-9 text-[11.5px]"
          value={form.contactPhone}
          onChange={(event) => set("contactPhone", event.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-full">
        افزودن بار به تخته
      </button>
    </form>
  );
}

export function ResetDemoButton({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { resetDemo } = useNavaran();
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex gap-1.5">
        <button
          type="button"
          className="btn btn-outline btn-sm flex-1 text-[10px]"
          onClick={() => {
            resetDemo();
            setConfirming(false);
          }}
        >
          بله، بازنشانی
        </button>
        <button type="button" className="btn btn-ghost btn-sm text-[10px]" onClick={() => setConfirming(false)}>
          لغو
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`btn btn-sm w-full text-[10.5px] ${variant === "outline" ? "btn-outline" : "btn-ghost"}`}
    >
      ↺ بازنشانی داده‌های نمونه
    </button>
  );
}
