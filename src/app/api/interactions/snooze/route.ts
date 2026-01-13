import { NextResponse } from "next/server";
import { radarPool } from "@/lib/Db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const clienteId = Number(body?.id_cliente);
  const days = Number(body?.days);

  if (!clienteId || ![7, 15, 30].includes(days)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const sql = `
      INSERT INTO public.crm_interacoes_radar (cliente_id, snooze_until)
      VALUES ($1, NOW() + ($2::int * INTERVAL '1 day'))
      ON CONFLICT (cliente_id)
      DO UPDATE SET snooze_until = EXCLUDED.snooze_until
      RETURNING cliente_id, snooze_until;
    `;

    const r = await radarPool.query(sql, [clienteId, days]);
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e: any) {
    console.error("snooze error:", e?.message, e);
    return NextResponse.json({ error: "db_error", details: e?.message }, { status: 500 });
  }
}
