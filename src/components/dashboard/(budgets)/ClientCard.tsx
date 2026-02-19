"use client";

import { useMemo, useState } from "react";
import type { OpenBudgetCard } from "@/types/dashboard";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import PhonePickerModal from "@/components/dashboard/PhonePickerModal";
import type { PhoneOption } from "@/types/dashboard";
import {buildMessage, daysUntil, uniquePhonesFromClient,getAccentColor } from "../utils"
type Props = { client: OpenBudgetCard };



export default function DashboardClientCard({ client }: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);



  const accentColor = useMemo(() => getAccentColor(client.orcamento_status), [client.orcamento_status]);

  // contatos / whatsapp
  const phoneChoices = useMemo(() => uniquePhonesFromClient(client), [client]);
  const hasPhone = phoneChoices.length > 0;

  function openWhatsApp(phone: string) {
    window.open(buildWhatsAppLink(phone, buildMessage()), "_blank");
  }

  function handleSend() {
    if (!hasPhone) return;
    if (phoneChoices.length === 1) return openWhatsApp(phoneChoices[0].phone);
    setIsPickerOpen(true);
  }

  function handlePickPhone(opt: PhoneOption) {
    openWhatsApp(opt.phone);
    setIsPickerOpen(false);
  }

  const moneyBRL = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
    []
  );


  return (
    <div
      className={[
        "rounded-2xl bg-white border border-[#E9ECEF] border-l-4",
        "p-3 shadow-sm hover:shadow-md transition",
        "h-full flex flex-col",
      ].join(" ")}
      style={{ borderLeftColor: accentColor }}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[#212529]">
              {client.id_cliente} {client.Razao_social}
            </p>

          </div>
          

          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#868E96]">
            <span className="truncate">
              {client.Cidade} • {client.Estado} • Limite:{moneyBRL.format(client.Limite)}
            </span>

            {client.open_budget_id != null && (
              <span>• Orçamento: {client.open_budget_id}</span>
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
            hasPhone
              ? "text-white"
              : "bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed",
          ].join(" ")}
          style={hasPhone ? { backgroundColor: accentColor } : undefined}
        >
          Mensagem
        </button>
      </div>

      <PhonePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        clientName={client.Cliente}
        options={phoneChoices}
        onPick={handlePickPhone}
      />
    </div>
  );
}
