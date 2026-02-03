//app\(app)\ranking\page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/serverSession";
import RankingClient from "@/components/ranking/RankingClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession();

  if (!session) redirect("/select-user");
  if (session.role !== "admin") redirect("/dashboard"); // ou "/"

  return (
    <div>
      <RankingClient/>
    </div>
  );
}