"use client";

import React from "react";
import type { OpenBudgetCard } from "@/types/dashboard";
import ClientCard from "@/components/dashboard/(budgets)/ClientCard";
import { Client } from "pg";


function statusStyle(status: string) {
  const s = status.toUpperCase();

  const statusMap: Record<string, string> = {
    ENE: "Em negociação",
    ORC: "Orçamento sem acompanhamento",
    AAC: "Aguardando aprovação do cadastro",
    CNC: "Combinado novo contato",
    CNE: "Cliente não encontrado",
    
    CVL: "Combinado visita na loja",
    DVT: "Desistiu da venda temporariamente",
    DVD: "Desistiu da venda definitivamente",
    EIM: "Entrega impossibilitada",
    FOO: "Fechado em outro orçamento",
    FOV: "Fechado por outro vendedor",
    FPR: "Falta de produto",
    ORE: "Orçamento rejeito pelo cadastro",
    CCO: "Comprou no concorrente",
    OEX: "Orçamento Excluido",
    REC: "Venda recebida",
    VEN: "Venda fechada"
  };

  return statusMap[s] ?? "Status desconhecido";
}


export default function OpenBudgetColumn({
  status,
  clients,
}: {
  status: string;
  clients: OpenBudgetCard[];
}) {
  const tone = statusStyle(status);

  return (
    <div className="min-w-85 max-w-105 max-h-180 min-h-100 flex-1">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full flex flex-col overflow-auto">
        {/* header da coluna */}
        <div className="px-3 py-3 border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold  ${tone}`}>
                {statusStyle(status)}
              </span>
            </div>

            <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
              {clients.length}
            </span>
          </div>
        </div>

        {/* cards */}
        <div className="p-3 flex flex-col gap-3">
          {clients.map((c) => (
            <div
              key={`ob-${c.open_budget_id ?? "x"}-cli-${c.id_cliente}-${c.validade_orcamento_min ?? "no-date"}`}
              className="min-w-50 sm:min-w-80 max-w-105"
            >
              <ClientCard client={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
