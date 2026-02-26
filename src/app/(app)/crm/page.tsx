import { unstable_noStore as noStore } from "next/cache";
import HomeClient from "@/components/home/HomeClient";
import type { ClienteComContatos, ClienteRow, ContatoRow, RadarJoinedRow } from "@/types/crm";
import { getServerSession } from "@/lib/auth/serverSession";
import { redirect } from "next/navigation";
import { radarPool } from "@/lib/Db";
import { isActiveFlag, pickClientName} from "@/app/utils"; 
import { hasAccess } from "@/lib/auth/access";


export default async function Page() {
  const nowISO = new Date().toISOString();
  noStore();

  const session = await getServerSession();
  if (!session) redirect("/login");

  // ✅ essa tela é CRM
  if (!hasAccess(session.accesses, "crm")) redirect("/");

  const params: any[] = [];
  let where = `1=1`;

  // só ativos
  where += ` AND COALESCE(c.cliente_ativo,'S') <> 'N'`;

  // ✅ vendedor (cargo 2): filtra carteira pelo funcionario_id
  const isSeller = session.cargoId === 2;

  if (isSeller) {
    params.push(session.funcionarioId);
    where += ` AND (c.funcionario_id)::int = $${params.length}::int`;
  } else {
    const ALLOWED_SELLERS = [244, 12, 17, 200, 110, 193, 114, 215, 108, 163];
    params.push(ALLOWED_SELLERS);
    where += `
      AND c.funcionario_id IS NOT NULL
      AND (c.funcionario_id)::int = ANY($${params.length}::int[])
      AND COALESCE(TRIM(f.nome), '') <> ''
      AND UPPER(TRIM(f.nome)) NOT LIKE 'GRUPO%'
      AND UPPER(TRIM(f.nome)) NOT LIKE 'VENDEDOR%'
    `;
  }


  const sql = `
    WITH last_sale AS (
      SELECT DISTINCT ON (o.cadastro_id)
        o.cadastro_id AS cliente_id,
        o.data_recebimento AS ultima_compra,
        o.orcamento_id::bigint AS last_sale_orcamento_id
      FROM public.orcamentos o
      WHERE
        o.pedido_fechado = 'S'
        AND COALESCE(o.cancelado, 'N') = 'N'
        AND COALESCE(o.bloqueado, 'N') = 'N'
        AND o.data_recebimento IS NOT NULL
      ORDER BY
        o.cadastro_id,
        o.data_recebimento DESC,
        o.orcamento_id DESC
    ),

    contatos AS (
      SELECT
        cc.cadastro_id,
        jsonb_agg(
          jsonb_build_object(
            'id_contato', cc.id_contato,
            'id_cliente', cc.cadastro_id,
            'nome_contato', cc.nome,
            'funcao', cc.funcao,
            'telefone', NULLIF(BTRIM(cc.telefone), ''),
            'celular', NULLIF(BTRIM(cc.celular), ''),
            'criado_em', cc.data_hora_alteracao
          )
          ORDER BY cc.ordem NULLS LAST, cc.id_contato
        ) AS contatos_json
      FROM (
        SELECT
          cadastro_id,
          nome,
          funcao,
          telefone,
          celular,
          data_hora_alteracao,
          ordem,
          ROW_NUMBER() OVER (
            PARTITION BY cadastro_id
            ORDER BY ordem NULLS LAST, data_hora_alteracao DESC NULLS LAST, nome
          )::int AS id_contato
        FROM public.contatos_cadastros
      ) cc
      GROUP BY cc.cadastro_id
    ),
    open_budgets AS (
      SELECT
        o.cadastro_id,
        COUNT(*)::int AS orcamentos_abertos,
        MIN(o.data_validade_orcamento) AS validade_orcamento_min,
        MAX(o.orcamento_id)::bigint AS open_budget_id
      FROM public.orcamentos o
      WHERE
        COALESCE(o.pedido_fechado,'N') = 'N'
        AND COALESCE(o.cancelado,'N') = 'N'
        AND COALESCE(o.bloqueado,'N') = 'N'
        AND o.data_validade_orcamento IS NOT NULL
        AND o.data_validade_orcamento::date >= CURRENT_DATE
      GROUP BY o.cadastro_id
    )
    SELECT
      cad.cadastro_id,
      cad.nome_razao_social,
      cad.nome_fantasia,

      b.nome AS nome_bairro,
      cid.nome AS nome_cidade,
      cid.estado_id,

      f.nome AS nome_vendedor,
      c.funcionario_id AS vendedor_id,

      clc.limite_credito_aprovado,
      c.cliente_ativo,

      i.ultima_interacao,
      i.proxima_interacao,
      i.observacoes,

      (
        i.ultima_interacao IS NOT NULL
        AND i.ultima_interacao::date = CURRENT_DATE
      ) AS can_undo,

      ls.ultima_compra,
      ls.last_sale_orcamento_id,

      COALESCE(ob.orcamentos_abertos, 0) AS orcamentos_abertos,
      (COALESCE(ob.orcamentos_abertos, 0) > 0)::boolean AS tem_orcamento_aberto,
      ob.validade_orcamento_min,
      ob.open_budget_id,

      COALESCE(ct.contatos_json, '[]'::jsonb) AS contatos_json
    FROM public.cadastros cad
    JOIN public.clientes c ON c.cadastro_id = cad.cadastro_id
    LEFT JOIN public.funcionarios f ON f.funcionario_id = c.funcionario_id
    LEFT JOIN public.clientes_limite_credito clc ON clc.cliente_limite_credito_id = c.cliente_limite_credito_id
    LEFT JOIN public.bairros b ON b.bairro_id = cad.bairro_id
    LEFT JOIN public.cidades cid ON cid.cidade_id = b.cidade_id
    LEFT JOIN public.crm_interacoes_radar i
      ON i.cliente_id = cad.cadastro_id
    LEFT JOIN last_sale ls
      ON ls.cliente_id = cad.cadastro_id
    LEFT JOIN contatos ct
      ON ct.cadastro_id = cad.cadastro_id
    LEFT JOIN open_budgets ob
      ON ob.cadastro_id = cad.cadastro_id
    WHERE ${where}
    ORDER BY
      (ls.ultima_compra IS NULL) ASC,
      ls.ultima_compra ASC
    LIMIT 5000
    `;


  const { rows } = await radarPool.query<RadarJoinedRow>(sql, params);

  const enriched: ClienteComContatos[] = rows.map((r) => {
    const clientId = Number(r.cadastro_id); // ✅ normaliza bigint/string -> number
    const sellerId = r.vendedor_id == null ? null : Number(r.vendedor_id); // ✅
    const hasOpenBudget =
      r.tem_orcamento_aberto === true ||
      r.tem_orcamento_aberto === "t" ||
      r.tem_orcamento_aberto === 1; // ✅

      const openBudgetId = r.open_budget_id == null ? null : Number(r.open_budget_id);
      const lastSaleOrcamentoId =
        r.last_sale_orcamento_id == null ? null : Number(r.last_sale_orcamento_id);


      const contatos: ContatoRow[] = (r.contatos_json ?? []).map((ct) => ({
        id_contato: ct.id_contato,
        id_cliente: clientId,
        nome_contato: (ct.nome_contato ?? "").trim(),
        funcao: ct.funcao ?? null,
        telefone: (ct.celular ?? ct.telefone) ?? null,
        criado_em: ct.criado_em ? new Date(ct.criado_em).toISOString() : null,
      }));
      const principal = contatos.find((c) => c.telefone)?.telefone ?? null;

  const row: ClienteRow = {
    id_cliente: clientId,
    Cliente: pickClientName(r),
    Razao_social: (r.nome_razao_social ?? "").trim(),
    Cidade: (r.nome_cidade ?? "").trim(),
    Estado: (r.estado_id ?? "").trim(),
    Vendedor: (r.nome_vendedor ?? "").trim(),
    Limite: Number(r.limite_credito_aprovado ?? 0),

    telefone: principal,
    tel_celular: principal,

    ultima_compra: r.ultima_compra ? new Date(r.ultima_compra).toISOString() : null,
    last_sale_orcamento_id: lastSaleOrcamentoId,
    ultima_interacao: r.ultima_interacao ? new Date(r.ultima_interacao).toISOString() : null,
    proxima_interacao: r.proxima_interacao ? new Date(r.proxima_interacao).toISOString() : null,
    observacoes: r.observacoes ?? null,

    can_undo: Boolean(r.can_undo),

    id_vendedor: sellerId,
    ativo: isActiveFlag(r.cliente_ativo),

    orcamentos_abertos: Number(r.orcamentos_abertos ?? 0),
    validade_orcamento_min: r.validade_orcamento_min
      ? new Date(r.validade_orcamento_min).toISOString()
      : null,

    tem_orcamento_aberto: hasOpenBudget,
    open_budget_id: openBudgetId,
  };

  return { ...row, contatos };
});

  return <HomeClient clients={enriched} nowISO={nowISO}/>;
}