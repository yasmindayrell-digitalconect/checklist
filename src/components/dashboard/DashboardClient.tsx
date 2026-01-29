"use client";

import type { OpenBudgetCard } from "@/types/dashboard";
import OpenBudgetsRow from "./OpenBudgetsRow";
import BudgetAchieved from "./BudgetAchieved";
import DailyGoalCard from "./GoalsCard";
import DaysCard from "./DaysCard";
import DevolutionsCard from "./DevolutionCard";

type SellerKpiRow = {
  seller_id: number;
  seller_name: string | null;

  gross_total: number;
  freight_total: number;
  operational_expense: number;
  system_total: number;

  net_sales: number;
  goal_meta: number;
  pct_achieved: number;
};

export default function DashboardClient({
  openBudgetClients,
  sellerKpis,
}: {
  openBudgetClients: OpenBudgetCard[];   // ✅ AQUI
  sellerKpis: SellerKpiRow[];
}) {
  const kpi = sellerKpis?.[0] ?? null;

  return (
    <div>
      <div className="mx-auto w-full max-w-screen-3xl px-1 sm:px-6 md:px-8 lg:px-10 py-1 space-y-6">
        <div className="rounded-2xl bg-white p-2">
          {!kpi ? (
            <p className="text-sm text-[#495057]">Sem dados de vendas no mês atual.</p>
          ) : (
            <div className="mt-4 grid gap-3 lg:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <BudgetAchieved
                value={kpi.net_sales}
                target={kpi.goal_meta}
                label="da meta"
                maxPct={2}
              />

              <DailyGoalCard
                netSales={kpi.net_sales}
                goal={kpi.goal_meta}
                workdaysInMonth={0}
                workdaysElapsed={0}
                workdaysRemaining={0}
              />

              <DaysCard uteisMes={0} corridos={0} restam={0} />

              <DevolutionsCard
                devolucoes={0}
                taxaDev={null}
                faturamentoBruto={kpi.gross_total}
              />
            </div>
          )}
        </div>

        <OpenBudgetsRow clients={openBudgetClients} />
      </div>
    </div>
  );
}
