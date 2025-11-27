// import { NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabaseAdmin";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const mapWaStatus = (wa?: string) =>
//   ["sent","delivered","read","failed","deleted"].includes(wa || "") ? wa : wa;

// export async function POST() {
//   const { data: logs, error } = await supabaseAdmin
//     .from("webhook_logs")
//     .select("id, raw")
//     .order("created_at", { ascending: true });

//   if (error) return NextResponse.json({ ok:false, error }, { status:500 });

//   let updated = 0;

//   for (const log of logs ?? []) {
//     const body:any = log.raw;
//     const changes = (body?.entry ?? [])
//       .flatMap((e:any) => e?.changes ?? [])
//       .map((c:any) => c?.value)
//       .filter(Boolean);

//     for (const v of changes) {
//       const statuses = v?.statuses ?? [];
//       for (const st of statuses) {
//         const id = st?.id;                // wa_message_id
//         const status = mapWaStatus(st?.status);
//         if (!id || !status) continue;

//         const { error: upErr } = await supabaseAdmin
//           .from("envios")
//           .update({ status_entrega: status })
//           .eq("wa_message_id", id);

//         if (!upErr) updated++;
//       }
//     }
//   }

//   return NextResponse.json({ ok:true, updated });
// }
 