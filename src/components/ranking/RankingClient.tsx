// components/ranking/RankingClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import SellerCard from "./SellerCard";
import type { RankingSellerRow } from "@/app/(app)/ranking/page";
import RankingHeader, { type BranchRow } from "./RankingHeader";

type SortKey = "week" | "monthGoal" | "positivity";
type SortDir = "desc" | "asc";

function stableSort<T>(arr: T[], cmp: (a: T, b: T) => number) {
  return arr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const r = cmp(a.v, b.v);
      return r !== 0 ? r : a.i - b.i;
    })
    .map((x) => x.v);
}

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function RankingClient({
  weekOffset,
  weekLabel,
  monthLabel,
  totalMonthGoal,
  sellers,
  totalMonthSold,
  totalMonthPct,
  byBranch,
}: {
  weekOffset: number;
  weekLabel: string;
  monthLabel: string;
  totalMonthGoal: number;
  totalMonthSold: number;
  totalMonthPct: number;
  sellers: RankingSellerRow[];
  byBranch: BranchRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("week");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const ranked = useMemo(() => {
    const dir = sortKey === "week" ? "desc" : sortDir; // semana fica “padrão”
    const mult = dir === "asc" ? 1 : -1;

    return stableSort([...sellers], (a, b) => {
      // 1) ordenação escolhida
      if (sortKey === "monthGoal") {
        const av = n(a.pct_achieved);
        const bv = n(b.pct_achieved);
        if (av !== bv) return (av < bv ? -1 : 1) * mult;

        // desempate: quem realizou mais no mês
        const am = n(a.net_sales);
        const bm = n(b.net_sales);
        if (am !== bm) return (am < bm ? -1 : 1) * mult;

        // desempate final: semana (mantém feeling de ranking)
        return n(b.goal_meta) - n(a.goal_meta);
      }

      if (sortKey === "positivity") {
        const av = n(a.wallet_positive_pct);
        const bv = n(b.wallet_positive_pct);
        if (av !== bv) return (av < bv ? -1 : 1) * mult;

        // desempate: positivos no mês (volume)
        const ap = n(a.wallet_positive_month);
        const bp = n(b.wallet_positive_month);
        if (ap !== bp) return (ap < bp ? -1 : 1) * mult;

        // desempate final: semana
        return n(b.weekly_pct_achieved) - n(a.weekly_pct_achieved);
      }

      // 2) padrão por semana (o que você já tem hoje)
      const ap = n(a.weekly_pct_achieved);
      const bp = n(b.weekly_pct_achieved);
      if (bp !== ap) return bp - ap;

      const ar = n(a.weekly_realized);
      const br = n(b.weekly_realized);
      if (br !== ar) return br - ar;

      const am = n(a.net_sales);
      const bm = n(b.net_sales);
      return bm - am;
    });
  }, [sellers, sortKey, sortDir]);

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-lg">
        <RankingHeader
          weekOffset={weekOffset}
          weekLabel={weekLabel}
          monthLabel={monthLabel}
          totalMonthGoal={totalMonthGoal}
          totalMonthSold={totalMonthSold}
          totalMonthPct={totalMonthPct}
          byBranch={byBranch}
          // 👇 novo
          sortKey={sortKey}
          sortDir={sortDir}
          onChangeSortKey={setSortKey}
          onToggleSortDir={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
        />

        <div className="px-4 sm:px-6">
          <div className="flex flex-col gap-4 pt-4">
            {ranked.map((row, idx) => (
              <SellerCard key={row.seller_id} row={row} rank={idx + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
