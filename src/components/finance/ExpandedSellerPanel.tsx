"use client";

import React, { useMemo } from "react";
import { formatBRL, formatPct } from "@/components/utils";
import { FinanceSeller, FinanceWeek } from "@/types/finance";

function findWeekLabel(allWeeks: FinanceWeek[], mondayISO: string) {
  return allWeeks.find((w) => w.mondayISO === mondayISO)?.label ?? mondayISO;
}

export default function ExpandedSellerPanel({
  seller,
  allWeeks,
  selectedWeekKeys,
}: {
  seller: FinanceSeller;
  allWeeks: FinanceWeek[];
  selectedWeekKeys: Set<string>;
}) {
  const weeklyRows = useMemo(() => {
    return seller.weeks.map((w) => ({
      ...w,
      label: findWeekLabel(allWeeks, w.week_mondayISO),
      included: selectedWeekKeys.has(w.week_mondayISO),
    }));
  }, [seller.weeks, allWeeks, selectedWeekKeys]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Semanal */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">Detalhe semanal</div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.8fr_0.9fr] gap-0 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            <div>Semana</div>
            <div className="text-right">Meta</div>
            <div className="text-right">Realizado</div>
            <div className="text-right">%</div>
            <div className="text-right">Bônus</div>
          </div>

          <div className="divide-y divide-slate-100">
            {weeklyRows.map((w) => (
              <div
                key={w.week_mondayISO}
                className={[
                  "grid grid-cols-[1.3fr_0.9fr_0.9fr_0.8fr_0.9fr] px-3 py-2 text-sm",
                  w.included ? "bg-white" : "bg-slate-50/60",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className="truncate text-slate-900">{w.label}</div>
                  {!w.included && (
                    <div className="text-[11px] text-slate-500">Fora da seleção</div>
                  )}
                </div>
                <div className="text-right text-slate-800">{formatBRL(w.weekly_meta)}</div>
                <div className="text-right text-slate-800">{formatBRL(w.weekly_realized)}</div>
                <div className="text-right text-slate-800">{formatPct(w.weekly_pct_achieved, 2)}</div>
                <div className="text-right font-semibold text-slate-900">
                  {formatBRL(w.weekly_bonus_value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensal + Carteira */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">Base mensal e positivação</div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mês (vendas líquidas)
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">

            </div>
            <div className="mt-2 text-sm text-slate-700">
              Meta: <span className="font-semibold">{formatBRL(seller.monthly.goal_meta)}</span>
            </div>
            <div className="text-sm text-slate-700">
              Realizado: <span className="font-semibold">{formatBRL(seller.monthly.net_sales)}</span>
            </div>
            <div className="text-sm text-slate-700">
              Atingimento:{" "}
              <span className="font-semibold">{formatPct(seller.monthly.pct_achieved, 2)}</span>
            </div>
            <div className="text-sm text-slate-700">
              Bônus mensal:{" "}
              <span className="font-semibold">{formatBRL(seller.monthly.month_bonus_value)}</span>
              <span className="ml-2 text-xs text-slate-500">
                (taxa {formatPct(seller.monthly.month_bonus_rate * 100, 3)})
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Carteira / Positivação
            </div>
            <div className="mt-2 text-sm text-slate-700">
              Clientes carteira:{" "}
              <span className="font-semibold">{seller.wallet.wallet_total}</span>
            </div>
            <div className="text-sm text-slate-700">
              Positivados no mês:{" "}
              <span className="font-semibold">{seller.wallet.wallet_positive_month}</span>
            </div>
            <div className="text-sm text-slate-700">
              Positivação:{" "}
              <span className="font-semibold">{formatPct(seller.wallet.wallet_positive_pct, 2)}</span>
            </div>
            <div className="text-sm text-slate-700">
              Bônus positivação:{" "}
              <span className="font-semibold">{formatBRL(seller.wallet.positivity_bonus_value)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
