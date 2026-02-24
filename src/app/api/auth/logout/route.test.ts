import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  clearServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/serverSession", () => ({
  clearServerSession: mocks.clearServerSession,
}));

import { POST } from "@/app/api/auth/logout/route";

beforeEach(() => mocks.clearServerSession.mockReset());

describe("POST /api/auth/logout", () => {
  it("limpa sessão e retorna ok", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.clearServerSession).toHaveBeenCalledTimes(1);
  });
});