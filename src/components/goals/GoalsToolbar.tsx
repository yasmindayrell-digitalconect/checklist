// components/ranking/goals/GoalsToolbar.tsx
"use client";

import React, { useState } from "react";

export default function GoalsToolbar({
  weekOffset,
  onPrev,
  onNext,
  query,
  onQueryChange,
  onBulkWeekly,
}: {
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  onBulkWeekly: (v: number) => void;
}) {
  const [bulk, setBulk] = useState("");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            title="Semana anterior"
          >
            ←
          </button>
          <div className="text-sm font-semibold text-[#212529]">
            weekOffset: {weekOffset}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            title="Próxima semana"
          >
            →
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar vendedor..."
            className="h-10 w-full sm:w-64 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />

          <div className="flex items-center gap-2">
            <input
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder="Meta semanal (bulk) ex: 25000"
              className="h-10 w-full sm:w-56 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="button"
              onClick={() => onBulkWeekly(Number(bulk))}
              className="h-10 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white hover:opacity-95"
              title="Aplicar meta semanal para todos"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-gray-500">
        Dica: você pode aplicar uma meta semanal em lote e depois ajustar vendedor a vendedor.
      </div>
    </div>
  );
}
