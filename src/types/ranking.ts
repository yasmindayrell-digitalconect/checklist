export type RankingSellerRow = {
  seller_id: number;
  seller_name: string | null;

  // mensal
  goal_meta: number;
  net_sales: number;
  pct_achieved: number;

  // semanal
  weekly_meta: number;
  weekly_realized: number;
  weekly_pct_achieved: number;
  weekly_missing_value: number;
  weekly_bonus: number;

  wallet_total: number;            // total de clientes na carteira
  wallet_positive_month: number;   // clientes positivados no mês (compraram no mês)
  wallet_positive_pct: number;     // % positivação
  need_message: number;            // precisa mandar mensagem
  follow_up: number;               // acompanhar
  open_budgets: number;   
};

export type BranchRow = {
  empresa_id: number;
  name: string;
  goal: number;
  realized: number;
  pct: number;
  realized_today: number; // <- novo
};