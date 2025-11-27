import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageForm from "@/components/messages/MessageForm";
import { describe, it, expect } from "vitest";

function makeFile(name: string, sizeBytes: number, type = "image/png") {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe("MessageForm", () => {
  it("valida campos obrigatórios e mostra erros", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<MessageForm onSubmit={onSubmit} submitting={false} />);

    // tenta enviar sem preencher
    await user.click(screen.getByRole("button", { name: /enviar para aprovação/i }));

    // aparecem erros
    expect(await screen.findByText(/Selecione a categoria/i)).toBeInTheDocument();
    expect(await screen.findByText((t) => /título/i.test(t))).toBeInTheDocument();
    expect(await screen.findByText((t) => /texto/i.test(t))).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("bloqueia imagem maior que 5MB", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<MessageForm onSubmit={onSubmit} submitting={false} />);

    // preenche campos obrigatórios
    await user.selectOptions(screen.getByLabelText(/Categoria/i), "AVISO");
    await user.type(screen.getByLabelText(/Título/i), "Título");
    await user.type(screen.getByLabelText(/Corpo/i), "Texto");

    // anexa imagem de 6MB
    const bigFile = makeFile("big.png", 6 * 1024 * 1024);
    const input = screen.getByLabelText(/Imagem/i);
    await user.upload(input, bigFile);

    await user.click(screen.getByRole("button", { name: /enviar/i }));
    expect(await screen.findByText(/Imagem acima de 5 MB/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("mostra preview quando escolhe imagem", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<MessageForm onSubmit={onSubmit} submitting={false} />);

    const file = makeFile("ok.png", 1000);
    const input = screen.getByLabelText(/Imagem/i);
    await user.upload(input, file);

    // preview presente
    expect(await screen.findByAltText(/preview/i)).toBeInTheDocument();
  });

  it("envia formulário válido e chama onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<MessageForm onSubmit={onSubmit} submitting={false} />);

    await user.selectOptions(screen.getByLabelText(/categoria/i), "PROMOÇÃO");
    await user.type(screen.getByLabelText(/título/i), "Promo boa");
    await user.type(screen.getByLabelText(/corpo/i), "Um texto legal");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      // o primeiro arg deve ser um FormData
      const arg = onSubmit.mock.calls[0][0];
      expect(arg).toBeInstanceOf(FormData);
    });
  });

  it("desabilita botão ao enviar (submitting=true)", async () => {
    const { rerender } = render(<MessageForm onSubmit={vi.fn()} submitting={true} />);
    const btn = screen.getByRole("button", { name: /enviando/i });
    expect(btn).toBeDisabled();

    // quando voltar pra false, habilita
    rerender(<MessageForm onSubmit={vi.fn()} submitting={false} />);
    expect(screen.getByRole("button", { name: /enviar/i })).not.toBeDisabled();
  });
});
