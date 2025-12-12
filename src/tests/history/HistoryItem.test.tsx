import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import HistoryItem from "@/components/history/HistoryItem";

describe("HistoryItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza cliente, telefone, título e data formatada (com created_at)", () => {
    render(
      <HistoryItem
        row={{
          id_envio: 1,
          created_at: "2025-12-12T15:04:00.000Z",
          to_phone: "31999999999",
          status_entrega: "delivered",
          clientes: { Cliente: "Alpha LTDA" },
          mensagens: { titulo: "Promo Natal" },
        } as any}
      />
    );

    expect(screen.getByText("Alpha LTDA")).toBeInTheDocument();
    expect(screen.getByText("31999999999")).toBeInTheDocument();
    expect(screen.getByText("Promo Natal")).toBeInTheDocument();

    // dd/MM HH:mm (não trava hora por causa do TZ)
    expect(screen.getByText(/12\/12 \d{2}:\d{2}/)).toBeInTheDocument();

    // status traduzido: delivered -> "entregue"
    expect(screen.getByText("entregue")).toBeInTheDocument();
  });

  it("mostra fallback '—' quando cliente/título não existem", () => {
    render(
      <HistoryItem
        row={{
          id_envio: 2,
          created_at: "2025-12-12T00:00:00.000Z",
          to_phone: "000",
          status_entrega: "sent",
          clientes: null,
          mensagens: null,
        } as any}
      />
    );

    // aparecem 2 "—": clientName e title
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText("000")).toBeInTheDocument();
    expect(screen.getByText("enviado")).toBeInTheDocument();
  });

  it("não renderiza StatusPill quando status_entrega é vazio/nulo", () => {
    render(
      <HistoryItem
        row={{
          id_envio: 3,
          created_at: "2025-12-12T00:00:00.000Z",
          to_phone: "111",
          status_entrega: null,
          clientes: { Cliente: "Cliente X" },
          mensagens: { titulo: "Msg X" },
        } as any}
      />
    );

    expect(screen.queryByText("enviado")).toBeNull();
    expect(screen.queryByText("entregue")).toBeNull();
    expect(screen.queryByText("lido")).toBeNull();
    expect(screen.queryByText("falhou")).toBeNull();
  });

  it("traduz diferentes statuses", () => {
    const baseRow: any = {
      id_envio: 10,
      created_at: "2025-12-12T00:00:00.000Z",
      to_phone: "222",
      clientes: { Cliente: "C" },
      mensagens: { titulo: "T" },
    };

    const { rerender } = render(
      <HistoryItem row={{ ...baseRow, status_entrega: "failed" }} />
    );
    expect(screen.getByText("falhou")).toBeInTheDocument();

    rerender(<HistoryItem row={{ ...baseRow, status_entrega: "read" }} />);
    expect(screen.getByText("lido")).toBeInTheDocument();

    rerender(<HistoryItem row={{ ...baseRow, status_entrega: "sent" }} />);
    expect(screen.getByText("enviado")).toBeInTheDocument();
  });

  it("quando status não está no map, mostra o valor original", () => {
    render(
      <HistoryItem
        row={{
          id_envio: 4,
          created_at: "2025-12-12T00:00:00.000Z",
          to_phone: "333",
          status_entrega: "blocked_inactive",
          clientes: { Cliente: "Cliente Y" },
          mensagens: { titulo: "Msg Y" },
        } as any}
      />
    );

    expect(screen.getByText("blocked_inactive")).toBeInTheDocument();
  });

  it("quando só existe data_envio (YYYY-MM-DD), mostra apenas a data (sem hora)", () => {
    render(
      <HistoryItem
        row={{
          id_envio: 5,
          data_envio: "2025-12-12",
          to_phone: "444",
          status_entrega: "sent",
          clientes: { Cliente: "Cliente Z" },
          mensagens: { titulo: "Msg Z" },
        } as any}
      />
    );

    // ✅ só dd/MM (sem HH:mm)
    expect(screen.getByText(/^12\/12$/)).toBeInTheDocument();
  });
});
