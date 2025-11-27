import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessagesTable from "@/components/home/MessagesTable";
import type { Message } from "@/components/home/types";
import { describe, it, expect, vi } from "vitest";

const msgs: Message[] = [
  { id_mensagem: "1", titulo: "Promo A", texto: "desconto", categoria: "PROMOÇÃO", status: "approved" },
  { id_mensagem: "2", titulo: "Aviso", texto: "fechado", categoria: "AVISO", status: "pending" },
];

describe("MessagesTable", () => {
  it("filtra por texto e seleciona linha", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <MessagesTable
        messages={msgs}
        searchQuery="desconto" // bate no texto da primeira mensagem
        selectedMessageID=""
        onSelectMessage={onSelect}
      />
    );

    // aparece só a linha com "Promo A"
    expect(screen.getByText("Promo A")).toBeInTheDocument();
    expect(screen.queryByText("Aviso")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Não há mensagens com esse nome.")
    ).not.toBeInTheDocument();

    // clica e dispara callback com o ID certo
    await user.click(screen.getByText("Promo A"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });
});
