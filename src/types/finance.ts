/** =======================
 * Types (iguais ao server)
 * ======================= */

export type FinanceWeek = {
  key: string; // monday ISO (YYYY-MM-DD)
  mondayISO: string;
  fridayISO: string;
  label: string; // "dd/mm a dd/mm"
};

export type FinanceSellerWeek = {
  seller_id: number;
  week_mondayISO: string; // monday ISO
  weekly_meta: number;
  weekly_realized: number;
  weekly_pct_achieved: number;
  weekly_bonus_value: number;
};

export type FinanceSellerMonthly = {
  seller_id: number;
  seller_name: string | null;
  goal_meta: number;
  net_sales: number;
  pct_achieved: number;
  month_bonus_rate: number;
  month_bonus_value: number;
};

export type FinanceSellerWallet = {
  seller_id: number;
  wallet_total: number;
  wallet_positive_month: number;
  wallet_positive_pct: number;
  positivity_bonus_tier: "none" | "150" | "200" | "250";
  positivity_bonus_value: number;
};

export type FinanceSeller = {
  seller_id: number;
  seller_name: string | null;
  base_salary: number;
  monthly: FinanceSellerMonthly;
  wallet: FinanceSellerWallet;
  weeks: FinanceSellerWeek[];
};

export type FinanceBonusesPayload = {
  month: {
    ym: string; // YYYY-MM
    ano_mes: number;
    dt_iniISO: string;
    dt_fimISO: string;
    label: string; // "fevereiro de 2026"
  };
  weeks: FinanceWeek[];
  sellers: FinanceSeller[];
  rules: {
    positivity_threshold_pct: number;
    positivity_bonus_options: number[];
    weekly_bonus_rate: number;
    monthly_bonus_rate_100: number;
    monthly_bonus_rate_110: number;
  };
};
