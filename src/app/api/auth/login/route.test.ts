import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  setServerSession: vi.fn(),
  accessesFromCargoId: vi.fn(),
  landingPath: vi.fn(),
  bcryptHash: vi.fn(),
  bcryptCompare: vi.fn(),
}));

vi.mock("@/lib/Db", () => ({
  radarPool: { query: mocks.query },
}));

vi.mock("@/lib/auth/serverSession", () => ({
  setServerSession: mocks.setServerSession,
}));

vi.mock("@/lib/auth/access", () => ({
  accessesFromCargoId: mocks.accessesFromCargoId,
}));

vi.mock("@/lib/auth/landing", () => ({
  landingPath: mocks.landingPath,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.bcryptHash,
    compare: mocks.bcryptCompare,
  },
}));

import { POST } from "@/app/api/auth/login/route";

function makeReq(body: any) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.query.mockReset();
  mocks.setServerSession.mockReset();
  mocks.accessesFromCargoId.mockReset();
  mocks.landingPath.mockReset();
  mocks.bcryptHash.mockReset();
  mocks.bcryptCompare.mockReset();
});

describe("POST /api/auth/login", () => {
  it("400 se faltar cadastro_id ou senha", async () => {
    const res = await POST(makeReq({ cadastro_id: "", senha: "" }));
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/Missing/);
  });

  it("401 se usuário não encontrado", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [] });

    const res = await POST(makeReq({ cadastro_id: 123, senha: "x" }));
    expect(res.status).toBe(401);
    const j = await res.json();
    expect(j.error).toBe("Usuário não encontrado");
  });

  it("403 se usuário inativo", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: 10, cadastro_id: 123, cargo_id: 501, nome: "Teste", ativo: "N" }],
    });

    const res = await POST(makeReq({ cadastro_id: 123, senha: "x" }));
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.error).toBe("Usuário inativo");
  });

  it("500 se usuário vier inválido", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: null, cadastro_id: 123, cargo_id: 501, nome: "", ativo: "S" }],
    });

    const res = await POST(makeReq({ cadastro_id: 123, senha: "x" }));
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.error).toBe("Usuário inválido");
  });

  it("403 se cargo sem acesso", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: 10, cadastro_id: 123, cargo_id: 999, nome: "Teste", ativo: "S" }],
    });
    mocks.accessesFromCargoId.mockReturnValueOnce([]);

    const res = await POST(makeReq({ cadastro_id: 123, senha: "x" }));
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.error).toBe("Sem acesso ao sistema");
  });

  it("1º login: sem senha no senha_radar => hash + insert + cria sessão", async () => {
    // 1) user
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: 10, cadastro_id: 123, cargo_id: 501, nome: "  Ana  ", ativo: "S" }],
    });
    // 2) senha_radar (sem senha)
    mocks.query.mockResolvedValueOnce({ rows: [] });
    // 3) insert
    mocks.query.mockResolvedValueOnce({ rows: [] });

    mocks.accessesFromCargoId.mockReturnValueOnce(["crm", "dashboard"]);
    mocks.landingPath.mockReturnValueOnce("/crm");
    mocks.bcryptHash.mockResolvedValueOnce("HASHED");

    const res = await POST(makeReq({ cadastro_id: 123, senha: "senha123" }));
    expect(res.status).toBe(200);

    const j = await res.json();
    expect(j).toEqual({ ok: true, redirectTo: "/crm" });

    expect(mocks.bcryptHash).toHaveBeenCalledWith("senha123", 12);
    expect(mocks.query).toHaveBeenCalledTimes(3);

    expect(mocks.setServerSession).toHaveBeenCalledWith({
      funcionarioId: 10,
      cadastroId: 123,
      cargoId: 501,
      name: "Ana",
      accesses: ["crm", "dashboard"],
    });
  });

  it("login subsequente: senha existe e compare ok => cria sessão", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: 10, cadastro_id: 123, cargo_id: 511, nome: "João", ativo: "S" }],
    });
    mocks.query.mockResolvedValueOnce({ rows: [{ senha: "HASHED_DB" }] });

    mocks.accessesFromCargoId.mockReturnValueOnce(["finance"]);
    mocks.landingPath.mockReturnValueOnce("/finance");
    mocks.bcryptCompare.mockResolvedValueOnce(true);

    const res = await POST(makeReq({ cadastro_id: 123, senha: "minha" }));
    expect(res.status).toBe(200);

    const j = await res.json();
    expect(j.redirectTo).toBe("/finance");

    expect(mocks.bcryptCompare).toHaveBeenCalledWith("minha", "HASHED_DB");
    expect(mocks.setServerSession).toHaveBeenCalled();
  });

  it("login subsequente: senha inválida => 401", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ funcionario_id: 10, cadastro_id: 123, cargo_id: 511, nome: "João", ativo: "S" }],
    });
    mocks.query.mockResolvedValueOnce({ rows: [{ senha: "HASHED_DB" }] });

    mocks.accessesFromCargoId.mockReturnValueOnce(["finance"]);
    mocks.bcryptCompare.mockResolvedValueOnce(false);

    const res = await POST(makeReq({ cadastro_id: 123, senha: "errada" }));
    expect(res.status).toBe(401);

    const j = await res.json();
    expect(j.error).toBe("Senha inválida");
  });
});