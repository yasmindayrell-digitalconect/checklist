"use client";

import React from "react";
import type { FinanceWeek } from "@/types/finance";
import WeekSelector from "./WeekSelector";

export default function FinanceHeader({
  monthLabel,
  weeks,
  selectedWeekKeys,
  onToggleWeek,
  onNavigateMonth,
}: {
  monthLabel: string;
  weeks: FinanceWeek[];
  selectedWeekKeys: Set<string>;
  onToggleWeek: (mondayISO: string) => void;
  onNavigateMonth: (delta: number) => void;
}) {
  return (
    <div className="flex justify-between items-start rounded-2xl border border-slate-200 bg-white p-4">    
      <div>
        <WeekSelector
          weeks={weeks}
          selectedWeekKeys={selectedWeekKeys}
          onToggleWeek={onToggleWeek}
        />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateMonth(-1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              ←
            </button>

            <div className="min-w-40">
              <div className="text-center text-base font-semibold uppercase text-slate-900">
                {monthLabel.split(" ")[0]}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateMonth(+1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              aria-label="Próximo mês"
              title="Próximo mês"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
