// app/(app)/ranking/metas/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/serverSession";
import GoalsEditorClient, { type SellerGoalDraft } from "@/components/goals/GoalsEditorClient";

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getWeekRangeFromRef(ref: Date) {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const jsDay = d.getDay(); // 0 dom ... 6 sáb
  const diffToMonday = (jsDay + 6) % 7; // seg=0 ... dom=6
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return { monday, friday };
}

function fmtBRShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

export default async function RankingMetasPage({
  searchParams,
}: {
  searchParams?: { weekOffset?: string };
}) {
  noStore();

  const session = await getServerSession();
  if (!session) redirect("/select-user");
  if (session.role !== "admin") redirect("/dashboard");

  const weekOffset = clampInt(Number(searchParams?.weekOffset ?? 0), -104, 104);
  const dataRef = new Date();
  dataRef.setDate(dataRef.getDate() + weekOffset * 7);
  const { monday, friday } = getWeekRangeFromRef(dataRef);
  const weekLabel = `${fmtBRShort(monday)} — ${fmtBRShort(friday)}`;

  // mesmos sellers do ranking (ajuste livre)
  const sellerIds = [244, 12, 17, 200, 110, 193, 114, 215, 108, 163];

  // ✅ Placeholder de dados (amanhã você troca por query real)
  const initial: SellerGoalDraft[] = sellerIds.map((id, idx) => ({
    seller_id: id,
    seller_name: `Vendedor ${idx + 1}`, // placeholder
    weekly_meta: 0,
    monthly_meta: 0,
    notes: "",
  }));

  return (
    <GoalsEditorClient
      weekOffset={weekOffset}
      weekLabel={weekLabel}
      initial={initial}
    />
  );
}
