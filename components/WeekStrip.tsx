import type { WeekDay } from "@/lib/days";

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <ol className="flex justify-between gap-1" aria-label="Poslednjih 7 dana">
      {days.map((day) => {
        let circle = "border-2 border-current opacity-40"; // nicht geübt
        if (day.trained)
          circle = "bg-bg text-river"; // geübt
        else if (day.isToday) circle = "border-2 border-dashed border-current"; // heute, noch offen

        return (
          <li key={day.day} className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold opacity-80">{day.label}</span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${circle}`}
              aria-label={day.trained ? `${day.label}: vežbao` : `${day.label}: nije vežbao`}
            >
              {day.trained ? "✓" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
