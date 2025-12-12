import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import MessagePreview from "@/components/home/MessagePreview";

describe("MessagePreview", () => {
  it("mostra texto de placeholder quando não há mensagem selecionada", () => {
    render(<MessagePreview />);

    expect(screen.getByText("Mensagem Selecionada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Não há mensagem selecionada. Escolha uma no painel a direita."
      )
    ).toBeInTheDocument();
  });

  it("mostra título e texto quando há mensagem selecionada", () => {
    render(
      <MessagePreview
        message={{
          id_mensagem: "m1",
          titulo: "Promoção do dia",
          texto: "Olá {{nome}}, temos uma oferta pra você!",
        } as any}
      />
    );

    expect(screen.getByText("Mensagem Selecionada")).toBeInTheDocument();
    expect(screen.getByText("Promoção do dia")).toBeInTheDocument();
    expect(
      screen.getByText("Olá {{nome}}, temos uma oferta pra você!")
    ).toBeInTheDocument();

    // garante que o placeholder NÃO aparece quando tem message
    expect(
      screen.queryByText(
        "Não há mensagem selecionada. Escolha uma no painel a direita."
      )
    ).toBeNull();
  });
});
