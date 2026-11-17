import { num } from "@/lib/format";

export function RevenueChart({
  series,
  height = 200,
}: {
  series: { label: string; revenue: number; cost: number }[];
  height?: number;
}) {
  const width = 640;
  const pad = { top: 16, right: 8, bottom: 8, left: 8 };
  const max = Math.max(1, ...series.map((s) => Math.max(s.revenue, s.cost))) * 1.18;
  const stepX = (width - pad.left - pad.right) / Math.max(series.length - 1, 1);
  const y = (value: number) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom);
  const points = (key: "revenue" | "cost") =>
    series.map((s, i) => `${pad.left + i * stepX},${y(s[key])}`).join(" ");
  const areaPath = `M ${pad.left},${height - pad.bottom} L ${series
    .map((s, i) => `${pad.left + i * stepX},${y(s.revenue)}`)
    .join(" L ")} L ${pad.left + (series.length - 1) * stepX},${height - pad.bottom} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="روند درآمد و هزینه">
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ccf75a" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ccf75a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={pad.left}
            x2={width - pad.right}
            y1={y(max * ratio)}
            y2={y(max * ratio)}
            stroke="rgba(148,163,184,0.12)"
            strokeDasharray="3 6"
          />
        ))}
        <path d={areaPath} fill="url(#rev-fill)" />
        <polyline points={points("revenue")} fill="none" stroke="#ccf75a" strokeWidth="2.6" strokeLinecap="round" />
        <polyline points={points("cost")} fill="none" stroke="#5eead4" strokeWidth="1.8" strokeDasharray="5 6" strokeLinecap="round" />
        {series.map((s, i) => (
          <g key={s.label}>
            <circle cx={pad.left + i * stepX} cy={y(s.revenue)} r="3.6" fill="#05090f" stroke="#ccf75a" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between px-1">
        {series.map((s) => (
          <span key={s.label} className="text-[10px] text-slate-500">
            {s.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-lime" /> درآمد
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-teal" /> هزینه عملیاتی
        </span>
      </div>
    </div>
  );
}

export function Donut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let cursor = 0;
  const stops = slices
    .map((slice) => {
      const start = (cursor / total) * 100;
      cursor += slice.value;
      const end = (cursor / total) * 100;
      return `${slice.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <div className="h-full w-full rounded-full" style={{ background: `conic-gradient(${stops})` }} />
        <div className="absolute inset-[13px] flex flex-col items-center justify-center rounded-full bg-[#080f19]">
          <span className="num text-lg font-extrabold text-white">{centerValue}</span>
          <span className="text-[10px] text-slate-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} />
              {slice.label}
            </span>
            <span className="num font-semibold text-slate-200">{num(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LaneBars({ lanes }: { lanes: { lane: string; shipments: number; revenue: number }[] }) {
  const max = Math.max(1, ...lanes.map((l) => l.revenue));
  return (
    <ul className="space-y-3.5">
      {lanes.map((lane, index) => (
        <li key={lane.lane}>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="num flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-400">
                {num(index + 1)}
              </span>
              {lane.lane}
            </span>
            <span className="num text-slate-400">
              {num(lane.shipments)} محموله · {num(lane.revenue)} درهم
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(6, (lane.revenue / max) * 100)}%`,
                background: index === 0 ? "linear-gradient(90deg,#a3e635,#d9ff77)" : "linear-gradient(90deg,#0e7490,#5eead4)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  دبی: { lat: 25.2048, lng: 55.2708 },
  ابوظبی: { lat: 24.4539, lng: 54.3773 },
  شارجه: { lat: 25.3463, lng: 55.4209 },
  عجمان: { lat: 25.4052, lng: 55.5136 },
  "رأس‌الخیمه": { lat: 25.7895, lng: 55.9432 },
  فجیره: { lat: 25.1288, lng: 56.3265 },
  العین: { lat: 24.2075, lng: 55.7447 },
  "ام‌القیوین": { lat: 25.5647, lng: 55.5552 },
};

const BOUNDS = { minLat: 23.9, maxLat: 26.3, minLng: 53.9, maxLng: 56.6 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(6, y)) };
}

export function FleetMap({
  vehicles,
  height = 300,
}: {
  vehicles: { id: number; plate: string; status: string; lat: number; lng: number; tempC: number; currentCity: string }[];
  height?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#060d16]" style={{ height }}>
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 65% 40%, rgba(94,234,212,.12), transparent 60%)" }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d="M18 12 L38 20 L52 16 L70 26 L84 40 L88 58 L76 74 L58 86 L38 82 L24 66 L14 44 Z"
          fill="rgba(204,247,90,0.035)"
          stroke="rgba(204,247,90,0.24)"
          strokeWidth="0.5"
          strokeDasharray="1.6 1.6"
        />
        {Object.entries(CITY_COORDS).map(([name, coords], idx) => {
          const dubai = CITY_COORDS["دبی"];
          const a = project(dubai.lat, dubai.lng);
          const b = project(coords.lat, coords.lng);
          if (name === "دبی") return null;
          return (
            <line
              key={name}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(148,163,184,0.22)"
              strokeWidth="0.35"
              strokeDasharray="1.4 1.8"
              className={idx % 2 === 0 ? "animate-dash" : undefined}
            />
          );
        })}
      </svg>

      {Object.entries(CITY_COORDS).map(([name, coords]) => {
        const pos = project(coords.lat, coords.lng);
        return (
          <div key={name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <span className="flex items-center gap-1 whitespace-nowrap text-[9px] font-medium text-slate-400">
              <span className="h-1 w-1 rounded-full bg-slate-500" /> {name}
            </span>
          </div>
        );
      })}

      {vehicles.map((vehicle) => {
        const pos = project(vehicle.lat, vehicle.lng);
        const moving = vehicle.status === "on_route";
        return (
          <div
            key={vehicle.id}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              {moving && (
                <span className="absolute h-3 w-3 animate-pulse-soft rounded-full bg-lime/40" />
              )}
              <span
                className={`h-2 w-2 rounded-full ring-2 ring-[#060d16] ${
                  vehicle.status === "maintenance" ? "bg-amber" : moving ? "bg-lime" : "bg-sky-400"
                }`}
              />
            </span>
            <span className="pointer-events-none absolute bottom-4 right-1/2 z-10 hidden translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0b1521] px-2 py-1 text-[10px] text-slate-200 shadow-xl group-hover:block">
              {vehicle.plate} · {vehicle.currentCity} · {num(Math.round(vehicle.tempC))}°
            </span>
          </div>
        );
      })}

      <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-white/10 bg-[#070e17]/90 px-2.5 py-1.5 text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" /> در حال حرکت
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> آماده
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" /> تعمیرات
        </span>
      </div>
    </div>
  );
}

export function RouteStrip({
  origin,
  destination,
  progress,
  compact = false,
}: {
  origin: string;
  destination: string;
  progress: number;
  compact?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="truncate font-medium text-slate-200">{origin}</span>
        {!compact && <span className="num shrink-0 text-[10px] text-lime">{num(clamped)}٪</span>}
        <span className="truncate font-medium text-slate-200">{destination}</span>
      </div>
      <div className="relative mt-2 flex items-center">
        <span className="h-2 w-2 shrink-0 rounded-full border-2 border-lime bg-[#060d16]" />
        <div className="relative mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 right-0 rounded-full"
            style={{ width: `${clamped}%`, background: "linear-gradient(90deg,#5eead4,#d9ff77)" }}
          />
        </div>
        <span className="h-2 w-2 shrink-0 rounded-full border-2 border-slate-500 bg-[#060d16]" />
        <span
          className="absolute top-1/2 -translate-y-1/2 text-[10px]"
          style={{ right: `calc(${clamped}% - 4px)` }}
        >
          <span className="block h-3 w-3 rounded-full border border-[#060d16] bg-lime shadow-[0_0_12px_rgba(204,247,90,.7)]" />
        </span>
      </div>
    </div>
  );
}
