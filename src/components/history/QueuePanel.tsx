// components/history/QueuePanel.tsx
"use client";

import QueueItem from "./QueueItem";
import type { QueueRow } from "./types";

type Props = {
  queue: QueueRow[];
};

export default function QueuePanel({ queue }: Props) {
  // separa pendentes e processando
  const pending = queue.filter((q) => q.status === "pending");
  const processing = queue.filter((q) => q.status === "processing");

  const total = queue.length;

  return (
    <section className="flex flex-col rounded-xl bg-white shadow-md p-4 max-h-[65vh]">
      {/* Cabeçalho do painel de fila */}
      <header className="mb-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Fila de envios
          </h3>
          <p className="text-[11px] text-slate-500">
            Mensagens aguardando envio ou em processamento.
          </p>
        </div>
        <span className="text-xs text-slate-500">{total}</span>
      </header>

      {total === 0 ? (
        <p className="text-sm text-slate-400 italic">
          Nenhum item na fila no momento.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 light-scrollbar space-y-3">
          {processing.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-600 mb-1">
                Processando
              </h4>
              <ul className="space-y-2">
                {processing.map((q) => (
                  <QueueItem key={q.id_fila} row={q} />
                ))}
              </ul>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-slate-600 mb-1">
                Pendentes
              </h4>
              <ul className="space-y-2">
                {pending.map((q) => (
                  <QueueItem key={q.id_fila} row={q} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
