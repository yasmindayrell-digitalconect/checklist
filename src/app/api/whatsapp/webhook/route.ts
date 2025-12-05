import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mapWaStatus = (wa: string) => {
  switch (wa) {
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
      return "failed";
    case "deleted":
      return "deleted";
    default:
      return wa;
  }
};

/**
 * Normaliza telefone para os últimos 8 dígitos do número.
 */
const normalizePhone = (input?: string | null): string => {
  if (!input) return "";

  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (digits.length <= 8) {
    return digits;
  }

  return digits.slice(-8);
};

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let body: any = null;

    try {
      body = JSON.parse(raw);
    } catch {
      // se não for JSON válido, body fica null mas ainda logamos o raw
    }

    const preview = (() => {
      try {
        return JSON.stringify(body?.entry?.[0]?.changes?.[0]?.value, null, 2);
      } catch {
        return raw?.slice(0, 500);
      }
    })();

    console.log("[webhook] value preview:", preview);

    await supabaseAdmin.from("webhook_logs").insert([{ raw: body }]);

    const changes = (body?.entry ?? [])
      .flatMap((e: any) => e?.changes ?? [])
      .map((c: any) => c?.value)
      .filter(Boolean);

    // 1) Mensagens recebidas (cliente -> você)
    for (const v of changes) {
      const msgs = v?.messages ?? [];

      for (const msg of msgs) {
        const fromNorm = normalizePhone(msg?.from);

        const ts = msg?.timestamp
          ? new Date(parseInt(msg.timestamp, 10) * 1000).toISOString()
          : new Date().toISOString();

        if (!fromNorm) continue;

        console.log("[webhook] from =", msg?.from, "→ normalized =", fromNorm);

        const { data, error: qErr } = await supabaseAdmin
          .from("contatos_cliente")
          .select("id_cliente, telefone")
          .not("telefone", "is", null);

        if (qErr) {
          console.error("Erro buscando contatos em contatos_cliente:", qErr);
          continue;
        }

        // DEBUG: mostra alguns telefones normalizados do banco
        const debugSample = (data ?? [])
          .slice(0, 10)
          .map((c: any) => ({
            id_cliente: c.id_cliente,
            telefone_raw: c.telefone,
            telefone_norm: normalizePhone(c.telefone),
          }));

        console.log("[webhook] sample contatos normalizados:", debugSample);

        const contato =
          data?.find(
            (c: any) => normalizePhone(c.telefone) === fromNorm
          ) ?? null;

        if (contato?.id_cliente) {
          const { error: upErr } = await supabaseAdmin
            .from("clientes")
            .update({ ultima_interacao: ts })
            .eq("id_cliente", contato.id_cliente);

          if (upErr) {
            console.error(
              "❌ Falha ao atualizar ultima_interacao em clientes:",
              upErr
            );
          } else {
            console.log(
              `✅ ultima_interacao atualizada para cliente ${contato.id_cliente} (${fromNorm}): ${ts}`
            );
          }
        } else {
          console.warn(
            `⚠️ Cliente não encontrado para telefone normalizado=${fromNorm}.`
          );
        }
      }
    }

    // 2) Statuses (mensagens enviadas por você)
    for (const v of changes) {
      const statuses = v?.statuses ?? [];

      for (const st of statuses) {
        const waMessageId = st?.id;
        const status = mapWaStatus(st?.status);

        if (!waMessageId || !status) continue;

        const { error: upErr } = await supabaseAdmin
          .from("envios")
          .update({ status_entrega: status })
          .eq("wa_message_id", waMessageId);

        if (upErr) {
          console.error("❌ Falha ao atualizar status_entrega em envios:", upErr);
        } else {
          console.log(
            `✅ envios.status_entrega = ${status} para wa_message_id=${waMessageId}`
          );
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[whatsapp webhook] error:", e?.message || e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
