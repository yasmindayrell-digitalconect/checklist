// app/messages/page.tsx
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MessagesClient from "@/components/messages/MessagesClient";
import type { Message } from "@/components/messages/types";

export default async function MessagesPage() {
  const { data, error } = await supabaseAdmin.from("mensagens").select("*");
  if (error) {
    console.error("❌ Erro ao carregar mensagens:", error);
    return <p className="p-6 text-red-600">Erro ao carregar mensagens.</p>;
  }

  return <MessagesClient messages={(data as Message[]) || []} />;
}
