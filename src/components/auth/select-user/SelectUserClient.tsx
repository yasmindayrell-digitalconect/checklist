"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AppUser } from "@/types/auth";
import UserCard from "./UserCard";

type Seller = { id: number; nome: string };

export default function SelectUserClient({ sellers }: { sellers: Seller[] }) {
  const router = useRouter();
  const { setUser } = useAuth();

  async function selectSeller(s: Seller) {
    const payload = { role: "seller", sellerId: s.id, sellerName: s.nome } as const;

    await fetch("/api/auth/select-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setUser(payload);
    router.replace("/");
  }

  async function selectAdmin() {
    const payload = { role: "admin", sellerName: "Admins" } as const;

    await fetch("/api/auth/select-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setUser(payload);
    router.replace("/");
  }

    function Name(fullName?: string) {
    if (!fullName) return "";
    const cleaned = fullName.trim().replace(/\s+/g, " ");
    return cleaned.split(" ")[0] ?? "";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Quem está logando?</h1>
          <p className="text-sm text-gray-500">
            Selecione seu nome para abrir o checklist do dia.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UserCard
            title="Admins"
            subtitle="Acesso a todos os clientes"
            badge="Admin"
            onClick={selectAdmin}
          />

          {sellers.map((s) => (
            <UserCard
              key={s.id}
              title={Name(s.nome)}
              subtitle="Acesso aos seus clientes"
              badge="Vendedor"
              onClick={() => selectSeller(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
