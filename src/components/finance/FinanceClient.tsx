"use client";

import React from "react";

export type FinanceWeek = {
  key: string; // monday ISO
  mondayISO: string;
  fridayISO: string;
  label: string; // "dd/mm a dd/mm"
};

export type FinanceSellerMonthly = {
  seller_id: number;
  seller_name: string | null;
  goal_meta: number;
  net_sales: number;
  pct_achieved: number;
  month_bonus_rate: number;   // 0 / 0.0005 / 0.001
  month_bonus_value: number;  // já calculado no server
};

export type FinanceSellerWallet = {
  seller_id: number;
  wallet_total: number;
  wallet_positive_month: number;
  wallet_positive_pct: number;

  positivity_bonus_tier: "none" | "150" | "200" | "250";
  positivity_bonus_value: number;
};


export type FinanceSellerWeek = {
  seller_id: number;
  week_mondayISO: string;
  weekly_meta: number;
  weekly_realized: number;
  weekly_pct_achieved: number;
  weekly_bonus_value: number; // já calculado no server (0.05% se bateu)
};

export type FinanceBonusesPayload = {
  month: {
    ym: string; // YYYY-MM
    ano_mes: number; // YYYYMM
    dt_iniISO: string;
    dt_fimISO: string;
    label: string;
  };
  weeks: FinanceWeek[];
  sellers: Array<{
    seller_id: number;
    seller_name: string | null;
    monthly: FinanceSellerMonthly;
    wallet: FinanceSellerWallet;
    weeks: FinanceSellerWeek[];
  }>;
  rules: {
    positivity_threshold_pct: number;
    positivity_bonus_options: number[];
    weekly_bonus_rate: number;
    monthly_bonus_rate_100: number;
    monthly_bonus_rate_110: number;
  };
};

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function formatPct(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `${n.toFixed(2)}%`;
}

export default function FinanceClient({ data }: { data: FinanceBonusesPayload }) {
  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="text-sm font-semibold text-slate-900">Financeiro — Bonificações</div>
          <div className="text-xs text-slate-500">
            Mês: <span className="font-semibold">{data.month.label}</span> ({data.month.ym})
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Regras: Positivação ≥ {data.rules.positivity_threshold_pct}% (bônus:{" "}
            {data.rules.positivity_bonus_options.map((x) => formatBRL(x)).join(" / ")}), semanal bateu meta ={" "}
            {(data.rules.weekly_bonus_rate * 100).toFixed(2)}% líquido, mensal 100% ={" "}
            {(data.rules.monthly_bonus_rate_100 * 100).toFixed(2)}% e 110% ={" "}
            {(data.rules.monthly_bonus_rate_110 * 100).toFixed(2)}%.
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Semanas disponíveis */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">Semanas que encostam no mês</div>
            <div className="flex flex-wrap gap-2">
              {data.weeks.map((w) => (
                <span
                  key={w.key}
                  className="text-[11px] font-semibold border border-slate-200 bg-slate-50 text-slate-700 px-2 py-1 rounded-full"
                >
                  {w.label}
                </span>
              ))}
            </div>
          </div>

          {/* Resumo por vendedor (simples) */}
          <div className="space-y-4">
            {data.sellers.map((s) => {
              const eligiblePositivity = s.wallet.wallet_positive_pct >= data.rules.positivity_threshold_pct;
              return (
                <div key={s.seller_id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {(s.seller_name ?? "Sem nome").toUpperCase()}{" "}
                        <span className="text-xs font-semibold text-slate-400">ID {s.seller_id}</span>
                      </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Positivação: <span className="font-semibold">{formatPct(s.wallet.wallet_positive_pct)}</span>{" "}
                          ({s.wallet.wallet_positive_month}/{s.wallet.wallet_total}) •
                          <span className="font-semibold"> bônus {formatBRL(s.wallet.positivity_bonus_value)}</span>
                        </div>

                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 font-semibold">Bônus mensal (auto)</div>
                      <div className="text-sm font-bold text-slate-900">{formatBRL(s.monthly.month_bonus_value)}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatPct(s.monthly.pct_achieved)} • líquido {formatBRL(s.monthly.net_sales)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[11px] font-semibold text-slate-500">Meta mensal</div>
                      <div className="text-sm font-bold text-slate-900">{formatBRL(s.monthly.goal_meta)}</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[11px] font-semibold text-slate-500">Realizado (líquido)</div>
                      <div className="text-sm font-bold text-slate-900">{formatBRL(s.monthly.net_sales)}</div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="text-[11px] font-semibold text-slate-500">Pct mensal</div>
                      <div className="text-sm font-bold text-slate-900">{formatPct(s.monthly.pct_achieved)}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Semanas (dados brutos p/ seleção)</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-190 w-full text-xs">
                        <thead>
                          <tr className="text-[11px] text-slate-500">
                            <th className="text-left py-2 pr-3">Semana (monday)</th>
                            <th className="text-right py-2 px-3">Meta</th>
                            <th className="text-right py-2 px-3">Realizado líquido</th>
                            <th className="text-right py-2 px-3">Pct</th>
                            <th className="text-right py-2 pl-3">Bônus semanal (auto)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.weeks.map((w) => (
                            <tr key={w.week_mondayISO} className="border-t border-slate-100">
                              <td className="py-2 pr-3 font-semibold text-slate-700">{w.week_mondayISO}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatBRL(w.weekly_meta)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatBRL(w.weekly_realized)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatPct(w.weekly_pct_achieved)}</td>
                              <td className="py-2 pl-3 text-right tabular-nums font-bold">
                                {formatBRL(w.weekly_bonus_value)}
                              </td>
                            </tr>
                          ))}
                          {s.weeks.length === 0 && (
                            <tr>
                              <td className="py-2 text-slate-400" colSpan={5}>
                                (sem semanas retornadas)
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500">
                      Placeholder: aqui o financeiro vai “marcar” quais semanas entram no mês e o front soma os bônus.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debug bruto (pra você validar rápido) */}
          <details className="rounded-xl border border-slate-100 p-4">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">Ver payload bruto (debug)</summary>
            <pre className="mt-3 text-[11px] overflow-auto bg-slate-50 border border-slate-100 p-3 rounded-lg">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
