"use client";

import { useMemo, useState } from "react";
import type { ClienteComContatos, ContatoRow } from "@/types/crm";
import { parseLooseDate, daysSince, formatLocalShort } from "@/lib/dates";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import ContactPickerModal from "./ContactPickerModal";

type Props = {
  client: ClienteComContatos;
  variant: "todo" | "done";
  onMarkDone: () => void;
};

export default function ClientCard({ client, variant, onMarkDone }: Props) {
  const [open, setOpen] = useState(false);

  const lastBuy = useMemo(() => parseLooseDate(client.ultima_compra), [client.ultima_compra]);
  const d = useMemo(() => daysSince(lastBuy), [lastBuy]);

  const lastInteraction = client.ultima_interacao ? new Date(client.ultima_interacao) : null;

  const msg = useMemo(() => {
    const nome = client.Cliente?.trim() || "tudo bem?";
    return `Oi, ${nome}! Passando pra ver como vocês estão e se posso te ajudar com um novo pedido 😊`;
  }, [client.Cliente]);

  function handleSend() {
    const contatos = (client.contatos || []).filter((c) => c.telefone);

    if (contatos.length <= 0) return; // sem telefone
    if (contatos.length === 1) {
      window.open(buildWhatsAppLink(contatos[0].telefone!, msg), "_blank");
      return;
    }
    setOpen(true);
  }

  function pickContact(c: ContatoRow) {
    if (!c.telefone) return;
    window.open(buildWhatsAppLink(c.telefone, msg), "_blank");
    setOpen(false);
  }

  const hasPhone = (client.contatos || []).some((c) => !!c.telefone);

  return (
    <div
      className={[
        "rounded-2xl border p-4 shadow-sm transition bg-white",
        variant === "todo" ? "border-gray-200 hover:shadow-md" : "border-emerald-200 bg-emerald-50/40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{client.Cliente}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {client.Cidade} • Limite: {client.Limite}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
              Sem comprar: {d === null ? "—" : `${d} dias`}
            </span>
            {lastInteraction && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                Último contato: {formatLocalShort(lastInteraction)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onMarkDone}
          className={[
            "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition",
            variant === "todo"
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-emerald-600 text-white hover:bg-emerald-500",
          ].join(" ")}
        >
          {variant === "todo" ? "Marcar feito" : "Feito ✓"}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSend}
          disabled={!hasPhone}
          className={[
            "flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition",
            hasPhone
              ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed",
          ].join(" ")}
        >
          Enviar mensagem
        </button>

        <button
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          onClick={() => alert("Depois podemos abrir uma mini-ficha do cliente aqui.")}
        >
          Ver
        </button>
      </div>

      <ContactPickerModal
        open={open}
        onClose={() => setOpen(false)}
        clientName={client.Cliente}
        contacts={client.contatos || []}
        onPick={pickContact}
      />
    </div>
  );
}
