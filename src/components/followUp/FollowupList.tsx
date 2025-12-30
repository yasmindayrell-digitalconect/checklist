"use client";

import type { ClienteComContatos } from "@/types/crm";
import ClientCard from "@/components/home/ClientCard";

export default function FollowupList({ clients }: { clients: ClienteComContatos[] }) {
  return (
    <div className="space-y-3">
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Nenhum cliente para acompanhamento agora.
        </div>
      ) : (
        clients.map((c) => (
          <ClientCard
            key={c.id_cliente}
            client={c}
            variant="todo"
            onPrimary={() => alert("Aqui podemos registrar nova interação também.")}
          />
        ))
      )}
    </div>
  );
}

