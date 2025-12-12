// app/history/page.tsx
export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import HistoryClient from "@/components/history/HistoryClient";
import type { HistoryRow, QueueRow } from "@/components/history/types";

export default async function HistoryPage() {
  // carrega histórico de envios (já realizados)
  const { data: history, error: historyError } = await supabaseAdmin
    .from("envios")
    .select("*, clientes(Cliente), mensagens(titulo)")
    .order("created_at", { ascending: false });

  if (historyError) {
    console.error("❌ Error loading history:", historyError);
  }

  // carrega fila de envios (apenas pendentes ou processando)
  const { data: queue, error: queueError } = await supabaseAdmin
    .from("fila_envio")
    .select("*, clientes(Cliente), mensagens(titulo)")
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false });

  if (queueError) {
    console.error("❌ Error loading queue:", queueError);
  }

  return (
    <HistoryClient
      history={(history || []) as HistoryRow[]}
      queue={(queue || []) as QueueRow[]}
    />
  );
}
