import { StatusBadge } from "@/components/ui";
import { faDate, faTime, statusMeta } from "@/lib/format";

export function TrackingTimeline({
  events,
  dense = false,
}: {
  events: {
    id: number;
    status: string;
    title: string;
    location: string;
    note: string | null;
    occurredAt: Date | string;
  }[];
  dense?: boolean;
}) {
  if (!events.length) {
    return <p className="px-5 py-8 text-center text-[12px] text-slate-500">رویدادی برای این محموله ثبت نشده است.</p>;
  }
  return (
    <ol className={`relative ${dense ? "space-y-4" : "space-y-5"} pr-5`}>
      <span className="absolute right-[6px] top-2 bottom-2 w-px bg-gradient-to-b from-lime/50 via-white/10 to-transparent" />
      {events.map((event, index) => {
        const meta = statusMeta(event.status);
        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute right-[-15px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 bg-[#060d16] ${
                index === 0 ? "border-lime" : "border-slate-600"
              }`}
            >
              {index === 0 && <span className="h-1 w-1 rounded-full bg-lime" />}
            </span>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className={`text-[12.5px] ${index === 0 ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                  {event.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">{event.location}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={event.status} withDot={false} />
                <span className="num text-[10px] text-slate-600">
                  {faDate(event.occurredAt)} · {faTime(event.occurredAt)}
                </span>
              </div>
            </div>
            {event.note && !dense && <p className="mt-1.5 text-[11px] leading-6 text-slate-500">{event.note}</p>}
            {index === 0 && !dense && <span className="sr-only">{meta.label}</span>}
          </li>
        );
      })}
    </ol>
  );
}
