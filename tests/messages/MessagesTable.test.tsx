import { render, screen } from "@testing-library/react";
import MessagesTable from "@/components/messages/MessagesTable";
import type { Message } from "@/components/messages/types";
import { describe, it, expect } from "vitest";

const base: Message[] = [
  { id_mensagem: "1", titulo: "A", texto: "t1", imagem: null, categoria: "AVISO", status: "pending" },
  { id_mensagem: "2", titulo: "B", texto: "t2", imagem: null, categoria: "PROMOÇÃO", status: "rejected" },
  { id_mensagem: "3", titulo: "C", texto: "t3", imagem: null, categoria: "NOVIDADE", status: "pending" },
];

describe("MessagesTable", () => {
  it("filtra por status = pending", () => {
    render(<MessagesTable messages={base} status="pending" />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando não há resultados", () => {
    render(<MessagesTable messages={base} status="approved" />);
    expect(screen.getByText(/Nenhuma mensagem encontrada/i)).toBeInTheDocument();
  });
});
