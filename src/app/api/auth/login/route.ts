import { NextResponse } from "next/server";
import { radarPool } from "@/lib/Db";
import { setServerSession } from "@/lib/auth/serverSession";
import { accessesFromCargoId } from "@/lib/auth/access";
import bcrypt from "bcryptjs";
import { landingPath } from "@/lib/auth/landing";

function toInt(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const cadastroId = toInt(body?.cadastro_id);
  const senha = String(body?.senha ?? "");

  if (!cadastroId || !senha) {
    return NextResponse.json({ error: "Missing cadastro_id or senha" }, { status: 400 });
  }

  // 1) pega funcionário por cadastro_id (cadastro_id é double precision, então cast pra int)
  const userSql = `
    SELECT
      f.funcionario_id,
      f.cadastro_id,
      f.cargo_id,
      TRIM(f.nome) AS nome,
      COALESCE(f.ativo, 'N') AS ativo
    FROM public.funcionarios f
    WHERE (f.funcionario_id)::bigint = $1::bigint
    LIMIT 1
  `;
  const userRes = await radarPool.query(userSql, [cadastroId]);
  const u = userRes.rows[0];

  if (!u) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
  if (String(u.ativo) !== "S") return NextResponse.json({ error: "Usuário inativo" }, { status: 403 });

  const funcionarioId = toInt(u.funcionario_id);
  const cargoId = toInt(u.cargo_id);
  const nome = String(u.nome || "").trim();

  if (!funcionarioId || !cargoId || !nome) {
    return NextResponse.json({ error: "Usuário inválido" }, { status: 500 });
  }

  const accesses = accessesFromCargoId(cargoId);
  if (accesses.length === 0) {
    return NextResponse.json({ error: "Sem acesso ao sistema" }, { status: 403 });
  }

  // 2) busca senha no senha_radar
  const passSql = `SELECT senha FROM public.senha_radar WHERE funcionario_id = $1::text LIMIT 1`;
  const passRes = await radarPool.query(passSql, [String(funcionarioId)]);
  const row = passRes.rows[0];

  if (!row?.senha) {
    // 1º login: grava hash e autentica
    const hash = await bcrypt.hash(senha, 12);
    await radarPool.query(
      `INSERT INTO public.senha_radar (funcionario_id, senha, criado_em) VALUES ($1, $2, $3)`,
      [String(funcionarioId), hash, new Date().toISOString()]
    );
  } else {
    // logins seguintes: compara
    const ok = await bcrypt.compare(senha, String(row.senha));
    if (!ok) return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }

  // 3) cria sessão
  await setServerSession({
    funcionarioId,
    cadastroId,
    cargoId,
    name: nome,
    accesses,
  });

  return NextResponse.json({ ok: true, redirectTo: landingPath(accesses) });
}