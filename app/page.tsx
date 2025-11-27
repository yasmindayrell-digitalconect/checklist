import { supabaseAdmin } from "@/lib/supabaseAdmin";
import HomeClient from "@/components/home/HomeClient";

export default async function Page() {
  const { data: clients, error } = await supabaseAdmin.from("clientes").select("*");
  const { data: messages } = await supabaseAdmin.from("mensagens").select("*");
  const { data: contacts  } = await supabaseAdmin.from("contatos_cliente").select("*");

  if (error) {
    console.error("❌ Error loading clients:", error);
    return <p>Error loading clients.</p>;
  }

  return <HomeClient Clients={clients || []} Messages={messages || []} Contacts={contacts || []} />;
}
