"use client";

import { useMemo, useState } from "react";
import type { ClienteComContatos } from "@/types/crm";
import ChecklistBoard from "./ChecklistBoard";
import { parseLooseDate, daysSince, isInThisWeek, isSameLocalDay } from "@/lib/dates";

type Props = {
  clients: ClienteComContatos[];
};

export default function HomeClient({ clients }: Props) {
  const [localClients, setLocalClients] = useState(clients);

  const { todo, doneToday } = useMemo(() => {
    const now = new Date();

    const done: ClienteComContatos[] = [];
    const toDo: ClienteComContatos[] = [];

    for (const c of localClients) {
      const lastBuy = parseLooseDate(c.ultima_compra);
      const daysNoBuy = daysSince(lastBuy);

      const lastInteraction = c.ultima_interacao ? new Date(c.ultima_interacao) : null;

      const contactedThisWeek = lastInteraction ? isInThisWeek(lastInteraction) : false;
      const isDoneToday = lastInteraction ? isSameLocalDay(lastInteraction, now) : false;

      // Regras da HOME:
      // - mostra clientes que não compram há +30 dias
      // - e vendedor ainda não enviou mensagem essa semana (i.e. sem interação na semana)
      if (daysNoBuy !== null && daysNoBuy > 30 && !contactedThisWeek) {
        toDo.push(c);
      }

      // - mostra cards que ele já realizou hoje
      if (isDoneToday) done.push(c);
    }

    // Ordena: mais dias sem comprar primeiro
    toDo.sort((a, b) => {
      const da = daysSince(parseLooseDate(a.ultima_compra)) ?? -1;
      const db = daysSince(parseLooseDate(b.ultima_compra)) ?? -1;
      return db - da;
    });

    return { todo: toDo, doneToday: done };
  }, [localClients]);

  async function markDone(clientId: number) {
    // otimista: atualiza ultima_interacao localmente
    const nowIso = new Date().toISOString();
    setLocalClients((prev) =>
      prev.map((c) => (c.id_cliente === clientId ? { ...c, ultima_interacao: nowIso } : c))
    );

    // aqui depois vamos criar a API real (PUT /api/clientes/:id/ultima-interacao)
    // por enquanto deixo o fetch pronto:
    try {
      await fetch("/api/interactions/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: clientId }),
      });
    } catch {
      // se falhar, você pode reverter (opcional)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Checklist do dia</h1>
          <p className="text-sm text-gray-500">
            Clientes há +30 dias sem comprar e sem contato nesta semana.
          </p>
        </div>

        <ChecklistBoard todo={todo} doneToday={doneToday} onMarkDone={markDone} />
      </div>
    </div>
  );
}
