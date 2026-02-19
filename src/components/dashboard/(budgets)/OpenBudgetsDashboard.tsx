"use client";

import React, { useMemo } from "react";
import type { OpenBudgetCard } from "@/types/dashboard";
import OpenBudgetColumn from "@/components/dashboard/(budgets)/OpenBudgetColumn";

function normalizeStatus(s?: string | null) {
  const v = (s ?? "").trim();
  return v ? v : "Sem status";
}

export default function OpenBudgetsDashboard({ clients }: { clients: OpenBudgetCard[] }) {
  const columns = useMemo(() => {
    const map = new Map<string, OpenBudgetCard[]>();

    for (const c of clients) {
      const key = normalizeStatus((c as any).orcamento_status); // se seu type já tem, tira o "as any"
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }

    // ordenação: mais cheios primeiro, depois alfabético
    const entries = Array.from(map.entries());
    entries.sort(
      (a, b) =>
        b[1].length - a[1].length || a[0].localeCompare(b[0], "pt-BR")
    );

    return entries; // [ [status, clients[]], ... ]
  }, [clients]);

  return (
    <section className="rounded-2xl  bg-white border border-gray-100 shadow-lg">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#212529]">Orçamentos abertos</h2>
          <p className="text-xs text-[#495057]">Todos os orçamentos abertos do vendedor</p>
        </div>
        <div className="text-xs font-semibold text-[#495057]">{clients.length}</div>
      </div>

      <div className="p-3 sm:p-4">
        {clients.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-[#495057]">
            Nenhum orçamento aberto 🎉
          </div>
        ) : (
          <div className="top-hscroll light-scrollbar">
            <div className="top-hscroll__content flex gap-4 w-max">
              {columns.map(([status, list]) => (
                <OpenBudgetColumn key={status} status={status} clients={list} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
