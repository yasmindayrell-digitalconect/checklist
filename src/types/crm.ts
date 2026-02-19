// types/crm.ts



export type ClienteRow = {
  id_cliente: number;
  Cliente: string;
  Razao_social: string;
  Cidade: string;
  Estado: string | null;
  Vendedor: string;
  Limite: number;

  ultima_compra: string | null;   
  last_sale_orcamento_id: number | null;        // ISO string
  ultima_interacao: string | null;         // ISO string
  proxima_interacao: string | null;    // ISO string (anterior)
  observacoes: string | null;
  can_undo: boolean;                       // se pode desfazer hoje

  id_vendedor: number | null;
  ativo: boolean;
  telefone?: string | null;
  tel_celular?: string | null;
  orcamentos_abertos: number;
  validade_orcamento_min: string | null; // ISO
  tem_orcamento_aberto?: boolean; // ✅ adiciona isso
  open_budget_id?: number | null; // ✅ novo
};

export type ContatoRow = {
  id_contato: number;
  id_cliente: number;
  nome_contato: string;
  funcao: string | null;
  telefone: string | null;
  criado_em: string | null;
};

export type ClienteComContatos = ClienteRow & {
  contatos: ContatoRow[];
};

export type RadarJoinedRow = {
  cadastro_id: string | number;
  nome_razao_social: string | null;
  nome_fantasia: string | null;
  nome_cidade: string | null;
  estado_id: string | null;
  nome_bairro: string | null; // ✅ ADICIONAR
  nome_vendedor: string | null;
  vendedor_id: string | number | null;
  limite_credito_aprovado: number | null;
  cliente_ativo: string | null;

  ultima_interacao: Date | null;
  proxima_interacao: Date | null;
  observacoes: string | null;

  can_undo: boolean | null;
  ultima_compra: Date | null;
  last_sale_orcamento_id: number | null;

  orcamentos_abertos: number;
  validade_orcamento_min: Date | null;
  tem_orcamento_aberto: boolean | "t" | "f" | 1 | 0;

  open_budget_id: string | number | null; // ✅ pode ser null e pode vir bigint/string
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