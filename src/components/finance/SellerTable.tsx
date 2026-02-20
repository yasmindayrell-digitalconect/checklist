"use client";

import React from "react";
import { FinanceSeller, FinanceWeek} from "@/types/finance";
import SellerRow from "./SellerRow";
import {FINANCE_GRID } from "@/components/utils";

export default function SellerTable({
  rows,
  allWeeks,
  selectedWeekKeys,
}: {
  rows: Array<{
    seller: FinanceSeller;
    weeklyBonusSelected: number;
    monthlyBonus: number;
    positivityBonus: number;
    total: number;
  }>;
  allWeeks: FinanceWeek[];
  selectedWeekKeys: Set<string>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`grid ${FINANCE_GRID} items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600`}>
        <div>Vendedor</div>
        <div className="text-right">Semanal (acum.)</div>
        <div className="text-right">Mensal</div>
        <div className="text-right">Positivação</div>
        <div className="text-right pr-10">Total</div>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <SellerRow
            key={r.seller.seller_id}
            row={r}
            allWeeks={allWeeks}
            selectedWeekKeys={selectedWeekKeys}
          />
        ))}
      </div>
    </div>
  );
}
