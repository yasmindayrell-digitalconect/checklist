// components/history/HistoryClient.tsx
"use client";

import { useState, useMemo } from "react";
import HistoryFilters from "./HistoryFilters";
import HistoryTable from "./HistoryTable";
import QueuePanel from "./QueuePanel";
import type { HistoryRow, QueueRow } from "./types";

type Props = {
  history: HistoryRow[];
  queue: QueueRow[];
};

export default function HistoryClient({ history, queue }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // filtra apenas histórico (envios), não a fila
  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return history.filter((row) => {
      const clientName = row.clientes?.Cliente?.toLowerCase() || "";
      const title = row.mensagens?.titulo?.toLowerCase() || "";
      const phone = row.to_phone || "";

      const matchesSearch =
        clientName.includes(s) || phone.includes(s) || title.includes(s);

      const matchesStatus = statusFilter
        ? row.status_entrega === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [history, search, statusFilter]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#e6e8ef] px-4 py-6 md:px-8 md:py-1">
      <div className="max-w-8xl mx-auto my-auto">
        <div className="rounded-2xl p-4 md:p-6 flex flex-col gap-6">
          <HistoryFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* layout principal: fila à esquerda, histórico à direita */}
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-80">
              <QueuePanel queue={queue} />
            </div>

            <div className="flex-1">
              <HistoryTable rows={filtered} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
