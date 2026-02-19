import type { OpenBudgetCard } from "@/types/dashboard";
import type { PhoneOption } from "@/types/dashboard";

export function buildMessage() {
  return `Oi! Passando pra ver como você está e se posso te ajudar com um novo pedido 😊`;
}

export function daysUntil(date: Date | null) {
  if (!date) return null;

  // normaliza "hoje" e "validade" pra meia-noite local
  const today = new Date();
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const d = new Date(date);
  const d1 = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = d1.getTime() - d0.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}


export function uniquePhonesFromClient(client: OpenBudgetCard): PhoneOption[] {
  const contacts = client.contatos ?? [];
  const seen = new Set<string>();
  const out: PhoneOption[] = [];

  for (const c of contacts) {
    const phone = (c.telefone ?? "").trim();
    if (!phone) continue;

    const key = phone.replace(/\D/g, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);

    out.push({
      id: String(c.id_contato),
      name: (c.nome_contato ?? "").trim() || "Contato",
      role: (c.funcao ?? "").trim() || null,
      phone,
    });
  }

  return out;
}

export function getAccentColor(daysLeft: string | null) {
  // ✅ ajuste fácil aqui:
  // overdue -> amarelo
  // vence em até 3 dias -> laranja
  // ok -> verde
  return "#80ef80";
}