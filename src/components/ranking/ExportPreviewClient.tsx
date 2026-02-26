"use client";

import React from "react";
import RankingExportRender from "./(header)/RankingExportRender";

type ExportKey =
  | "branches_monthly"
  | "branches_daily"
  | "sellers_week_goals"
  | "sellers_month_goals"
  | "sellers_positivation";

// ✅ MOCKS (ajuste se seu RankingExportRender precisar de mais campos)
const byBranch = [
  { empresa_id: 1, name: "Brasília", goal: 120000, realized: 84500, pct: 70.42 },
  { empresa_id: 2, name: "São Luís", goal: 80000, realized: 61200, pct: 76.5 },
  { empresa_id: 3, name: "Imperatriz", goal: 65000, realized: 40250, pct: 140 },
  { empresa_id: 4, name: "São Luís", goal: 80000, realized: 61200, pct: 100},
  { empresa_id: 4, name: "Imperatriz", goal: 65000, realized: 40250, pct: 120 },
] as any[];

const sellers = [
  {
    seller_id: 10,
    seller_name: "João",
    week_goal: 18000,
    week_sold: 14200,
    week_pct: 78.89,
    month_goal: 72000,
    month_sold: 50500,
    month_pct: 70.14,
    positivity_pct: 63.2,
  },
  {
    seller_id: 11,
    seller_name: "Maria",
    week_goal: 22000,
    week_sold: 23100,
    week_pct: 105.0,
    month_goal: 88000,
    month_sold: 69900,
    month_pct: 79.43,
    positivity_pct: 71.8,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Felipe Fernandes",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 120,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Haylane Alves Alves",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
  {
    seller_id: 12,
    seller_name: "Pedro",
    week_goal: 15000,
    week_sold: 9100,
    week_pct: 60.67,
    month_goal: 60000,
    month_sold: 32100,
    month_pct: 53.5,
    positivity_pct: 48.4,
  },
] as any[];

const weekLabel = "17/02–23/02";
const monthLabel = "Fevereiro/2026";

const ITEMS: { key: ExportKey; title: string }[] = [
  { key: "branches_monthly", title: "1) Filiais Mensal" },
  { key: "branches_daily", title: "2) Filiais Diário" },
  { key: "sellers_week_goals", title: "3) Vendedores metas semanas" },
  { key: "sellers_month_goals", title: "4) Vendedores metas mensais" },
  { key: "sellers_positivation", title: "5) Vendedores positivação" },
];

export default function ExportPreviewClient() {
  return (
    <div className="min-h-screen bg-[#0b0f3a] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-bold">Preview — Ranking Exports (5 imagens)</h1>
          <p className="text-sm text-white/60">
            Cada bloco abaixo renderiza o <code className="text-white/80">RankingExportRender</code> com um{" "}
            <code className="text-white/80">exportKey</code> diferente.
          </p>
        </div>

        <div className="space-y-10">
          {ITEMS.map((it) => (
            <section key={it.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{it.title}</h2>
                <span className="text-xs text-white/50">{it.key}</span>
              </div>

              {/* Scroll horizontal p/ caber 1080px em telas menores */}
              <div className="overflow-x-auto">
                <div className="w-200">
                  <RankingExportRender
                    exportKey={it.key}
                    weekLabel={weekLabel}
                    monthLabel={monthLabel}
                    sellers={sellers}
                    byBranch={byBranch}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 text-xs text-white/50">
          Dica: se quiser ver com dados reais, troque os mocks <code>byBranch</code> e <code>sellers</code> pelos dados
          que você já carrega no ranking.
        </div>
      </div>
    </div>
  );
}