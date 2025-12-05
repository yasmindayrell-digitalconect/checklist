// components/messages/types.ts
export interface Message {
  id_mensagem: string;
  titulo: string;
  texto: string;
  imagem?: string | null;
  categoria: "PROMOÇÃO" | "AVISO" | "NOVIDADE" | string;
  status: "pending" | "rejected" | "approved" | string;
}
