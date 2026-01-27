"use client";

import { useMemo, useState } from "react";
import type { OpenBudgetCard } from "@/types/dashboard";
import { parseLooseDate, formatLocalVeryShort } from "@/lib/dates";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import PhonePickerModal from "@/components/home/PhonePickerModal";

type Props = {
  client: OpenBudgetCard;
};

function buildMessage() {
  return `Oi! Passando pra ver como você está e se posso te ajudar com um novo pedido 😊`;
}

type PhoneOption = {
  id: string;
  nome: string;
  funcao: string | null;
  phone: string;
};

function daysUntil(date: Date | null) {
  if (!date) return null;
  const today = new Date();
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = d1.getTime() - d0.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function DashboardClientCard({ client }: Props) {
  const [open, setOpen] = useState(false);

  // 🎨 cor pela carteira
  const ui = useMemo(() => {
    if (client.is_carteira) {
      // carteira = verde
      return {
        stripe: "border-l-[#80ef80]",
        dot: "bg-[#80ef80]",
        btn: "bg-[#80ef80] hover:bg-[#5BD25B] text-white",
        badge: "bg-[#80ef80]/15 text-gray-700",
      };
    }
    // fora carteira = laranja/vermelho
    return {
        stripe: "border-l-[#80ef80]",
        dot: "bg-[#80ef80]",
        btn: "bg-[#80ef80] hover:bg-[#5BD25B] text-white",
        badge: "hidden",
    };
  }, [client.is_carteira]);

  const moneyFormatter = useMemo(
    () => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }),
    []
  );

  const validadeDate = useMemo(() => {
    const d = parseLooseDate(client.validade_orcamento_min as any);
    return d ?? null;
  }, [client.validade_orcamento_min]);

  const venceEm = useMemo(() => daysUntil(validadeDate), [validadeDate]);

  const phoneOptions: PhoneOption[] = useMemo(() => {
    const contatos = client.contatos ?? [];
    const opts: PhoneOption[] = [];

    for (const c of contatos) {
      const nome = (c.nome_contato ?? "").trim();
      const funcao = (c.funcao ?? "").trim();
      const phone = (c.telefone ?? "").trim();
      if (!phone) continue;

      opts.push({
        id: String(c.id_contato),
        nome: nome || "Contato",
        funcao: funcao || null,
        phone,
      });
    }

    // remove duplicados por número
    const seen = new Set<string>();
    return opts.filter((o) => {
      const key = o.phone.replace(/\D/g, "");
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [client.contatos]);

  const hasPhone = phoneOptions.length > 0;

  function handleSend() {
    if (!hasPhone) return;

    if (phoneOptions.length === 1) {
      const msg = buildMessage();
      window.open(buildWhatsAppLink(phoneOptions[0].phone, msg), "_blank");
      return;
    }

    setOpen(true);
  }

  function pickPhone(opt: PhoneOption) {
    const msg = buildMessage();
    window.open(buildWhatsAppLink(opt.phone, msg), "_blank");
    setOpen(false);
  }

  const badgeText = client.is_carteira ? "Carteira" : "Fora da carteira";

  return (
    <div
      className={[
        "rounded-2xl bg-white border border-[#E9ECEF]",
        "border-l-4",
        ui.stripe,
        "p-3 shadow-sm hover:shadow-md transition",
        "h-full flex flex-col", // ✅
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <span className={["mt-1.5 h-2.5 w-2.5 rounded-full", ui.dot].join(" ")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[#212529]">
              {client.id_cliente} {client.Cliente}
            </p>

            <span className={["shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold", ui.badge].join(" ")}>
              {badgeText}
            </span>
          </div>

          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#868E96]">
            <span className="truncate">
              {client.Cidade} • {client.Estado} • Limite: {moneyFormatter.format(client.Limite)}
            </span>

            {client.open_budget_id != null && (
              <span>• Pedido: {client.open_budget_id}</span>
            )}

            {validadeDate && (
              <span>
                • Validade: {formatLocalVeryShort(validadeDate)}
               
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-2 flex flex-wrap items-center gap-1">
        <button
          onClick={handleSend}
          disabled={!hasPhone}
          className={[
            "rounded-lg px-4 py-1.5 text-[11px] font-semibold transition",
            "ring-1 ring-inset",
            hasPhone ? ui.btn : "bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed",
          ].join(" ")}
        >
          Mensagem
        </button>
      </div>

      <PhonePickerModal
        open={open}
        onClose={() => setOpen(false)}
        clientName={client.Cliente}
        options={phoneOptions}
        onPick={pickPhone}
      />
    </div>
  );
}
