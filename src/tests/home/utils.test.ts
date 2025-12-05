import { daysSince, keyOf } from "@/components/home/utils";
import { describe, it, expect } from "vitest";

describe("utils", () => {
  it("daysSince deve calcular dias inteiros", () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const n = daysSince(twoDaysAgo.toISOString());
    expect(n).greaterThanOrEqual(2);
  });

  it("daysSince retorna Infinity se data inválida", () => {
    expect(daysSince("foo")).toBe(Infinity);
  });

  it("keyOf normaliza número/str para string", () => {
    expect(keyOf(123)).toBe("123");
    expect(keyOf("123")).toBe("123");
  });
});
