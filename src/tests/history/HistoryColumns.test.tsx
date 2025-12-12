import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ✅ Mock do HistoryItem
vi.mock("@/components/history/HistoryItem", () => ({
  default: ({ row }: any) => (
    <li data-testid="HistoryItem">
      item:{row.id_envio}
    </li>
  ),
}));

// Import depois do mock
import HistoryColumn from "@/components/history/HistoryColumn";

describe("HistoryColumn", () => {
  it("renderiza título e contador corretamente", () => {
    render(
      <HistoryColumn
        title="Enviados"
        items={[
          { id_envio: 1 },
          { id_envio: 2 },
          { id_envio: 3 },
        ] as any}
      />
    );

    expect(screen.getByText("Enviados")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("mostra mensagem 'Sem envios.' quando lista está vazia", () => {
    render(<HistoryColumn title="Falhas" items={[]} />);

    expect(screen.getByText("Falhas")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Sem envios.")).toBeInTheDocument();

    // não renderiza HistoryItem
    expect(screen.queryByTestId("HistoryItem")).toBeNull();
  });

  it("renderiza um HistoryItem para cada item", () => {
    render(
      <HistoryColumn
        title="Pendentes"
        items={[
          { id_envio: 10 },
          { id_envio: 20 },
        ] as any}
      />
    );

    const items = screen.getAllByTestId("HistoryItem");
    expect(items).toHaveLength(2);

    expect(screen.getByText("item:10")).toBeInTheDocument();
    expect(screen.getByText("item:20")).toBeInTheDocument();
  });
});
