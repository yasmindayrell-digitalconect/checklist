import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SelectUserClient from "@/components/auth/select-user/SelectUserClient";

export default async function Page() {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) return <p>Erro ao carregar vendedores.</p>;

  const sellers = (data || []).map((s) => ({
    id: s.id,
    nome: s.nome,
  }));

  return <SelectUserClient sellers={sellers} />;
}
