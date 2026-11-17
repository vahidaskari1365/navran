import Link from "next/link";
import type { ReactNode } from "react";
import { statusMeta } from "@/lib/format";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ background: "linear-gradient(150deg,#d9ff77,#8fd14f 55%,#3fa86b)" }}
    >
      <svg viewBox="0 0 32 32" className="h-[70%] w-[70%]" fill="none" aria-hidden>
        <path d="M7 24V10l9 14V10l9 14" stroke="#0a1607" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function BrandLock({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-extrabold text-white">ناوران</span>
        {!compact && (
          <span className="text-[9px] font-medium tracking-[0.22em] text-slate-500 uppercase">Navaran Logistics</span>
        )}
      </span>
    </Link>
  );
}

export function StatusBadge({ status, withDot = true }: { status: string; withDot?: boolean }) {
  const meta = statusMeta(status);
  return (
    <span className={`badge ${meta.tone}`}>
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
      {meta.label}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  hint,
  trend,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  icon?: ReactNode;
  tone?: "default" | "accent" | "warn" | "danger";
}) {
  const toneStyles: Record<string, string> = {
    default: "text-white",
    accent: "text-lime",
    warn: "text-amber",
    danger: "text-rose",
  };
  return (
    <div className="card relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -top-16 left-0 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: "radial-gradient(circle,rgba(204,247,90,.25),transparent 70%)" }}
      />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium text-slate-400">{label}</span>
        {icon ? <span className="text-slate-500">{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className={`num text-2xl font-extrabold tracking-tight ${toneStyles[tone]}`}>{value}</span>
        {unit && <span className="pb-0.5 text-[11px] text-slate-500">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        {trend && (
          <span className={trend.positive === false ? "text-rose" : "text-emerald-400"}>
            {trend.positive === false ? "▼" : "▲"} {trend.value}
          </span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}

export function Progress({ value, tone = "lime" }: { value: number; tone?: "lime" | "teal" | "amber" | "rose" }) {
  const colors: Record<string, string> = {
    lime: "linear-gradient(90deg,#8fd14f,#d9ff77)",
    teal: "linear-gradient(90deg,#0d9488,#5eead4)",
    amber: "linear-gradient(90deg,#d97706,#fbbf24)",
    rose: "linear-gradient(90deg,#e11d48,#fb7185)",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: colors[tone] }}
      />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      {eyebrow && (
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-[32px] sm:leading-[1.25]">
        {title}
      </h2>
      {description && <p className="max-w-2xl text-sm leading-7 text-slate-400">{description}</p>}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/6 px-5 py-4">
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-500">
        ◌
      </span>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-xs leading-6 text-slate-500">{description}</p>}
    </div>
  );
}

export function Avatar({ name, className = "h-9 w-9" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-slate-300 ${className}`}
    >
      {initials}
    </span>
  );
}

export const Icons = {
  route: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.4 18h4.1a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  truck: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M3 7h10v9H3zM13 10h4.5l3 3v3H13" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  radar: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" opacity=".8" />
      <path d="M12 12l7-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  ),
  wallet: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M15 14.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  package: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
