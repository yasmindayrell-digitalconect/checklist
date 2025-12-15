// app/api/send_message/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizePhone = (input?: string | null): string => {
  if (!input) return "";

  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("55")) digits = digits.slice(2);
  if (digits.length < 10) return "";

  const ddd = digits.slice(0, 2);
  let rest = digits.slice(2);

  if (rest.length === 9 && rest.startsWith("9")) {
    rest = rest.slice(1);
  }

  if (rest.length !== 8) {
    console.warn("normalizePhone: Número inesperado", input, digits);
    return "";
  }

  return `55${ddd}${rest}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawTo = body.to ?? "";
    const to = normalizePhone(String(rawTo));

    const id_cliente = Number(body.clientId) || null;
    const id_mensagem = Number(body.messageId) || null;
    const variables = Array.isArray(body.variables)
      ? body.variables.map(String)
      : [];

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Campo 'to' vazio ou inválido." },
        { status: 400 }
      );
    }

    if (!id_cliente || !id_mensagem) {
      return NextResponse.json(
        { success: false, error: "clientId e messageId são obrigatórios." },
        { status: 400 }
      );
    }

    // checa se cliente está ativo
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("clientes")
      .select("ativo")
      .eq("id_cliente", id_cliente)
      .single();

    if (clienteError || !cliente) {
      console.error("[send_message] Client not found:", clienteError);
      return NextResponse.json(
        { success: false, error: "Client not found." },
        { status: 404 }
      );
    }

    if (cliente.ativo === false) {
      const today = new Date().toISOString().slice(0, 10);
      const dedupe_key = `${id_mensagem}:${to}:${today}`;

      await supabaseAdmin.from("envios").insert([
        {
          id_cliente,
          id_mensagem,
          data_envio: today,
          status_entrega: "blocked_inactive",
          wa_message_id: null,
          to_phone: to,
          dedupe_key,
          error_message: JSON.stringify({
            error: "Client is inactive and cannot receive messages.",
          }),
        },
      ]);

      return NextResponse.json(
        { success: false, error: "Client is inactive and cannot receive messages." },
        { status: 400 }
      );
    }

    // ✅ dedupe por dia + template + telefone
    const today = new Date().toISOString().slice(0, 10);
    const dedupe_key = `${id_mensagem}:${to}:${today}`;

    const { error } = await supabaseAdmin.from("fila_envio").insert([
      {
        id_cliente,
        id_mensagem,
        to_phone: to,
        payload_raw: { variables },
        dedupe_key,
      },
    ]);

    if (error) {
      // 👇 Postgres unique violation
      if ((error as any).code === "23505") {
        return NextResponse.json(
          {
            success: true,
            queued: false,
            duplicate: true,
            message: "Já existe um envio enfileirado para este número (hoje) com essa mensagem.",
          },
          { status: 200 }
        );
      }

      console.error("[queue] Queue insert error:", error);
      return NextResponse.json(
        { success: false, error: "Queue insert failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        queued: true,
        message: "Message added to queue and will be processed soon.",
      },
      { status: 202 }
    );
  } catch (err: any) {
    console.error("[queue] Unexpected error in /send_message:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
