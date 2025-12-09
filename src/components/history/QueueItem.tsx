// components/history/QueueItem.tsx
"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QueueRow } from "./types";

function QueueStatusPill({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium";
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
    done: "bg-green-50 text-green-700 ring-1 ring-green-200",
  };

  const labelMap: Record<string, string> = {
    pending: "pendente",
    processing: "processando",
    failed: "falhou",
    done: "concluído",
  };

  const cls = map[status] ?? "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  const label = labelMap[status] ?? status;

  return <span className={`${base} ${cls}`}>{label}</span>;
}

type Props = {
  row: QueueRow;
};

export default function QueueItem({ row }: Props) {
  // usa last_attempt_at se existir, senão created_at
  const ts = row.last_attempt_at || row.created_at;
  const when = ts
    ? formatDistanceToNow(parseISO(ts), { addSuffix: true, locale: ptBR })
    : "—";

  const clientName = row.clientes?.Cliente || "—";
  const title = row.mensagens?.titulo || "—";

  return (
    <li className="rounded-lg border border-slate-200 p-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-slate-700 truncate">
            {clientName}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {row.to_phone}
          </div>
        </div>
        <QueueStatusPill status={row.status} />
      </div>

      <div className="mt-1 text-[11px] text-slate-600 truncate">
        {title}
      </div>

      <div className="mt-1 text-[10px] text-slate-500">
        Atualizado {when}
      </div>
    </li>
  );
}
