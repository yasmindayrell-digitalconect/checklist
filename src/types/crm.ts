//types\crm.ts

export type ClienteRow = {
  id_cliente: number;
  Cliente: string;
  Razao_social: string;
  Cidade: string;
  Vendedor: string;
  Limite: number;
  ultima_compra: string | null; // text no banco
  ultima_interacao: string | null; // ISO string (timestamp tz)
  id_vendedor: number | null;
  ativo: boolean;
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
