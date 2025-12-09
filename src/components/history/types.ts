// components/history/types.ts

// Linha do histórico de envios (tabela envios)
export type HistoryRow = {
  id_envio: number;
  id_cliente: number;
  id_mensagem: number | null;
  data_envio: string; // date ou iso
  status_entrega: string | null;
  wa_message_id: string | null;
  to_phone: string | null;
  created_at: string | null;
  error_message: string | null;
  clientes?: {
    Cliente: string; // nome do cliente na tabela clientes
  } | null;
  mensagens?: {
    titulo: string;
  } | null;
};

// Item da fila (tabela fila_envio)
export type QueueRow = {
  id_fila: number;
  id_cliente: number;
  id_mensagem: number;
  to_phone: string;
  payload_raw: any;
  status: string; // pending, processing, done, failed
  tentativas: number;
  last_attempt_at: string | null;
  created_at: string | null;
  clientes?: {
    Cliente: string;
  } | null;
  mensagens?: {
    titulo: string;
  } | null;
};
