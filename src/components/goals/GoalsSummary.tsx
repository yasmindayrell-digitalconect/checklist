// components/ranking/goals/GoalsSummary.tsx
"use client";

import React from "react";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0);
}

export default function GoalsSummary({
  sellersCount,
  totalWeeklyMeta,
  totalMonthlyMeta,
}: {
  sellersCount: number;
  totalWeeklyMeta: number;
  totalMonthlyMeta: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">Vendedores</div>
        <div className="mt-1 text-lg font-semibold text-[#212529]">{sellersCount}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">Total metas semanais</div>
        <div className="mt-1 text-lg font-semibold text-[#212529]">{formatBRL(totalWeeklyMeta)}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">Total metas mensais</div>
        <div className="mt-1 text-lg font-semibold text-[#212529]">{formatBRL(totalMonthlyMeta)}</div>
      </div>
    </div>
  );
}
