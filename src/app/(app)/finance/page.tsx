// app/(app)/finance/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/serverSession";
import { radarPool } from "@/lib/Db";
import FinanceClient from "@/components/finance/FinanceClient";
import {FinanceBonusesPayload, FinanceSellerMonthly,FinanceSellerWallet, FinanceWeek, FinanceSellerWeek} from "@/types/finance"
import { toNumber, fmtMonthBR, fmtBRShort, first} from "@/app/utils"; 

type SP = Record<string, string | string[] | undefined> | undefined;


 

function parseMonthParam(monthParam?: string | null) {
  // esperado: "YYYY-MM"
  const now = new Date();
  const raw = (monthParam ?? "").trim();
  const m = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!m) {
    const y = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return { y, m: Number(mm), ymStr: `${y}-${mm}` };
  }
  const y = Number(m[1]);
  const mm = Number(m[2]);
  return { y, m: mm, ymStr: `${m[1]}-${m[2]}` };
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: SP | Promise<SP>;
}) {
  noStore();

  const session = await getServerSession();
  if (!session) redirect("/select-user");
  if (session.role !== "admin") redirect("/dashboard");

  // mesmos sellers (pode deixar igual ao ranking por enquanto)
  const sellerIds = [244, 12, 17, 200, 110, 193, 114, 215, 108, 163];

  const sp = await Promise.resolve(searchParams as any as SP);
  const monthParam = first(sp?.month);
  const { y, m, ymStr } = parseMonthParam(monthParam);

  const dtIni = new Date(y, m - 1, 1);
  const dtFim = new Date(y, m, 0);
  const monthLabel = fmtMonthBR(dtIni);
  const anoMes = y * 100 + m;

  const sqlMonthlyWallet = `
    WITH
      params AS (
        SELECT
          $2::date AS dt_ini,
          $3::date AS dt_fim,
          (EXTRACT(YEAR FROM $2::date)::int * 100 + EXTRACT(MONTH FROM $2::date)::int) AS ano_mes
      ),
      sellers AS (
        SELECT f.funcionario_id::int AS seller_id, f.nome AS seller_name
        FROM public.funcionarios f
        WHERE upper(coalesce(f.ativo,'S')) NOT IN ('N','NAO','0','F','FALSE')
          AND f.funcionario_id IS NOT NULL
          AND f.funcionario_id::int = ANY($1::int[])
      ),

      vendas_mes AS (
        SELECT
          o.vendedor_id::int AS seller_id,
          SUM(COALESCE(o.valor_pedido, 0))::numeric AS valor_bruto_total,
          SUM(CASE WHEN COALESCE(o.totalmente_devolvido,'N') = 'N'
                  THEN COALESCE(o.valor_outras_desp_manual, 0) ELSE 0 END)::numeric AS despesa_operacional,
          SUM(CASE WHEN COALESCE(o.totalmente_devolvido,'N') = 'S'
                  THEN COALESCE(o.valor_outras_desp_manual, 0) ELSE 0 END)::numeric AS ajuste_desp_estorno,
          SUM(COALESCE(o.valor_frete_processado, 0) + COALESCE(o.valor_frete_extra_manual, 0))::numeric AS total_frete
        FROM public.orcamentos o
        CROSS JOIN params p
        WHERE o.data_recebimento >= p.dt_ini
          AND o.data_recebimento < (p.dt_fim + 1)
          AND COALESCE(o.cancelado,'N') = 'N'
          AND o.vendedor_id IS NOT NULL
        GROUP BY 1
      ),

      dev_itens_mes AS (
        SELECT
          rd.vendedor_id::int AS seller_id,
          SUM(COALESCE(ird.quantidade * ird.preco_venda, 0))::numeric AS total_dev_valor
        FROM public.itens_requisicoes_devolucoes ird
        JOIN public.requisicoes_devolucoes rd ON ird.requisicao_id = rd.requisicao_id
        CROSS JOIN params p
        WHERE ird.data_hora_alteracao >= p.dt_ini
          AND ird.data_hora_alteracao < (p.dt_fim + 1)
          AND rd.vendedor_id IS NOT NULL
        GROUP BY 1
      ),

      metas_mes AS (
        SELECT
          im.funcionario_id::int AS seller_id,
          SUM(COALESCE(im.meta, 0))::numeric AS goal_meta
        FROM public.itens_metas im
        CROSS JOIN params p
        WHERE im.ano_mes = p.ano_mes
        GROUP BY 1
      ),

      mensal AS (
        SELECT
          s.seller_id,
          s.seller_name,
          COALESCE(m.goal_meta, 0)::numeric AS goal_meta,
          (
            (COALESCE(v.valor_bruto_total, 0) - COALESCE(d.total_dev_valor, 0) - COALESCE(v.ajuste_desp_estorno, 0))
            - COALESCE(v.despesa_operacional, 0)
            - COALESCE(v.total_frete, 0)
          )::numeric AS net_sales,
          CASE
            WHEN COALESCE(m.goal_meta, 0) > 0
            THEN ROUND(((
              (COALESCE(v.valor_bruto_total, 0) - COALESCE(d.total_dev_valor, 0) - COALESCE(v.ajuste_desp_estorno, 0))
              - COALESCE(v.despesa_operacional, 0)
              - COALESCE(v.total_frete, 0)
            ) / m.goal_meta * 100)::numeric, 2)
            ELSE 0
          END AS pct_achieved
        FROM sellers s
        LEFT JOIN vendas_mes v ON v.seller_id = s.seller_id
        LEFT JOIN dev_itens_mes d ON d.seller_id = s.seller_id
        LEFT JOIN metas_mes m ON m.seller_id = s.seller_id
      ),


      carteira_base AS (
        SELECT
          cl.funcionario_id::int AS seller_id,
          cl.cadastro_id::bigint AS cliente_id
        FROM public.clientes cl
        JOIN public.funcionarios f ON f.funcionario_id = cl.funcionario_id
        WHERE COALESCE(cl.cliente_ativo,'S') <> 'N'
          AND cl.funcionario_id IS NOT NULL
          AND (cl.funcionario_id)::int = ANY($1::int[])
          AND COALESCE(TRIM(f.nome), '') <> ''
          AND UPPER(TRIM(f.nome)) NOT LIKE 'GRUPO%'
          AND UPPER(TRIM(f.nome)) NOT LIKE 'VENDEDOR%'
      ),

      last_sale_month AS (
        SELECT
          o.vendedor_id::int AS seller_id,
          o.cadastro_id::bigint AS cliente_id
        FROM public.orcamentos o
        CROSS JOIN params p
        WHERE o.pedido_fechado = 'S'
          AND COALESCE(o.cancelado,'N') = 'N'
          AND COALESCE(o.bloqueado,'N') = 'N'
          AND o.data_recebimento::date >= p.dt_ini
          AND o.data_recebimento::date <= p.dt_fim
          AND o.vendedor_id IS NOT NULL
          AND o.cadastro_id IS NOT NULL
        GROUP BY 1,2
      ),

      carteira_stats AS (
        SELECT
          b.seller_id,
          COUNT(DISTINCT b.cliente_id)::int AS wallet_total,
          COUNT(DISTINCT ls.cliente_id)::int AS wallet_positive_month,
          CASE
            WHEN COUNT(DISTINCT b.cliente_id) > 0
            THEN ROUND((COUNT(DISTINCT ls.cliente_id)::numeric / COUNT(DISTINCT b.cliente_id)::numeric) * 100, 2)
            ELSE 0
          END AS wallet_positive_pct
        FROM carteira_base b
        LEFT JOIN last_sale_month ls ON ls.seller_id = b.seller_id AND ls.cliente_id = b.cliente_id
        GROUP BY 1
      )

    SELECT
      me.seller_id,
      me.seller_name,
      me.goal_meta,
      me.net_sales,
      me.pct_achieved,
      COALESCE(cs.wallet_total, 0)::int AS wallet_total,
      COALESCE(cs.wallet_positive_month, 0)::int AS wallet_positive_month,
      COALESCE(cs.wallet_positive_pct, 0)::numeric AS wallet_positive_pct
    FROM mensal me
    LEFT JOIN carteira_stats cs ON cs.seller_id = me.seller_id
    ORDER BY me.seller_name;
    `;

      /**
       * Query B: semanal por vendedor para TODAS as semanas (Seg–Sex) que intersectam o mês
       * - gera mondays
       * - week = monday..monday+4
       * - inclui semana se (monday <= dt_fim) e (friday >= dt_ini)
       * - calcula weekly_meta (metas_semanal que cobre a semana inteira)
       * - calcula weekly_realized (orcamentos - creditos devolução - ajuste - despesas - fretes)
       */
      const sqlWeeks = `
WITH
  params AS (SELECT $2::date AS dt_ini, $3::date AS dt_fim),

  weeks AS (
    SELECT
      gs::date AS monday,
      (gs::date + 4) AS friday
    FROM params p
    CROSS JOIN LATERAL generate_series(
      date_trunc('week', p.dt_ini)::date,
      date_trunc('week', p.dt_fim)::date + 7,
      '7 days'::interval
    ) gs
    WHERE (gs::date <= p.dt_fim) AND ((gs::date + 4) >= p.dt_ini)
  ),

  sellers AS (
    SELECT f.funcionario_id::int AS seller_id, f.nome AS seller_name
    FROM public.funcionarios f
    WHERE upper(coalesce(f.ativo,'S')) NOT IN ('N','NAO','0','F','FALSE')
      AND f.funcionario_id IS NOT NULL
      AND f.funcionario_id::int = ANY($1::int[])
  ),

  base AS (
    SELECT s.seller_id, s.seller_name, w.monday, w.friday
    FROM sellers s
    CROSS JOIN weeks w
  ),

  meta_semanal AS (
    SELECT
      b.seller_id,
      b.monday,
      SUM(COALESCE(ms.valor_meta, 0))::numeric AS weekly_meta
    FROM base b
    JOIN public.metas_semanal ms
      ON ms.vendedor_id::int = b.seller_id
     AND ms.data_inicio::date <= b.monday
     AND ms.data_fim::date    >= b.friday
    GROUP BY 1,2
  ),

  vendas_semana AS (
    SELECT
      b.seller_id,
      b.monday,
      SUM(COALESCE(o.valor_pedido, 0))::numeric AS valor_bruto_total,
      SUM(CASE WHEN COALESCE(o.totalmente_devolvido,'N') = 'N'
               THEN COALESCE(o.valor_outras_desp_manual, 0) ELSE 0 END)::numeric AS despesa_operacional,
      SUM(CASE WHEN COALESCE(o.totalmente_devolvido,'N') = 'S'
               THEN COALESCE(o.valor_outras_desp_manual, 0) ELSE 0 END)::numeric AS ajuste_desp_estorno,
      SUM(COALESCE(o.valor_frete_processado, 0) + COALESCE(o.valor_frete_extra_manual, 0))::numeric AS total_frete
    FROM base b
    LEFT JOIN public.orcamentos o
      ON o.vendedor_id::int = b.seller_id
     AND o.data_recebimento::date BETWEEN b.monday AND b.friday
     AND upper(coalesce(o.cancelado,'N')) NOT IN ('S','SIM','1','T','TRUE')
    GROUP BY 1,2
  ),

  devolucoes_semana AS (
    SELECT
      b.seller_id,
      b.monday,
      SUM(COALESCE(rd.valor_credito_gerado, 0))::numeric AS total_credito_devolucao
    FROM base b
    LEFT JOIN public.requisicoes_devolucoes rd
      ON rd.vendedor_id::int = b.seller_id
     AND rd.data_hora_alteracao::date BETWEEN b.monday AND b.friday
     AND rd.vendedor_id IS NOT NULL
    GROUP BY 1,2
  )

SELECT
  b.seller_id,
  b.seller_name,
  b.monday,
  b.friday,

  COALESCE(ms.weekly_meta, 0)::numeric AS weekly_meta,

  (
    COALESCE(v.valor_bruto_total, 0)
    - COALESCE(d.total_credito_devolucao, 0)
    - COALESCE(v.ajuste_desp_estorno, 0)
    - COALESCE(v.despesa_operacional, 0)
    - COALESCE(v.total_frete, 0)
  )::numeric AS weekly_realized,

  CASE
    WHEN COALESCE(ms.weekly_meta, 0) > 0
    THEN ROUND((
      (
        COALESCE(v.valor_bruto_total, 0)
        - COALESCE(d.total_credito_devolucao, 0)
        - COALESCE(v.ajuste_desp_estorno, 0)
        - COALESCE(v.despesa_operacional, 0)
        - COALESCE(v.total_frete, 0)
      ) / NULLIF(ms.weekly_meta, 0) * 100
    )::numeric, 2)
    ELSE 0
  END AS weekly_pct_achieved,

  CASE
    WHEN (
      COALESCE(ms.weekly_meta, 0) > 0 AND
      (
        COALESCE(v.valor_bruto_total, 0)
        - COALESCE(d.total_credito_devolucao, 0)
        - COALESCE(v.ajuste_desp_estorno, 0)
        - COALESCE(v.despesa_operacional, 0)
        - COALESCE(v.total_frete, 0)
      ) >= COALESCE(ms.weekly_meta, 0)
    )
    THEN ROUND((
      (
        COALESCE(v.valor_bruto_total, 0)
        - COALESCE(d.total_credito_devolucao, 0)
        - COALESCE(v.ajuste_desp_estorno, 0)
        - COALESCE(v.despesa_operacional, 0)
        - COALESCE(v.total_frete, 0)
      ) * 0.0005
    )::numeric, 2)
    ELSE 0
  END AS weekly_bonus_value

FROM base b
LEFT JOIN meta_semanal ms ON ms.seller_id = b.seller_id AND ms.monday = b.monday
LEFT JOIN vendas_semana v ON v.seller_id = b.seller_id AND v.monday = b.monday
LEFT JOIN devolucoes_semana d ON d.seller_id = b.seller_id AND d.monday = b.monday
ORDER BY b.seller_name, b.monday;
`;

  const { rows: mwRows } = await radarPool.query(sqlMonthlyWallet, [sellerIds, dtIni, dtFim]);
  const { rows: wRows } = await radarPool.query(sqlWeeks, [sellerIds, dtIni, dtFim]);

  // weeks únicas (pra header/colunas no client)
  const weekMap = new Map<string, FinanceWeek>();
  for (const r of wRows as any[]) {
    const monday = new Date(r.monday);
    const friday = new Date(r.friday);
    const key = monday.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!weekMap.has(key)) {
      weekMap.set(key, {
        key,
        mondayISO: key,
        fridayISO: friday.toISOString().slice(0, 10),
        label: `${fmtBRShort(monday)} a ${fmtBRShort(friday)}`,
      });
    }
  }
  const weeks = Array.from(weekMap.values()).sort((a, b) => a.mondayISO.localeCompare(b.mondayISO));

  // monthly + wallet por seller
  const monthlyBySeller = new Map<number, { monthly: FinanceSellerMonthly; wallet: FinanceSellerWallet }>();
  for (const r of mwRows as any[]) {
    const seller_id = Number(r.seller_id);
    const goal_meta = toNumber(r.goal_meta);
    const net_sales = toNumber(r.net_sales);
    const pct_achieved = toNumber(r.pct_achieved);

    // bônus mensal (regra definida)
    const month_bonus_rate =
      pct_achieved >= 110 ? 0.001 : pct_achieved >= 100 ? 0.0005 : 0;

    const month_bonus_value = Math.round(net_sales * month_bonus_rate * 100) / 100;

    // bônus por positivação por faixa
    const posPct = toNumber(r.wallet_positive_pct);
    let positivity_bonus_value = 0;
    let positivity_bonus_tier: "none" | "150" | "200" | "250" = "none";

    if (posPct >= 80) {
      positivity_bonus_value = 250;
      positivity_bonus_tier = "250";
    } else if (posPct >= 70) {
      positivity_bonus_value = 200;
      positivity_bonus_tier = "200";
    } else if (posPct >= 60) {
      positivity_bonus_value = 150;
      positivity_bonus_tier = "150";
    }

    monthlyBySeller.set(seller_id, {
      monthly: {
        seller_id,
        seller_name: r.seller_name ?? null,
        goal_meta,
        net_sales,
        pct_achieved,
        month_bonus_rate,
        month_bonus_value,
      },
      wallet: {
        seller_id,
        wallet_total: Number(r.wallet_total ?? 0),
        wallet_positive_month: Number(r.wallet_positive_month ?? 0),
        wallet_positive_pct: posPct,

        positivity_bonus_tier,
        positivity_bonus_value,
      },
    });
  }

  // weekly por seller
  const weeklyBySeller = new Map<number, FinanceSellerWeek[]>();
  for (const r of wRows as any[]) {
    const seller_id = Number(r.seller_id);
    const weekKey = String(r.monday); // já vem date
    const item: FinanceSellerWeek = {
      seller_id,
      week_mondayISO: new Date(weekKey).toISOString().slice(0, 10),
      weekly_meta: toNumber(r.weekly_meta),
      weekly_realized: toNumber(r.weekly_realized),
      weekly_pct_achieved: toNumber(r.weekly_pct_achieved),
      weekly_bonus_value: toNumber(r.weekly_bonus_value),
    };
    const arr = weeklyBySeller.get(seller_id) ?? [];
    arr.push(item);
    weeklyBySeller.set(seller_id, arr);
  }

  // payload final (client decide quais semanas entram no mês)
  const sellers = sellerIds.map((id) => {
    const mw = monthlyBySeller.get(id);
    return {
      seller_id: id,
      seller_name: mw?.monthly.seller_name ?? null,
      monthly: mw?.monthly ?? {
        seller_id: id,
        seller_name: null,
        goal_meta: 0,
        net_sales: 0,
        pct_achieved: 0,
        month_bonus_rate: 0,
        month_bonus_value: 0,
      },
      wallet: mw?.wallet ?? {
        seller_id: id,
        wallet_total: 0,
        wallet_positive_month: 0,
        wallet_positive_pct: 0,

        positivity_bonus_tier: "none" as const,
        positivity_bonus_value: 0,
      },
      weeks: (weeklyBySeller.get(id) ?? []).sort((a, b) => a.week_mondayISO.localeCompare(b.week_mondayISO)),
    };
  });

  const payload: FinanceBonusesPayload = {
    month: {
      ym: ymStr,
      ano_mes: anoMes,
      dt_iniISO: dtIni.toISOString().slice(0, 10),
      dt_fimISO: dtFim.toISOString().slice(0, 10),
      label: monthLabel,
    },
    weeks,
    sellers,
    rules: {
      positivity_threshold_pct: 60,
      positivity_bonus_options: [150, 200, 250],
      weekly_bonus_rate: 0.0005, // 0,05%
      monthly_bonus_rate_100: 0.0005, // 0,05%
      monthly_bonus_rate_110: 0.001, // 0,1%
    },
  };

  return <FinanceClient data={payload} />;
}
