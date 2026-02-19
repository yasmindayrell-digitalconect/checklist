import { radarPool } from "@/lib/Db";
import SelectUserClient from "@/components/auth/select-user/SelectUserClient";

type Seller = { id: number; nome: string };

export default async function Page() {
  const sql = `
      SELECT
        funcionario_id AS vendedor_id,
        TRIM(nome) AS nome_vendedor
      FROM public.funcionarios f
      WHERE f.vendedor = 'S'
        AND COALESCE(f.ativo, 'N') = 'S'
        AND COALESCE(TRIM(f.nome), '') <> ''

        -- ✅ Apenas vendedores com meta lançada OR que sejam grupos
        AND (
          EXISTS (
            SELECT 1 FROM public.itens_metas im 
            WHERE im.funcionario_id = f.funcionario_id 
              AND im.ano_mes = (EXTRACT(YEAR FROM CURRENT_DATE)::int * 100 + EXTRACT(MONTH FROM CURRENT_DATE)::int)
          )
          OR UPPER(TRIM(f.nome)) LIKE 'GRUPO%'
        )

        -- ❌ exclui nomes específicos
        AND TRIM(f.nome) NOT IN (
          'ANA CLAUDIA DA COSTA SILVA',
          'LAIS PEREIRA BARBOSA',
          'IARA COSTA DA SILVA',
          'RAFAEL LIMEIRA DE SOUZA QUEIROZ'
        )

        -- ❌ exclui QUALQUER nome que comece com "VENDEDOR"
        AND UPPER(TRIM(f.nome)) NOT LIKE 'VENDEDOR%'

      GROUP BY f.funcionario_id, TRIM(f.nome);
    `;
  const { rows } = await radarPool.query<{
    vendedor_id: number;
    nome_vendedor: string;
  }>(sql);

  const sellersFromDb: Seller[] = rows.map((r) => ({
    id: Math.trunc(Number(r.vendedor_id)),
    nome: r.nome_vendedor.trim(),
  }));

  const sellersOrdered: Seller[] = sellersFromDb.sort((a, b) => {
    const aUpper = a.nome.toUpperCase();
    const bUpper = b.nome.toUpperCase();



    const aIsGrupo = aUpper.startsWith("GRUPO");
    const bIsGrupo = bUpper.startsWith("GRUPO");

    // 1️⃣ vendedores normais primeiro
    if (aIsGrupo !== bIsGrupo) {
      return aIsGrupo ? 1 : -1;
    }

    // 2️⃣ dentro do mesmo grupo, ordem alfabética
    return aUpper.localeCompare(bUpper, "pt-BR");
  });

  const sellers: Seller[] = [
    ...sellersOrdered,
    {
      id: -1,
      nome: "SEM VENDEDOR",
    },
  ];

  return <SelectUserClient sellers={sellers} />;
}
