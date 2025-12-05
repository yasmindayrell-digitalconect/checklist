// app/api/send_message/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY = (process.env.DIALOG_API_KEY || "").trim();

// Logger enxuto
const log = {
  info: (...args: any[]) => console.log(`[send_message]`, ...args),
  warn: (...args: any[]) => console.warn(`[send_message] ⚠️`, ...args),
  error: (...args: any[]) => console.error(`[send_message] ❌`, ...args),

  compact(obj: any) {
    try {
      const str = JSON.stringify(obj);
      return str.length > 250 ? str.slice(0, 250) + "..." : str;
    } catch {
      return obj;
    }
  },
};

export async function POST(req: Request) {
  // --- NORMALIZADOR DE TELEFONE ---
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
      log.warn("normalizePhone: Número inesperado", input, digits);
      return "";
    }

    return `55${ddd}${rest}`;
  };

  const requestId = Date.now().toString(36);

  log.info(`HIT`, { requestId });

  if (!API_KEY) {
    log.error("FALTA DIALOG_API_KEY no ambiente");
    return NextResponse.json(
      { success: false, error: "Missing API key" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    const rawTo = body.to ?? "";
    let to = String(rawTo).replace(/\D/g, "");
    to = normalizePhone(to);

    const message = body.message;
    const clientId = body.clientId ? Number(body.clientId) : null;
    const messageId = body.messageId ? Number(body.messageId) : null;

    log.info("Payload recebido", {
      rawTo,
      normalized: to,
      preview: typeof message === "string" ? message.slice(0, 60) + "..." : null,
      clientId,
      messageId,
    });

    if (!to) {
      log.warn("Campo 'to' vazio após normalização");
      return NextResponse.json(
        { success: false, error: "Campo 'to' vazio" },
        { status: 400 }
      );
    }
    if (!message) {
      log.warn("Campo 'message' vazio");
      return NextResponse.json(
        { success: false, error: "Campo 'message' vazio" },
        { status: 400 }
      );
    }

    const waPayload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };

    log.info("Enviando para 360dialog", {
      to,
      preview: message.slice(0, 60) + "...",
    });

    const resp = await fetch(
      "https://waba-sandbox.360dialog.io/v1/messages",
      {
        method: "POST",
        headers: {
          "D360-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(waPayload),
      }
    );

    const raw = await resp.text();
    let parsed: any = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    log.info("Resposta 360dialog", {
      status: resp.status,
      ok: resp.ok,
      body: log.compact(parsed),
    });

    const waMessageId = parsed?.messages?.[0]?.id ?? null;
    const status_entrega = resp.ok ? "sent" : "failed";
    const today = new Date().toISOString().slice(0, 10);

    log.info("Gravando no banco", {
      clientId,
      messageId,
      status_entrega,
      waMessageId,
    });

    const { error: dbErr } = await supabaseAdmin.from("envios").insert([
      {
        id_cliente: clientId,
        id_mensagem: messageId,
        data_envio: today,
        status_entrega,
        wa_message_id: waMessageId,
        to_phone: to,
        error_message: resp.ok ? null : parsed,
      },
    ]);

    if (dbErr) {
      log.error("Erro ao inserir envio", dbErr);
    } else {
      log.info(`Envio gravado com wa_message_id=${waMessageId}`);
    }

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, status: resp.status, data: parsed },
        { status: resp.status }
      );
    }

    return NextResponse.json(
      { success: true, data: parsed },
      { status: 200 }
    );
  } catch (err: any) {
    log.error("Erro inesperado:", err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
