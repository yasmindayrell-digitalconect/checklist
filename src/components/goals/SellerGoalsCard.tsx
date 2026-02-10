"use client";

import React from "react";
import type { SellerGoalsRow } from "./GoalsEditorClient";
import WeekMetaRow from "./WeekGoalRow";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0);
}

export default function SellerGoalsCard({ row }: { row: SellerGoalsRow }) {
  return (
    <div className="relative overflow-hidden rounded-3xl  bg-linear-to-br from-[#2323ff] via-[#2323ff] to-[#5969e1] p-5 shadow-[0_18px_45px_-22px_rgba(35,35,255,0.9)]">
      {/* glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className=" text-lg font-semibold tracking-tight text-white">
              {row.seller_name ?? `ID ${row.seller_id}`}
            </div>
          </div>
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/90">
              ID: {row.seller_id}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-90 sm:text-right">
          <div className="group rounded-2xl border border-white/15 bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
            <div className="text-[11px] font-medium text-slate-500 ">
              Meta mensal (sistema)
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
              {formatBRL(row.monthly_meta)}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl  bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
            <div className="text-[11px] font-medium text-slate-500">
              Semanal acumulada no mês
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
              {formatBRL(row.weekly_meta_month_accum)}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/15" />
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            últimas semanas
          </div>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <div className="grid gap-2">
          {row.weekly_last3.map((w, idx) => (
            <WeekMetaRow
              key={`${row.seller_id}-${idx}`}
              label={w.label}
              value={w.weekly_meta}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
