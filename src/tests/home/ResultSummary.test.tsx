import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import ResultSummary from "@/components/home/ResultSummary";

describe("ResultSummary", () => {
  it("não renderiza nada quando summary é null/undefined", () => {
    const { container, rerender } = render(<ResultSummary summary={null} />);
    expect(container.firstChild).toBeNull();

    rerender(<ResultSummary summary={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza totais quando summary existe", () => {
    render(
      <ResultSummary
        summary={{
          total: 10,
          successCount: 7,
          failCount: 3,
          details: [],
        }}
      />
    );

    expect(screen.getByText("Resumo de Envio")).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    expect(screen.getByText(/Sucessos:/)).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();

    expect(screen.getByText(/Falhas:/)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // sem details => não mostra o bloco <details>
    expect(screen.queryByText(/Ver Detalhes/)).toBeNull();
  });

  it("renderiza detalhes (summary + tabela) quando details tem itens", () => {
    render(
      <ResultSummary
        summary={{
          total: 2,
          successCount: 1,
          failCount: 1,
          details: [
            {
              clientId: 42,
              telefone: "31999999999",
              ok: true,
              data: { data: { detail: "Enviado com sucesso" } },
            },
            {
              clientId: 99,
              telefone: "31988888888",
              ok: false,
              data: {}, // sem detail => fallback
            },
          ],
        }}
      />
    );

    // Cabeçalho do card
    expect(screen.getByText("Resumo de Envio")).toBeInTheDocument();

    // Summary do <details>
    expect(screen.getByText("Ver Detalhes (2)")).toBeInTheDocument();

    // Headers da tabela
    expect(screen.getByText("Cliente ID")).toBeInTheDocument();
    expect(screen.getByText("Telefone")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Mensagem")).toBeInTheDocument();

    // Linha 1
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("31999999999")).toBeInTheDocument();
    expect(screen.getByText("Sucesso")).toBeInTheDocument();
    expect(screen.getByText("Enviado com sucesso")).toBeInTheDocument();

    // Linha 2
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("31988888888")).toBeInTheDocument();
    expect(screen.getByText("Erro")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
