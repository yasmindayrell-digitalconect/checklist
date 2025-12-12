import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ✅ Mock do HistoryColumn pra inspecionar title e items
vi.mock("@/components/history/HistoryColumn", () => ({
  default: ({ title, items }: any) => (
    <div data-testid="HistoryColumn">
      <div data-testid="colTitle">{title}</div>
      <div data-testid="colIds">
        {(items || []).map((r: any) => r.id_envio).join(",")}
      </div>
    </div>
  ),
}));

import HistoryTable from "@/components/history/HistoryTable";

describe("HistoryTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // fixa "hoje" como 2025-12-12
    vi.setSystemTime(new Date("2025-12-12T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mostra mensagem de vazio quando não há rows", () => {
    render(<HistoryTable rows={[]} />);

    expect(
      screen.getByText("Nenhum envio encontrado para os filtros selecionados.")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("HistoryColumn")).toBeNull();
  });

  it("agrupa por dia e ordena dias do mais recente para o mais antigo (usando created_at)", () => {
    const rows: any[] = [
      // HOJE (2025-12-12)
      { id_envio: 1, created_at: "2025-12-12T10:00:00.000Z" },
      { id_envio: 2, created_at: "2025-12-12T08:00:00.000Z" },

      // ONTEM (2025-12-11)
      { id_envio: 3, created_at: "2025-12-11T23:00:00.000Z" },

      // DIA ANTERIOR (2025-12-10)
      { id_envio: 4, created_at: "2025-12-10T09:00:00.000Z" },
    ];

    render(<HistoryTable rows={rows} />);

    const cols = screen.getAllByTestId("HistoryColumn");
    expect(cols).toHaveLength(3);

    const titles = screen.getAllByTestId("colTitle").map((n) => n.textContent);

    expect(titles[0]).toMatch(/^Hoje · 12\/12$/);
    expect(titles[1]).toMatch(/^Ontem · 11\/12$/);
    expect(titles[2]).toMatch(/^10\/12 \(.+\)$/);

    // ids dentro do grupo "Hoje" devem estar em ordem do mais recente pro mais antigo
    const idsHoje = screen.getAllByTestId("colIds")[0].textContent;
    expect(idsHoje).toBe("1,2");
  });

  it("usa created_at quando existe; usa data_envio quando created_at não existe; e manda sem data para 1970-01-01", () => {
    const rows: any[] = [
      // created_at (ontem)
      { id_envio: 10, created_at: "2025-12-11T12:00:00.000Z" },

      // fallback data_envio (hoje)
      { id_envio: 11, data_envio: "2025-12-12" },

      // sem data nenhuma => fallback seguro 1970-01-01
      { id_envio: 12 },
    ];

    render(<HistoryTable rows={rows} />);

    const titles = screen.getAllByTestId("colTitle").map((n) => n.textContent);

    // Hoje (do id 11 via data_envio)
    expect(titles[0]).toMatch(/^Hoje · 12\/12$/);

    // Ontem (do id 10 via created_at)
    expect(titles[1]).toMatch(/^Ontem · 11\/12$/);

    // Último grupo: 01/01 ou 31/12 dependendo do TZ
    expect(titles[titles.length - 1]).toMatch(/^(31\/12|01\/01) \(.+\)$/);

    // confirma ids do grupo "Hoje"
    const idsHoje = screen.getAllByTestId("colIds")[0].textContent;
    expect(idsHoje).toBe("11");
  });

  it("aceita data_envio no formato 'YYYY-MM-DD' (sem hora)", () => {
    const rows: any[] = [
      { id_envio: 21, data_envio: "2025-12-12" }, // hoje
      { id_envio: 22, data_envio: "2025-12-11" }, // ontem
    ];

    render(<HistoryTable rows={rows} />);

    const titles = screen.getAllByTestId("colTitle").map((n) => n.textContent);
    expect(titles[0]).toMatch(/^Hoje · 12\/12$/);
    expect(titles[1]).toMatch(/^Ontem · 11\/12$/);
  });
});
