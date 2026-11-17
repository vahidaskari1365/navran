const numberFmt = new Intl.NumberFormat("fa-IR");
const dateFmt = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Dubai",
});
const dateShortFmt = new Intl.DateTimeFormat("fa-IR", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Dubai",
});
const timeFmt = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dubai",
});

export function num(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return numberFmt.format(Number.isFinite(n) ? n : 0);
}

export function aed(value: number | string | null | undefined) {
  return `${num(value)} درهم`;
}

export function aedShort(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", "٫")} م درهم`;
  if (Math.abs(n) >= 1_000) return `${num(Math.round(n / 1000))} هزار درهم`;
  return aed(n);
}

export function faDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return dateFmt.format(new Date(date));
}

export function faDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  return dateShortFmt.format(new Date(date));
}

export function faTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  return timeFmt.format(new Date(date));
}

export function faDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  return `${faDate(date)} — ${faTime(date)}`;
}

export function relative(date: Date | string | null | undefined) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${num(minutes)} دقیقه پیش`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${num(hours)} ساعت پیش`;
  const days = Math.round(hours / 24);
  if (days === 1) return "دیروز";
  return `${num(days)} روز پیش`;
}

export function countdown(date: Date | string | null | undefined) {
  if (!date) return "—";
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "گذشته";
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `${num(hours)} ساعت`;
  return `${num(Math.round(hours / 24))} روز`;
}

export const STATUS_META: Record<string, { label: string; tone: string; dot: string }> = {
  draft: { label: "پیش‌نویس", tone: "badge-neutral", dot: "bg-slate-400" },
  booked: { label: "ثبت شد", tone: "badge-info", dot: "bg-sky-400" },
  picked_up: { label: "بارگیری شد", tone: "badge-info", dot: "bg-indigo-400" },
  in_transit: { label: "در مسیر", tone: "badge-accent", dot: "bg-lime-300" },
  customs: { label: "گمرک", tone: "badge-warn", dot: "bg-amber-400" },
  out_for_delivery: { label: "در حال توزیع", tone: "badge-info", dot: "bg-cyan-400" },
  delivered: { label: "تحویل شد", tone: "badge-success", dot: "bg-emerald-400" },
  exception: { label: "استثنا", tone: "badge-danger", dot: "bg-rose-400" },
  cancelled: { label: "لغو شد", tone: "badge-neutral", dot: "bg-slate-500" },
  open: { label: "بار باز", tone: "badge-accent", dot: "bg-lime-300" },
  bidding: { label: "در حال پیشنهاد", tone: "badge-warn", dot: "bg-amber-400" },
  assigned: { label: "تخصیص یافته", tone: "badge-success", dot: "bg-emerald-400" },
  expired: { label: "منقضی", tone: "badge-neutral", dot: "bg-slate-500" },
  paid: { label: "پرداخت شده", tone: "badge-success", dot: "bg-emerald-400" },
  sent: { label: "ارسال شده", tone: "badge-info", dot: "bg-sky-400" },
  partial: { label: "پرداخت جزئی", tone: "badge-warn", dot: "bg-amber-400" },
  overdue: { label: "معوق", tone: "badge-danger", dot: "bg-rose-400" },
  void: { label: "ابطال", tone: "badge-neutral", dot: "bg-slate-500" },
  active: { label: "فعال", tone: "badge-success", dot: "bg-emerald-400" },
  on_route: { label: "در مسیر", tone: "badge-accent", dot: "bg-lime-300" },
  idle: { label: "آماده به کار", tone: "badge-info", dot: "bg-sky-400" },
  available: { label: "در دسترس", tone: "badge-success", dot: "bg-emerald-400" },
  maintenance: { label: "تعمیرات", tone: "badge-warn", dot: "bg-amber-400" },
  rest: { label: "استراحت", tone: "badge-neutral", dot: "bg-slate-400" },
};

export function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status, tone: "badge-neutral", dot: "bg-slate-400" };
}

export const MODE_LABELS: Record<string, string> = {
  road: "جاده‌ای",
  sea: "دریایی",
  air: "هوایی",
  multimodal: "چندوجهی",
};

export const SERVICE_LABELS: Record<string, string> = {
  ftl: "بار کامل (FTL)",
  ltl: "بار جزئی (LTL)",
  b2b: "توزیع B2B",
  last_mile: "توزیع نهایی",
  reefer: "زنجیره سرد",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  curtain: "چادری",
  reefer: "یخچالی",
  flatbed: "کمپرسی / تخت",
  van: "ون",
  tanker: "تانکر",
  trailer: "تریلر",
};

export const SEVERITY_META: Record<string, { label: string; tone: string; icon: string }> = {
  critical: { label: "بحرانی", tone: "badge-danger", icon: "!" },
  warning: { label: "هشدار", tone: "badge-warn", icon: "▲" },
  info: { label: "اطلاع", tone: "badge-info", icon: "i" },
};

export const EMIRATES = [
  "دبی",
  "ابوظبی",
  "شارجه",
  "عجمان",
  "ام‌القیوین",
  "رأس‌الخیمه",
  "فجیره",
  "العین",
];

export function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function n(value: number | string) {
  return num(value);
}
