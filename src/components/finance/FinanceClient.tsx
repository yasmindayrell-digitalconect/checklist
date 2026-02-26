"use client";

import React, { useMemo, useState } from "react";
import FinanceHeader from "./FinanceHeader";
import SellerTable from "./SellerTable";
import { FinanceBonusesPayload } from "@/types/finance";
function sum(nums: number[]) {
  let acc = 0;
  for (const n of nums) acc += Number.isFinite(n) ? n : 0;
  return acc;
}


function addMonths(ym: string, delta: number) {
  // ym: "YYYY-MM"
  const m = /^(\d{4})-(\d{2})$/.exec((ym ?? "").trim());
  const y = m ? Number(m[1]) : new Date().getFullYear();
  const mm = m ? Number(m[2]) : new Date().getMonth() + 1;

  const base = new Date(y, mm - 1, 1);
  base.setMonth(base.getMonth() + delta);

  const yy = base.getFullYear();
  const m2 = String(base.getMonth() + 1).padStart(2, "0");
  return `${yy}-${m2}`;
}

/** =======================
 * Main
 * ======================= */

export default function FinanceClient({ data }: { data: FinanceBonusesPayload }) {
  // por padrão: todas as semanas do payload entram
  const [selectedWeekKeys, setSelectedWeekKeys] = useState<Set<string>>(
    () => new Set(data.weeks.map((w) => w.mondayISO))
  );

  const computedRows = useMemo(() => {
    const keys = selectedWeekKeys;

    return data.sellers
      .map((s) => {
        const weeklyBonusSelected = sum(
          s.weeks
            .filter((w) => keys.has(w.week_mondayISO))
            .map((w) => w.weekly_bonus_value)
        );

        const monthlyBonus = s.monthly.month_bonus_value ?? 0;
        const positivityBonus = s.wallet.positivity_bonus_value ?? 0;

        const commission = weeklyBonusSelected + monthlyBonus + positivityBonus; // 👈 total antigo
        const salary = s.base_salary ?? 0; // 👈 novo
        const total = commission + salary; // 👈 novo total

        return {
          seller: s,
          weeklyBonusSelected,
          monthlyBonus,
          positivityBonus,

          commission, // 👈 novo
          salary,     // 👈 novo
          total,      // 👈 agora é total novo
        };
      })
      .sort((a, b) => {
        const an = (a.seller.seller_name ?? "").trim();
        const bn = (b.seller.seller_name ?? "").trim();
        return an.localeCompare(bn, "pt-BR", { sensitivity: "base" });
      });
  }, [data.sellers, selectedWeekKeys]);
  return (
    <div className="mx-auto w-full max-w-8xl px-4 py-6">

      <FinanceHeader
        monthLabel={data.month.label}
        weeks={data.weeks}
        selectedWeekKeys={selectedWeekKeys}
        onToggleWeek={(key) => {
          setSelectedWeekKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }}
        onNavigateMonth={(delta) => {
          const nextYM = addMonths(data.month.ym, delta);
          const sp = new URLSearchParams(window.location.search);
          sp.set("month", nextYM);
          window.location.search = sp.toString();
        }}
      />

      <div className="mt-4">
        <SellerTable
          rows={computedRows}
          allWeeks={data.weeks}
          selectedWeekKeys={selectedWeekKeys}
        />
      </div>

      <div className="mt-3 text-xs text-slate-500">
        * A bonificação semanal acumulada considera apenas as semanas selecionadas no topo.
      </div>
    </div>
  );
}
