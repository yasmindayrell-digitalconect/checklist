"use client";

import type { OpenBudgetCard, SellerKpiRow } from "@/types/dashboard";
import OpenBudgetsDashboard from "./(budgets)/OpenBudgetsDashboard";
import WeekGoalCard from "./(cards)/weekGoalsCard";
import DaysCard from "./(cards)/DaysCard";
import DevolutionsCard from "./(cards)/DevolutionCard";
import MonthGoalCard from "./(cards)/MonthGoalCard";

export default function DashboardClient({
  openBudgetClients,
  sellerKpis,
}: {
  openBudgetClients: OpenBudgetCard[];  
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
            <div className="mt-4 grid gap-3 lg:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 ">
             <MonthGoalCard
                monthly_meta={kpi.goal_meta}
                monthly_realized={kpi.net_sales}
                monthly_pct_achieved={kpi.pct_achieved}
              />

              <DaysCard                 
                workdaysInMonth={kpi.business_days_month}
                workdaysElapsed={kpi.business_days_elapsed}
                workdaysRemaining={kpi.business_days_remaining} />

              <DevolutionsCard
                devolucoes={kpi.total_returns_value}
                taxaDev={kpi.return_rate_pct}
                devolutionCount={kpi.total_returns_count}
              />

              <WeekGoalCard
                weekly_meta={kpi.weekly_meta}
                weekly_realized={kpi.weekly_realized}
                weekly_pct_achieved={kpi.weekly_pct_achieved}
                weekly_missing_value={kpi.weekly_missing_value}
                weekly_bonus={kpi.weekly_bonus}
              />
 


            </div>
          )}
        </div>

        <OpenBudgetsDashboard clients={openBudgetClients} />
      </div>
    </div>
  );
}
