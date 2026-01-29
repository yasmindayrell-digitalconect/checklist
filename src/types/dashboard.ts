//types\dashboard.ts

export type Row = {
  // cliente
  cadastro_id: string | number;
  nome_razao_social: string | null;
  nome_fantasia: string | null;
  nome_cidade: string | null;
  estado_id: string | null;
  nome_vendedor: string | null;
  vendedor_id: string | number | null; // vendedor do CADASTRO (carteira)

  limite_credito_aprovado: number | null;
  cliente_ativo: string | null;

  // orçamento (1 linha por orçamento)
  orcamento_id: number | string;
  validade_orcamento_min: Date | null;

  // flag p/ UI
  is_carteira: boolean;

  contatos_json: Array<{
    id_contato: number;
    id_cliente: number;
    nome_contato: string | null;
    funcao: string | null;
    telefone: string | null;
    celular: string | null;
    criado_em: string | Date | null;
  }>;
};

export type ContatoRow = {
  id_contato: number;
  id_cliente: number;
  nome_contato: string;
  funcao: string | null;
  telefone: string | null;
  criado_em: string | null;
};

export type OpenBudgetCard = {
  id_cliente: number;
  Cliente: string;
  Razao_social: string;
  Cidade: string;
  Estado: string;
  Vendedor: string;

  Limite: number;

  telefone: string | null;
  tel_celular: string | null;

  id_vendedor: number | null;
  ativo: boolean;

  // por orçamento (1 linha)
  open_budget_id: number | null;
  validade_orcamento_min: string | null;

  contatos: ContatoRow[];

  // pintar card
  is_carteira: boolean;
};

// src/types/phone.ts
export type PhoneOption = {
  id: string;
  name: string;
  role: string | null;
  phone: string;
};

export type SellerKpiRow = {
  seller_id: number;
  seller_name: string | null;

  // calendário
  uteis_mes: number;
  corridos: number;
  restam: number;

  // vendas (nomes “novos”)
  gross_total: number;
  freight_total: number;
  operational_expense: number;
  system_total: number;
  net_sales: number;

  // devoluções / taxa
  devolucoes: number;
  taxa_dev: string; // "12.34%"

  // meta
  goal_meta: number;
  pct_achieved: number; // número (ex: 87.65)
  pct_ating: string;    // opcional "87.65%" se vc quiser mostrar como texto
};
