"use client";

import { useMemo, useState } from "react";
import type { ClienteComContatos } from "@/types/crm";
import FollowupList from "./FollowupList";
import { parseLooseDate, daysSince } from "@/lib/dates";

type Props = {
  clients: ClienteComContatos[];
};

export default function FollowUp({ clients }: Props) {
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const s = search.trim().toLowerCase();

    // Regra da Página 2 (Acompanhamento):
    // - já teve interação (ultima_interacao existe)
    // - mas não tem compra recente (ultima_compra muito antiga / null)
    // Vou usar: "interagiu nos últimos 30 dias" e "não comprou nos últimos 30 dias"
    const out = clients.filter((c) => {
      const inter = c.ultima_interacao ? new Date(c.ultima_interacao) : null;
      if (!inter) return false;

      const daysInter = daysSince(inter);
      if (daysInter === null || daysInter > 30) return false;

      const buy = parseLooseDate(c.ultima_compra);
      const daysBuy = daysSince(buy);

      const notBoughtRecently = daysBuy === null || daysBuy > 30;

      const matches =
        !s ||
        c.Cliente.toLowerCase().includes(s) ||
        c.Cidade.toLowerCase().includes(s);

      return notBoughtRecently && matches;
    });

    out.sort((a, b) => {
      const ai = a.ultima_interacao ? new Date(a.ultima_interacao).getTime() : 0;
      const bi = b.ultima_interacao ? new Date(b.ultima_interacao).getTime() : 0;
      return bi - ai;
    });

    return out;
  }, [clients, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Acompanhamento</h1>
            <p className="text-sm text-gray-500">
              Clientes contatados recentemente, mas ainda sem compra recente.
            </p>
          </div>

          <div className="w-full md:w-80">
            <label className="text-xs font-semibold text-gray-600">Buscar</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome do cliente ou cidade…"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <FollowupList clients={list} />
      </div>
    </div>
  );
}
