// components/history/HistoryItem.tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { HistoryRow } from "./types";

const statusMap: Record<string, string> = {
  sent: "enviado",
  delivered: "entregue",
  read: "lido",
  failed: "falhou",
};

function StatusPill({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const map: Record<string, string> = {
    failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
    delivered: "bg-green-50 text-green-700 ring-1 ring-green-200",
    read: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    sent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };

  const cls = map[status] ?? "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  const translated = statusMap[status] ?? status;

  return <span className={`${base} ${cls}`}>{translated}</span>;
}

type Props = {
  row: HistoryRow;
};

export default function HistoryItem({ row }: Props) {
  const raw = row.created_at || row.data_envio; // prioriza timestamp real

  let hora = "—";
  if (row.created_at) {
    // timestamp → pode mostrar hora
    const d = new Date(row.created_at);
    hora = format(d, "dd/MM HH:mm", { locale: ptBR });
  } else if (row.data_envio) {
    // date-only → NÃO mostra HH:mm
    const d = new Date(`${row.data_envio}T00:00:00`);
    hora = format(d, "dd/MM", { locale: ptBR });
  }

  const clientName = row.clientes?.Cliente || "—";
  const title = row.mensagens?.titulo || "—";

  return (
    <li className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-700 truncate">
            {clientName}
          </div>
          <div className="mt-0.5 text-[12px] text-slate-500">
            {row.to_phone}
          </div>
        </div>

        {row.status_entrega && <StatusPill status={row.status_entrega} />}
      </div>

      <div className="mt-2 text-[12px] text-slate-600">
        <span className="font-medium">{title}</span>
      </div>

      <div className="mt-1 text-[11px] text-slate-500">{hora}</div>
    </li>
  );
}
