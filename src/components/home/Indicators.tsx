"use client";

import { useMemo } from "react";
import type { ClienteComContatos } from "@/types/crm";
import { parseLooseDate } from "@/lib/dates";
import { Users, TrendingUp, MessageCircle, Receipt, Target } from "lucide-react";

type Props = {
  needs: ClienteComContatos[];
  contacted: ClienteComContatos[];
  ok: ClienteComContatos[];
};

function isSameMonth(d: Date, ref: Date) {
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function lastDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function daysRemainingInMonthInclusive(d: Date) {
  const end = lastDayOfMonth(d);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inclui hoje
}


function isBusinessDay(d: Date) {
  const day = d.getDay(); // 0 dom .. 6 sab
  return day !== 0 && day !== 6;
}

function businessDaysRemainingInMonthInclusive(from: Date) {
  const end = lastDayOfMonth(from);
  let count = 0;

  // começa no início do "dia" pra não dar bug de horário
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  while (cursor <= end) {
    if (isBusinessDay(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

function IndicatorCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#495057]">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-[#212529]">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-[#868E96] truncate">{subtitle}</p>}
        </div>

        <div className="shrink-0 rounded-xl bg-gray-50 p-2 ring-1 ring-inset ring-gray-200 text-[#495057]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Indicators({ needs, contacted, ok }: Props) {
  const allClients = useMemo(() => [...needs, ...contacted, ...ok], [needs, contacted, ok]);

  const totalCarteira = allClients.length;

  const vendidosNoMes = useMemo(() => {
    const now = new Date();
    let count = 0;
    for (const c of allClients) {
      const d = parseLooseDate((c as any).ultima_compra);
      if (d && isSameMonth(d, now)) count += 1;
    }
    return count;
  }, [allClients]);

  const positivacaoPct = useMemo(() => {
    if (totalCarteira === 0) return 0;
    return Math.round((vendidosNoMes / totalCarteira) * 100);
  }, [vendidosNoMes, totalCarteira]);

  const clientesParaMensagem = needs.length;

  // Placeholder (quando você tiver o dado, troca aqui)
  const orcamentosAbertos: number | null = null;

  // ✅ Meta 80%
  const metaPct = 80;
  const meta80 = useMemo(() => Math.ceil(totalCarteira * (metaPct / 100)), [totalCarteira]);
  const faltamPara80 = useMemo(() => Math.max(0, meta80 - vendidosNoMes), [meta80, vendidosNoMes]);

  const diasRestantes = useMemo(() => daysRemainingInMonthInclusive(new Date()), []);
  const porDia = useMemo(() => {
    if (faltamPara80 <= 0) return 0;
    return Math.ceil(faltamPara80 / Math.max(1, diasRestantes));
  }, [faltamPara80, diasRestantes]);

  const diasUteisRestantes = useMemo(
    () => businessDaysRemainingInMonthInclusive(new Date()),
    []
    );

    const porDiaUtil = useMemo(() => {
        if (faltamPara80 <= 0) return 0;
        return Math.ceil(faltamPara80 / Math.max(1, diasUteisRestantes));
    }, [faltamPara80, diasUteisRestantes]);


  return (
    <div className="grid gap-4 mb-6 grid-cols-[repeat(auto-fit,minmax(225px,1fr))]">
      {/* 1) Total carteira */}
      <IndicatorCard
        title="Total na carteira"
        value={String(totalCarteira)}
        subtitle="Todos clientes no painel"
        icon={<Users size={18} />}
      />

      {/* 2) Positivação do mês */}
      <IndicatorCard
        title="Positivação do mês"
        value={`${positivacaoPct}%`}
        subtitle={`${vendidosNoMes} vendas no mês`}
        icon={<TrendingUp size={18} />}
      />

      {/* 3) Clientes para mandar mensagem */}
      <IndicatorCard
        title="Precisa mandar mensagem"
        value={String(clientesParaMensagem)}
        subtitle="Próx. contato hoje/atrasado"
        icon={<MessageCircle size={18} />}
      />

      {/* 4) Orçamentos em aberto (placeholder) */}
      <IndicatorCard
        title="Orçamentos em aberto"
        value={orcamentosAbertos === null ? "—" : String(orcamentosAbertos)}
        subtitle="Em breve"
        icon={<Receipt size={18} />}
      />

      {/* 5) Meta 80% */}
      <IndicatorCard
        title="Vendas para atingir 80%"
        value={faltamPara80 <= 0 ? "Atingida 🎉" : `${faltamPara80}`}
        subtitle="N° de vendas"
        icon={<Target size={18} />}
      />

      {/* 6) Ritmo necessário (dias úteis) */}
        <IndicatorCard
        title="Vendas por dia"
        value={faltamPara80 <= 0 ? "—" : `${porDiaUtil}/dia`}
        subtitle={
            faltamPara80 <= 0
            ? "Meta já atingida 🎉"
            : `${diasUteisRestantes} dias úteis restantes`
        }
        icon={<Target size={18} />}
        />

    </div>
  );
}