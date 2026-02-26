// components/ranking/RankingExportRender.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { RankingSellerRow, BranchRow } from "@/types/ranking";
import { formatBRL, formatPct } from "@/components/utils";

type ExportKey =
  | "branches_monthly"
  | "branches_daily"
  | "sellers_week_goals"
  | "sellers_month_goals"
  | "sellers_positivation";

type Props = {
  exportKey: ExportKey | null;
  weekLabel: string;
  monthLabel: string;
  sellers: RankingSellerRow[];
  byBranch: BranchRow[];
};

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

const RankingExportRender = React.forwardRef<HTMLDivElement, Props>(function RankingExportRender(
  { exportKey, weekLabel, monthLabel, sellers, byBranch },
  ref
) {
  if (!exportKey) {
    return <div ref={ref} style={{ width: 1080, height: 10 }} />;
  }

  const titleMap: Record<ExportKey, string> = {
    branches_monthly: "Filiais — Mensal",
    branches_daily: "Filiais — Diário",
    sellers_week_goals: "Vendedores — Meta semanal",
    sellers_month_goals: "Vendedores — Meta mensal",
    sellers_positivation: "Vendedores — Positivação",
  };

  const subtitle = exportKey.includes("week") ? `Semana: ${weekLabel}` : `Mês: ${monthLabel}`;

  const rows =
    exportKey === "branches_monthly" || exportKey === "branches_daily"
      ? [...byBranch]
          .sort((a, b) => n(b.pct) - n(a.pct))
          .slice(0, 16)
          .map((r) => ({
            name: r.name,
            realized: formatBRL(n((r as any).realized_today)),
            info: `Ating. mensal ->`,
            pct: n(r.pct),
          }))
      : exportKey === "sellers_week_goals"
      ? [...sellers]
          .sort((a, b) => n(b.weekly_pct_achieved) - n(a.weekly_pct_achieved))
          .slice(0, 18)
          .map((r) => ({
            name: r.seller_name ?? `Vendedor ${r.seller_id}`,
            realized: formatBRL(n(r.weekly_realized)),
            info: `Meta: ${formatBRL(n(r.weekly_meta))}`,
            pct: n(r.weekly_pct_achieved),
          }))
      : exportKey === "sellers_month_goals"
      ? [...sellers]
          .sort((a, b) => n(b.pct_achieved) - n(a.pct_achieved))
          .slice(0, 18)
          .map((r) => ({
            name: r.seller_name ?? `Vendedor ${r.seller_id}`,
            realized: formatBRL(n(r.net_sales)),
            info: `Meta: ${formatBRL(n(r.goal_meta))}`,
            pct: n(r.pct_achieved),
          }))
      : [...sellers]
          .sort((a, b) => n(b.wallet_positive_pct) - n(a.wallet_positive_pct))
          .slice(0, 18)
          .map((r) => ({
            name: r.seller_name ?? `Vendedor ${r.seller_id}`,
            realized: `${n(r.wallet_positive_month)} positivos`,
            info: `Carteira: ${n(r.wallet_total)}`,
            pct: n(r.wallet_positive_pct),
          }));

return (
  <div
    ref={ref}
    style={{ width: 850 }}
    className="relative overflow-hidden bg-transparent"
  >
    {/* BACKGROUND do /public */}
    <div className="absolute inset-0 -z-20">
      <Image
        src="/BACKGROUND.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="900px"
        className="object-cover object-center"
      />
    </div>

    {/* Header */}
    <div className="relative px-10 pt-10 pb-8">
      <div className="mt-3 text-4xl font-extrabold leading-tight text-slate-100">
        {titleMap[exportKey]}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-200">
        {subtitle}
      </div>

    </div>

    {/* Card principal */}
    <div className="relative px-10 pb-10">
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-[0_25px_60px_rgba(15,23,42,0.14)]">
        {/* Cabeçalho tabela */}
        <div className="border-b border-slate-200 bg-slate-50 px-8 py-5">
          <div className="grid grid-cols-[220px_220px_200px] gap-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <div>Nome</div>
            <div className="text-center">Realizado</div>
            <div className="text-center">% Ating.</div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map((r, i) => {
            const pct = n(r.pct);
            const pctClamped = Math.max(0, Math.min(140, pct));
            const top3 = i < 3;
            const good = pct >= 100;

            return (
              <div
                key={i}
                className={[
                  "px-8 py-5",
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                ].join(" ")}
              >
                <div className="grid grid-cols-[220px_220px_200px] gap-4 items-center">
                  {/* Nome + posição */}
                  <div className="min-w-0 flex items-center gap-3">
                    <div
                      className={[
                        "shrink-0 grid place-items-center rounded-xl font-bold tabular-nums",
                        top3
                          ? "h-10 w-10 bg-[#80ef80]/50 text-[#109c10]"
                          : "h-10 w-10 bg-[#2323ff]/10 text-[#2323ff]",
                      ].join(" ")}
                    >
                      {i + 1}°
                    </div>
                    <div className="flex flex-col">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-slate-600">
                          {r.name}
                        </div>
                        <div className="truncate text-md font-semibold text-slate-500">
                          {r.info}
                        </div>
        
                      </div>
                    </div>
                  </div>

                  {/* Realizado */}
                  <div className="text-center">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-md font-bold tabular-nums text-slate-500 shadow-sm">
                      {r.realized}
                    </div>
                  </div>

                  {/* % + barra */}
                  <div className="text-center">
                    <div
                      className={[
                        "text-lg font-bold tabular-nums",
                        good ? "text-[#80ef80]" : "text-[#2323ff]",
                      ].join(" ")}
                    >
                      {formatPct(pct)}
                    </div>

                    <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(pctClamped / 100) * 100}%`,
                          backgroundColor: good ? "#80ef80" : "#2323ff",
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 text-center text-sm font-semibold text-slate-100">
        * Top {rows.length} ordenado por maior % de atingimento.
      </div>
    </div>
  </div>
);
});

export default RankingExportRender;