import { describe, it, expect } from "vitest";
import { accessesFromCargoId } from "@/lib/auth/access";

describe("accessesFromCargoId", () => {
  it("diretoria/devs tem acesso total", () => {
    expect(accessesFromCargoId(501)).toEqual(["crm", "dashboard", "finance", "ranking"]);
    expect(accessesFromCargoId(4)).toEqual(["crm", "dashboard", "finance", "ranking"]);
  });

  it("gerente de vendas não tem finance", () => {
    expect(accessesFromCargoId(500)).toEqual(["crm", "dashboard", "ranking"]);
  });

  it("financeiro só finance", () => {
    expect(accessesFromCargoId(511)).toEqual(["finance"]);
    expect(accessesFromCargoId(502)).toEqual(["finance"]);
  });

  it("vendedor só crm + dashboard", () => {
    expect(accessesFromCargoId(2)).toEqual(["crm", "dashboard"]);
  });

  it("cargo desconhecido sem acesso", () => {
    expect(accessesFromCargoId(999999)).toEqual([]);
  });
});