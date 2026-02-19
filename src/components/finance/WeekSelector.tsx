"use client";

import React from "react";
import type { FinanceWeek } from "./FinanceClient";

export default function WeekSelector({
  weeks,
  selectedWeekKeys,
  onToggleWeek,
}: {
  weeks: FinanceWeek[];
  selectedWeekKeys: Set<string>;
  onToggleWeek: (mondayISO: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {weeks.map((w) => {
        const active = selectedWeekKeys.has(w.mondayISO);
        return (
          <button
            key={w.mondayISO}
            type="button"
            onClick={() => onToggleWeek(w.mondayISO)}
            className={[
              "rounded-full border px-3 py-1.5 text-sm transition",
              active
                ? "border-[##80ef80] bg-[#55e455] text-white font-semibold"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
            title={`${w.mondayISO} → ${w.fridayISO}`}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}
