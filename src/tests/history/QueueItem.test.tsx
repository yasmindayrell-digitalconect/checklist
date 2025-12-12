import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import QueueItem from "@/components/history/QueueItem";

describe("QueueItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // fixa o "agora" para testes determinísticos
    vi.setSystemTime(new Date("2025-12-12T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza cliente, telefone, título e status", () => {
    render(
      <QueueItem
        row={{
          id_fila: 1,
          status: "pending",
          created_at: "2025-12-12T11:00:00.000Z",
          to_phone: "31999999999",
          clientes: { Cliente: "Cliente A" },
          mensagens: { titulo: "Template X" },
        } as any}
      />
    );

    expect(screen.getByText("Cliente A")).toBeInTheDocument();
    expect(screen.getByText("31999999999")).toBeInTheDocument();
    expect(screen.getByText("Template X")).toBeInTheDocument();

    // status traduzido
    expect(screen.getByText("pendente")).toBeInTheDocument();

    // texto de tempo relativo
    expect(screen.getByText(/Atualizado há/)).toBeInTheDocument();
  });

  it("usa last_attempt_at quando existir (prioridade sobre created_at)", () => {
    render(
      <QueueItem
        row={{
          id_fila: 2,
          status: "processing",
          created_at: "2025-12-12T08:00:00.000Z",
          last_attempt_at: "2025-12-12T11:55:00.000Z",
          to_phone: "31111111111",
          clientes: { Cliente: "Cliente B" },
          mensagens: { titulo: "Template Y" },
        } as any}
      />
    );

    expect(screen.getByText("processando")).toBeInTheDocument();

    // como last_attempt_at é recente, deve mostrar algo tipo "há 5 minutos"
    expect(screen.getByText(/Atualizado há/)).toBeInTheDocument();
  });

  it("mostra fallback '—' quando cliente ou título não existem", () => {
    render(
      <QueueItem
        row={{
          id_fila: 3,
          status: "failed",
          created_at: "2025-12-12T10:00:00.000Z",
          to_phone: "000",
          clientes: null,
          mensagens: null,
        } as any}
      />
    );

    // clientName e title viram "—"
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText("falhou")).toBeInTheDocument();
    expect(screen.getByText("000")).toBeInTheDocument();
  });

  it("mostra status 'concluído' quando status é done", () => {
    render(
      <QueueItem
        row={{
          id_fila: 4,
          status: "done",
          created_at: "2025-12-12T09:00:00.000Z",
          to_phone: "32222222222",
          clientes: { Cliente: "Cliente C" },
          mensagens: { titulo: "Template Z" },
        } as any}
      />
    );

    expect(screen.getByText("concluído")).toBeInTheDocument();
  });

  it("quando status não está no map, mostra o valor original", () => {
    render(
      <QueueItem
        row={{
          id_fila: 5,
          status: "weird_status",
          created_at: "2025-12-12T09:00:00.000Z",
          to_phone: "333",
          clientes: { Cliente: "Cliente D" },
          mensagens: { titulo: "Template W" },
        } as any}
      />
    );

    expect(screen.getByText("weird_status")).toBeInTheDocument();
  });

  it("mostra '—' quando não existe nenhuma data (created_at nem last_attempt_at)", () => {
    render(
      <QueueItem
        row={{
          id_fila: 6,
          status: "pending",
          to_phone: "444",
          clientes: { Cliente: "Cliente E" },
          mensagens: { titulo: "Template Q" },
        } as any}
      />
    );

    expect(screen.getByText("Atualizado —")).toBeInTheDocument();
  });
});
