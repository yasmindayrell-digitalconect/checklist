"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  month_bonus_rate: number; // 0 / 0.0005 / 0.001
  month_bonus_value: number; // já calculado no server
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
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function SparkBar({ pct }: { pct: number }) {
  const w = clamp(Number.isFinite(pct) ? pct : 0, 0, 130);
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-2 rounded-full bg-slate-400" style={{ width: `${w}%` }} />
    </div>
  );
}

export default function FinanceClient({ data }: { data: FinanceBonusesPayload }) {
  // ✅ seleção GLOBAL do mês: mondayISO -> boolean
  const [selectedWeeks, setSelectedWeeks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // default: todas as semanas do mês marcadas
    const initial: Record<string, boolean> = {};
    for (const w of data.weeks) initial[w.mondayISO] = true;
    setSelectedWeeks(initial);
  }, [data.month.ym, data.weeks]);

  const toggleWeek = (mondayISO: string) => {
    setSelectedWeeks((prev) => ({ ...prev, [mondayISO]: !prev[mondayISO] }));
  };

  const setAllWeeks = (value: boolean) => {
    setSelectedWeeks(() => {
      const next: Record<string, boolean> = {};
      for (const w of data.weeks) next[w.mondayISO] = value;
      return next;
    });
  };

  const summary = useMemo(() => {
    let totalPos = 0;
    let totalMonthly = 0;
    let totalWeeklySelected = 0;

    for (const s of data.sellers) {
      totalPos += s.wallet.positivity_bonus_value || 0;
      totalMonthly += s.monthly.month_bonus_value || 0;

      for (const w of s.weeks) {
        if (selectedWeeks[w.week_mondayISO]) totalWeeklySelected += w.weekly_bonus_value || 0;
      }
    }

    return {
      sellersCount: data.sellers.length,
      totalPos,
      totalMonthly,
      totalWeeklySelected,
      totalAll: totalPos + totalMonthly + totalWeeklySelected,
    };
  }, [data.sellers, selectedWeeks]);

  // quick map monday->label (usado nas linhas)
  const labelByMonday = useMemo(() => new Map(data.weeks.map((w) => [w.mondayISO, w.label] as const)), [data.weeks]);

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Financeiro — Bonificações</div>
              <div className="text-xs text-slate-500 mt-1">
                Mês: <span className="font-semibold">{data.month.label}</span>{" "}
                <span className="text-slate-400">({data.month.ym})</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="neutral">Positivação ≥ {data.rules.positivity_threshold_pct}%</Chip>
                <Chip tone="neutral">
                  Semanal: {(data.rules.weekly_bonus_rate * 100).toFixed(2)}% do líquido (se bateu)
                </Chip>
                <Chip tone="neutral">
                  Mensal: 100% {(data.rules.monthly_bonus_rate_100 * 100).toFixed(2)}% • 110%{" "}
                  {(data.rules.monthly_bonus_rate_110 * 100).toFixed(2)}%
                </Chip>
              </div>
            </div>

            {/* Totais gerais */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 w-full sm:w-[420px]">
              <div className="text-[11px] font-semibold text-slate-500">Resumo do mês (seleção atual)</div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{formatBRL(summary.totalAll)}</div>
                <div className="text-[11px] text-slate-500">{summary.sellersCount} vendedores</div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg bg-white border border-slate-200 px-2 py-2">
                  <div className="text-slate-500 font-semibold">Positivação</div>
                  <div className="font-bold text-slate-900 tabular-nums">{formatBRL(summary.totalPos)}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 px-2 py-2">
                  <div className="text-slate-500 font-semibold">Mensal</div>
                  <div className="font-bold text-slate-900 tabular-nums">{formatBRL(summary.totalMonthly)}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 px-2 py-2">
                  <div className="text-slate-500 font-semibold">Semanal (sel.)</div>
                  <div className="font-bold text-slate-900 tabular-nums">{formatBRL(summary.totalWeeklySelected)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weeks chips + botões globais */}
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs font-semibold text-slate-700">Semanas disponíveis (que encostam no mês)</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAllWeeks(true)}
                  className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Marcar todas
                </button>
                <button
                  type="button"
                  onClick={() => setAllWeeks(false)}
                  className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {data.weeks.map((w) => {
                const on = !!selectedWeeks[w.mondayISO];
                return (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => toggleWeek(w.mondayISO)}
                    className={[
                      "text-[11px] font-semibold px-2 py-1 rounded-full border transition",
                      on
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                    title={`${w.mondayISO} → ${w.fridayISO}`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {data.sellers.map((s) => {
            const weeklySelectedTotal = s.weeks.reduce(
              (acc, w) => acc + (selectedWeeks[w.week_mondayISO] ? (w.weekly_bonus_value || 0) : 0),
              0
            );

            const totalPay =
              (s.wallet.positivity_bonus_value || 0) + (s.monthly.month_bonus_value || 0) + weeklySelectedTotal;

            const posOk = s.wallet.wallet_positive_pct >= data.rules.positivity_threshold_pct;

            return (
              <div key={s.seller_id} className="rounded-2xl border border-slate-100 overflow-hidden">
                {/* Seller top row */}
                <div className="p-4 bg-white">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-extrabold text-slate-900 truncate">
                          {(s.seller_name ?? "Sem nome").toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 border border-slate-200 bg-slate-50 px-2 py-1 rounded-full">
                          ID: {s.seller_id}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Chip tone={posOk ? "ok" : "warn"}>
                          Positivação {formatPct(s.wallet.wallet_positive_pct)} ({s.wallet.wallet_positive_month}/
                          {s.wallet.wallet_total})
                        </Chip>
                        <Chip tone={s.monthly.month_bonus_value > 0 ? "ok" : "neutral"}>
                          Mensal {formatPct(s.monthly.pct_achieved)} • bônus {formatBRL(s.monthly.month_bonus_value)}
                        </Chip>
                        <Chip tone={weeklySelectedTotal > 0 ? "ok" : "neutral"}>
                          Semanal (sel.) {formatBRL(weeklySelectedTotal)}
                        </Chip>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                          <div className="text-[11px] font-semibold text-slate-500">Meta mensal</div>
                          <div className="text-base font-extrabold text-slate-900 tabular-nums">
                            {formatBRL(s.monthly.goal_meta)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                          <div className="text-[11px] font-semibold text-slate-500">Realizado (líquido)</div>
                          <div className="text-base font-extrabold text-slate-900 tabular-nums">
                            {formatBRL(s.monthly.net_sales)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                          <div className="text-[11px] font-semibold text-slate-500">Progresso mensal</div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-extrabold text-slate-900 tabular-nums">
                              {formatPct(s.monthly.pct_achieved)}
                            </div>
                            <div className="w-40">
                              <SparkBar pct={s.monthly.pct_achieved} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total pay card */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 w-full lg:w-[360px]">
                      <div className="flex items-baseline justify-between">
                        <div className="text-[11px] font-semibold text-slate-500">Total bônus (com seleção)</div>
                        <div className="text-[11px] text-slate-500">auto + semanas marcadas</div>
                      </div>
                      <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">{formatBRL(totalPay)}</div>

                      <div className="mt-3 space-y-2 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Positivação</span>
                          <span className="font-bold tabular-nums">{formatBRL(s.wallet.positivity_bonus_value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Mensal</span>
                          <span className="font-bold tabular-nums">{formatBRL(s.monthly.month_bonus_value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Semanal (selecionado)</span>
                          <span className="font-bold tabular-nums">{formatBRL(weeklySelectedTotal)}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] text-slate-500">
                        A seleção de semanas é <span className="font-semibold">global</span> e vale para todos os vendedores.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weeks table */}
                <div className="border-t border-slate-100 bg-white">
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-700">Semanas (seleção global do mês)</div>
                    <div className="text-[11px] text-slate-500">O checkbox reflete a seleção global no topo.</div>
                  </div>

                  <div className="px-4 pb-4 overflow-x-auto">
                    <table className="min-w-[880px] w-full text-xs">
                      <thead>
                        <tr className="text-[11px] text-slate-500">
                          <th className="text-left py-2 pr-3">Entrar</th>
                          <th className="text-left py-2 pr-3">Semana</th>
                          <th className="text-right py-2 px-3">Meta</th>
                          <th className="text-right py-2 px-3">Realizado líquido</th>
                          <th className="text-right py-2 px-3">Pct</th>
                          <th className="text-right py-2 px-3">Bônus semanal (auto)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.weeks.map((w) => {
                          const selected = !!selectedWeeks[w.week_mondayISO];
                          const pctTone =
                            w.weekly_pct_achieved >= 100 ? "ok" : w.weekly_pct_achieved >= 80 ? "warn" : "neutral";

                          return (
                            <tr
                              key={w.week_mondayISO}
                              className={`border-t border-slate-100 ${selected ? "bg-emerald-50/40" : ""}`}
                            >
                              <td className="py-2 pr-3">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleWeek(w.week_mondayISO)}
                                  className="h-4 w-4 accent-emerald-600"
                                  aria-label={`Selecionar semana ${w.week_mondayISO}`}
                                />
                              </td>
                              <td className="py-2 pr-3">
                                <div className="font-semibold text-slate-700">
                                  {labelByMonday.get(w.week_mondayISO) ?? w.week_mondayISO}
                                </div>
                                <div className="text-[11px] text-slate-400">{w.week_mondayISO}</div>
                              </td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatBRL(w.weekly_meta)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">{formatBRL(w.weekly_realized)}</td>
                              <td className="py-2 px-3 text-right tabular-nums">
                                <span className="inline-flex justify-end w-full">
                                  <Chip tone={pctTone}>{formatPct(w.weekly_pct_achieved)}</Chip>
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right tabular-nums font-extrabold text-slate-900">
                                {formatBRL(w.weekly_bonus_value)}
                              </td>
                            </tr>
                          );
                        })}
                        {s.weeks.length === 0 && (
                          <tr>
                            <td className="py-3 text-slate-400" colSpan={6}>
                              (sem semanas retornadas)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-600">
                      <span className="font-semibold">Placeholder:</span> seleção fica só no front por enquanto. Depois você pode
                      persistir por mês (e não por vendedor).
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Debug bruto */}
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