 import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Mocks dos filhos
vi.mock("@/components/history/HistoryFilters", () => ({
  default: (props: any) => (
    <div data-testid="HistoryFilters">
      <div data-testid="search">{props.search}</div>
      <div data-testid="status">{props.statusFilter}</div>

      <button onClick={() => props.setSearch("alpha")}>setSearchAlpha</button>
      <button onClick={() => props.setSearch("3199")}>setSearchPhone</button>
      <button onClick={() => props.setSearch("promo")}>setSearchTitle</button>

      <button onClick={() => props.setStatusFilter("delivered")}>
        setStatusDelivered
      </button>
      <button onClick={() => props.setStatusFilter("")}>clearStatus</button>
    </div>
  ),
}));

vi.mock("@/components/history/QueuePanel", () => ({
  default: ({ queue }: any) => (
    <div data-testid="QueuePanel">queueCount:{queue?.length ?? 0}</div>
  ),
}));

vi.mock("@/components/history/HistoryTable", () => ({
  default: ({ rows }: any) => (
    <div data-testid="HistoryTable">
      <div data-testid="rowsCount">{rows?.length ?? 0}</div>
      <div data-testid="rowIds">
        {(rows || []).map((r: any) => r.id_envio).join(",")}
      </div>
    </div>
  ),
}));

// ✅ Import depois dos mocks
import HistoryClient from "@/components/history/HistoryClient";

function makeData() {
  const history: any[] = [
    {
      id_envio: 1,
      to_phone: "31990000000",
      status_entrega: "delivered",
      clientes: { Cliente: "Alpha LTDA" },
      mensagens: { titulo: "Promo Natal" },
    },
    {
      id_envio: 2,
      to_phone: "31991111111",
      status_entrega: "failed",
      clientes: { Cliente: "Beta SA" },
      mensagens: { titulo: "Reativação" },
    },
    {
      id_envio: 3,
      to_phone: "21992222222",
      status_entrega: "delivered",
      clientes: { Cliente: "Gamma" },
      mensagens: { titulo: "Promo Verão" },
    },
  ];

  const queue: any[] = [
    { id_fila: 10, status: "pending" },
    { id_fila: 11, status: "processing" },
  ];

  return { history, queue };
}

describe("HistoryClient", () => {
  it("renderiza QueuePanel com a fila e HistoryTable com todas as rows (sem filtros)", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    expect(screen.getByTestId("QueuePanel").textContent).toBe("queueCount:2");
    expect(screen.getByTestId("rowsCount").textContent).toBe("3");
    expect(screen.getByTestId("rowIds").textContent).toBe("1,2,3");
  });

  it("filtra por search no nome do cliente", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setSearchAlpha"));

    expect(screen.getByTestId("rowsCount").textContent).toBe("1");
    expect(screen.getByTestId("rowIds").textContent).toBe("1");
  });

  it("filtra por search no telefone", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setSearchPhone"));

    // "3199" bate nos envios 1 e 2
    expect(screen.getByTestId("rowsCount").textContent).toBe("2");
    expect(screen.getByTestId("rowIds").textContent).toBe("1,2");
  });

  it("filtra por search no título da mensagem", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setSearchTitle"));

    // "promo" bate nos envios 1 e 3 (Promo Natal / Promo Verão)
    expect(screen.getByTestId("rowsCount").textContent).toBe("2");
    expect(screen.getByTestId("rowIds").textContent).toBe("1,3");
  });

  it("filtra por status_entrega", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setStatusDelivered"));

    // delivered: 1 e 3
    expect(screen.getByTestId("rowsCount").textContent).toBe("2");
    expect(screen.getByTestId("rowIds").textContent).toBe("1,3");
  });

  it("combina search + statusFilter", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setSearchTitle")); // promo => 1 e 3
    fireEvent.click(screen.getByText("setStatusDelivered")); // delivered => 1 e 3

    expect(screen.getByTestId("rowsCount").textContent).toBe("2");
    expect(screen.getByTestId("rowIds").textContent).toBe("1,3");

    // agora restringe por cliente alpha (só o 1)
    fireEvent.click(screen.getByText("setSearchAlpha"));
    expect(screen.getByTestId("rowsCount").textContent).toBe("1");
    expect(screen.getByTestId("rowIds").textContent).toBe("1");
  });

  it("clearStatus remove filtro de status", () => {
    const { history, queue } = makeData();
    render(<HistoryClient history={history} queue={queue} />);

    fireEvent.click(screen.getByText("setStatusDelivered"));
    expect(screen.getByTestId("rowIds").textContent).toBe("1,3");

    fireEvent.click(screen.getByText("clearStatus"));
    expect(screen.getByTestId("rowIds").textContent).toBe("1,2,3");
  });
});
