export type WeekMetaItem = {
  label: string;        // "dd/mm — dd/mm"
  week_ini: string;     // ISO
  week_fim: string;     // ISO
  weekly_meta: number;  // R$
};

export type SellerGoalsRow = {
  seller_id: number;
  seller_name: string | null;

  monthly_meta: number;
  weekly_meta_month_accum: number;
  weekly_last3: WeekMetaItem[];

  // ✅ para editar a semana exibida (ref week = weekRefs[0])
  current_week_start: string; // ISO (yyyy-mm-dd ou ISO completo)
  current_week_end: string;   // ISO
  current_week_meta: number;  // valor atual no banco (ou 0)
};


export type GoalsHeaderData = {
  weekOffset: number;
  weekLabel: string;
  monthLabel: string;

  totalCompanyGoal: number;
  byBranch: Array<{
    empresa_id: number;
    name: string;
    goal: number;
    realized: number;
    pct: number;
  }>;



  totalWeeklyMetaMonth: number;

  totalMonthSold: number;
  totalMonthPct: number;
  totalMissing: number;
};