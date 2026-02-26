"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, LayoutGrid, ShieldUser } from "lucide-react";
import { hasAccess, type AppAccess } from "@/lib/auth/access";

function tabClass(active: boolean) {
  return [
    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
    active
      ? "bg-white text-[#2323ff] shadow-sm"
      : "text-white/90 hover:text-white hover:bg-white/10",
  ].join(" ");
}

export default function HeaderTabs({ accesses }: { accesses: AppAccess[] }) {
  const pathname = usePathname();

  const canCrm = hasAccess(accesses, "crm");
  const canDash = hasAccess(accesses, "dashboard");
  const canRanking = hasAccess(accesses, "ranking");
  const canFinance = hasAccess(accesses, "finance");

  const isCrm = pathname === "/" || pathname.startsWith("/crm") || pathname.startsWith("/vendas");
  const isDash = pathname.startsWith("/dashboard");
  const isRanking = pathname.startsWith("/ranking");
  const isFinance = pathname.startsWith("/finance");

  // se o usuário não tiver nenhuma tab, nem mostra o nav
  if (!canCrm && !canDash && !canRanking && !canFinance) return null;

  return (
    <nav className="inline-flex items-center gap-1 rounded-2xl p-1" aria-label="Navegação">
      {canCrm && (
        <Link href="/crm" className={tabClass(isCrm)}>
          <Target className="h-4 w-4" />
          CRM/Vendas
        </Link>
      )}

      {canDash && (
        <Link href="/dashboard" className={tabClass(isDash)}>
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </Link>
      )}

      {canRanking && (
        <Link href="/ranking" className={tabClass(isRanking)}>
          <ShieldUser className="h-4 w-4" />
          Ranking
        </Link>
      )}

      {canFinance && (
        <Link href="/finance" className={tabClass(isFinance)}>
          <ShieldUser className="h-4 w-4" />
          Financeiro
        </Link>
      )}
    </nav>
  );
}