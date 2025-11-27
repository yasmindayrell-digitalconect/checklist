import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessagesClient from "@/components/messages/MessagesClient";
import type { Message } from "@/components/messages/types";
import { describe, it, expect } from "vitest";

const messages: Message[] = [
  { id_mensagem: "1", titulo: "T1", texto: "x", imagem: null, categoria: "AVISO", status: "pending" },
  { id_mensagem: "2", titulo: "T2", texto: "y", imagem: null, categoria: "PROMOÇÃO", status: "rejected" },
];

describe("MessagesClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envia com sucesso e mostra flash de sucesso", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(
      JSON.stringify({ success: true }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    ) as any);

    render(<MessagesClient messages={messages} />);

    await user.selectOptions(screen.getByLabelText(/categoria/i), "AVISO");
    await user.type(screen.getByLabelText(/título/i), "OK título");
    await user.type(screen.getByLabelText(/corpo/i), "OK corpo");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/Mensagem enviada para aprovação/i)).toBeInTheDocument();

    // campos resetados
    await waitFor(() => {
      expect((screen.getByLabelText(/título/i) as HTMLInputElement).value).toBe("");
      expect((screen.getByLabelText(/corpo/i) as HTMLTextAreaElement).value).toBe("");
    });
  });

  it("mostra flash de erro quando API falha", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(
      JSON.stringify({ error: "Falha ao enviar" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    ) as any);

    render(<MessagesClient messages={messages} />);

    await user.selectOptions(screen.getByLabelText(/categoria/i), "PROMOÇÃO");
    await user.type(screen.getByLabelText(/título/i), "ERR título");
    await user.type(screen.getByLabelText(/corpo/i), "ERR corpo");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/Falha ao enviar/i)).toBeInTheDocument();
  });
});
