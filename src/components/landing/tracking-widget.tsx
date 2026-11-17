"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrackingWidget({
  samples = [],
  variant = "hero",
}: {
  samples?: string[];
  variant?: "hero" | "inline";
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(value: string) {
    const clean = value.trim().toUpperCase();
    if (clean.length < 4) {
      setError("کد رهگیری را کامل وارد کنید (مثال: NAV-7K42QD)");
      return;
    }
    setLoading(true);
    setError("");
    router.push(`/track/${encodeURIComponent(clean)}`);
  }

  return (
    <div
      className={
        variant === "hero"
          ? "rounded-2xl border border-white/10 bg-[#080f19]/90 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)] backdrop-blur-xl"
          : "rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      }
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor="tracking-code" className="text-[11px] font-medium text-slate-400">
          رهگیری محموله
        </label>
        <span className="flex items-center gap-1.5 text-[10px] text-lime">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          پینگ زنده فعال
        </span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(code);
        }}
        className="flex items-stretch gap-2"
      >
        <div className="relative flex-1">
          <input
            id="tracking-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="NAV-XXXXXX"
            dir="ltr"
            className="field h-11 pr-10 text-left font-mono tracking-widest uppercase"
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary h-11 px-5 disabled:opacity-60">
          {loading ? "..." : "رهگیری"}
        </button>
      </form>
      {error && <p className="mt-2 text-[11px] text-rose">{error}</p>}
      {samples.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-500">نمونه:</span>
          {samples.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setCode(sample);
                submit(sample);
              }}
              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 transition hover:border-lime/40 hover:text-lime"
              dir="ltr"
            >
              {sample}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
