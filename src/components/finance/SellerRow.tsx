"use client";

import React, { useMemo, useState } from "react";
import { FinanceSeller, FinanceWeek} from "@/types/finance";
import ExpandedSellerPanel from "./ExpandedSellerPanel";
import { formatBRL, formatPct, FINANCE_GRID } from "@/components/utils";

export default function SellerRow({
  row,
  allWeeks,
  selectedWeekKeys,
}: {
  row: {
    seller: FinanceSeller;
    weeklyBonusSelected: number;
    monthlyBonus: number;
    positivityBonus: number;
    total: number;
  };
  allWeeks: FinanceWeek[];
  selectedWeekKeys: Set<string>;
}) {
  const [open, setOpen] = useState(false);

  const name = row.seller.seller_name?.trim() || `Vendedor ${row.seller.seller_id}`;

  const pills = useMemo(() => {
    const pct = row.seller.monthly.pct_achieved ?? 0;
    const pos = row.seller.wallet.wallet_positive_pct ?? 0;

    return [
      { label: `Ating. mês: ${formatPct(pct, 2)}`, tone: "neutral" as const },
      { label: `Positiv.: ${formatPct(pos, 2)}`, tone: "neutral" as const },
    ];
  }, [row.seller.monthly.pct_achieved, row.seller.wallet.wallet_positive_pct]);

  return (
    <div>
      <div className={`grid ${FINANCE_GRID} items-center px-4 py-3`}>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {pills.map((p) => (
              <span
                key={p.label}
                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right text-lg font-normal text-slate-900">
          {formatBRL(row.weeklyBonusSelected)}
        </div>
        <div className="text-right text-lg font-normal text-slate-900">
          {formatBRL(row.monthlyBonus)}
        </div>
        <div className="text-right text-lg font-normal text-slate-900">
          {formatBRL(row.positivityBonus)}
        </div>
        <div className="pr-5 text-right text-lg font-bold text-[#2323ff]">
          {formatBRL(row.total)}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {open ? "Fechar" : "Expandir"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-4">
          <ExpandedSellerPanel
            seller={row.seller}
            allWeeks={allWeeks}
            selectedWeekKeys={selectedWeekKeys}
          />
        </div>
      )}
    </div>
  );
}
