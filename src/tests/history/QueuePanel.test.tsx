import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import QueuePanel from "@/components/history/QueuePanel";

// ✅ Mock do QueueItem pra não depender do teste dele aqui
vi.mock("@/components/history/QueueItem", () => ({
  default: ({ row }: any) => (
    <li data-testid="QueueItem">item-{row?.id_fila}-{row?.status}</li>
  ),
}));

describe("QueuePanel", () => {
  it("mostra estado vazio quando não há itens na fila", () => {
    render(<QueuePanel queue={[]} />);

    expect(screen.getByText("Fila de envios")).toBeInTheDocument();
    expect(
      screen.getByText("Mensagens aguardando envio ou em processamento.")
    ).toBeInTheDocument();

    // total no canto
    expect(screen.getByText("0")).toBeInTheDocument();

    // vazio
    expect(
      screen.getByText("Nenhum item na fila no momento.")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("QueueItem")).toBeNull();
  });

  it("renderiza as seções Processando e Pendentes e mostra total correto", () => {
    const queue: any[] = [
      { id_fila: 1, status: "pending" },
      { id_fila: 2, status: "processing" },
      { id_fila: 3, status: "pending" },
      { id_fila: 4, status: "failed" }, // deve ser ignorado (não entra em nenhuma seção)
      { id_fila: 5, status: "done" },   // deve ser ignorado
    ];

    render(<QueuePanel queue={queue} />);

    // total é o tamanho do array inteiro, mesmo com failed/done
    expect(screen.getByText("5")).toBeInTheDocument();

    // seções
    expect(screen.getByText("Processando")).toBeInTheDocument();
    expect(screen.getByText("Pendentes")).toBeInTheDocument();

    // QueueItem renderizados apenas para processing/pending (3 itens)
    const items = screen.getAllByTestId("QueueItem");
    expect(items).toHaveLength(3);

    // confirma quais apareceram
    expect(screen.getByText("item-2-processing")).toBeInTheDocument();
    expect(screen.getByText("item-1-pending")).toBeInTheDocument();
    expect(screen.getByText("item-3-pending")).toBeInTheDocument();

    // não deve renderizar failed/done
    expect(screen.queryByText("item-4-failed")).toBeNull();
    expect(screen.queryByText("item-5-done")).toBeNull();
  });

  it("não renderiza a seção Processando se não houver items processing", () => {
    const queue: any[] = [
      { id_fila: 1, status: "pending" },
      { id_fila: 2, status: "pending" },
    ];

    render(<QueuePanel queue={queue} />);

    expect(screen.queryByText("Processando")).toBeNull();
    expect(screen.getByText("Pendentes")).toBeInTheDocument();

    const items = screen.getAllByTestId("QueueItem");
    expect(items).toHaveLength(2);
  });

  it("não renderiza a seção Pendentes se não houver items pending", () => {
    const queue: any[] = [
      { id_fila: 1, status: "processing" },
      { id_fila: 2, status: "processing" },
    ];

    render(<QueuePanel queue={queue} />);

    expect(screen.getByText("Processando")).toBeInTheDocument();
    expect(screen.queryByText("Pendentes")).toBeNull();

    const items = screen.getAllByTestId("QueueItem");
    expect(items).toHaveLength(2);
  });
});
