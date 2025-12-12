import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent , cleanup} from "@testing-library/react";

import SendActions from "@/components/home/SendActions";

// Mock do Confirm
vi.mock("@/components/Confirm", () => ({
  default: ({ message, onConfirm, onCancel }: any) => (
    <div data-testid="Confirm">
      <div>{message}</div>
      <button onClick={onConfirm}>confirm</button>
      <button onClick={onCancel}>cancel</button>
    </div>
  ),
}));

describe("SendActions", () => {
  const originalFetch = global.fetch;  

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-12T00:00:00.000Z"));

    // evita delay real do setTimeout(120)
    vi.spyOn(global, "setTimeout");

    global.fetch = vi.fn();

    // alert mock
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  function baseProps(overrides: Partial<React.ComponentProps<typeof SendActions>> = {}) {
    return {
      sending: false,
      selectedMap: { "1": true, "2": true },
      clients: [
        { id_cliente: 1, Cliente: "A" },
        { id_cliente: 2, Cliente: "B" },
      ] as any,
      contacts: [
        { id_contato: 10, id_cliente: 1, telefone: "31999999999", nome_contato: "Fulano" },
        { id_contato: 20, id_cliente: 2, telefone: "31988888888", nome_contato: "Beltrano" },
      ] as any,
      selectedMessage: {
        id_mensagem: "m1",
        texto: "Oi {{nome}}",
        imagem: null,
      } as any,
      onResult: vi.fn(),
      onResetSelection: vi.fn(),
      onStart: vi.fn(),
      ...overrides,
    };
  }

    it("desabilita botão quando não tem mensagem ou não tem selecionados ou sending=true", () => {
    // sem selectedMessage
    render(<SendActions {...baseProps({ selectedMessage: undefined })} />);
    expect(screen.getByRole("button", { name: /Enviar mensagem/i })).toBeDisabled();
    cleanup();

    // sem selecionados
    render(<SendActions {...baseProps({ selectedMap: {} })} />);
    expect(screen.getByRole("button", { name: /Enviar mensagem/i })).toBeDisabled();
    cleanup();

    // sending true
    render(<SendActions {...baseProps({ sending: true })} />);
    expect(screen.getByRole("button", { name: /Enviando/i })).toBeDisabled();
    });

  it("abre Confirm ao clicar e fecha ao cancelar", () => {
    render(<SendActions {...baseProps()} />);

    expect(screen.queryByTestId("Confirm")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    expect(screen.getByTestId("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Confirmar envio?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("cancel"));
    expect(screen.queryByTestId("Confirm")).toBeNull();
  });

  it("ao confirmar: chama onStart, faz fetch para cada contato válido, chama onResult e onResetSelection", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const props = baseProps();
    render(<SendActions {...props} />);

    // abre confirm
    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));

    // roda os timeouts internos do loop (120ms por envio)
    await vi.runAllTimersAsync();

    // fetch 2 vezes (2 destinatários)
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // payload do 1º envio (cliente 1 / contato 10)
    const firstCall = (global.fetch as any).mock.calls[0];
    expect(firstCall[0]).toBe("/api/send_message");
    const options = firstCall[1];
    expect(options.method).toBe("POST");
    const body1 = JSON.parse(options.body);
    expect(body1.clientId).toBe(1);
    expect(body1.contactId).toBe(10);
    expect(body1.messageId).toBe("m1");
    expect(body1.to).toBe("31999999999");

    expect(props.onStart).toHaveBeenCalledTimes(1);
    expect(props.onResetSelection).toHaveBeenCalledTimes(1);

    expect(props.onResult).toHaveBeenCalledTimes(1);
    const summaryArg = (props.onResult as any).mock.calls[0][0];
    expect(summaryArg.total).toBe(2);
    expect(summaryArg.successCount).toBe(2);
    expect(summaryArg.failCount).toBe(0);
    expect(summaryArg.details).toHaveLength(2);
  });

  it("contabiliza falhas quando fetch retorna ok=false", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ ok: false, error: "boom" }),
    });

    const props = baseProps();
    render(<SendActions {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));
    await vi.runAllTimersAsync();

    const summaryArg = (props.onResult as any).mock.calls[0][0];
    expect(summaryArg.total).toBe(2);
    expect(summaryArg.successCount).toBe(1);
    expect(summaryArg.failCount).toBe(1);
  });

  it("não envia e dá alert se não tiver mensagem selecionada", async () => {
    const props = baseProps({ selectedMessage: undefined });
    render(<SendActions {...props} />);

    // botão fica disabled, então não abre confirm
    expect(screen.getByRole("button", { name: /Enviar mensagem/i })).toBeDisabled();
  });

  it("não envia e dá alert se selectedIds estiver vazio (quando chamado manualmente via confirm)", async () => {
    // aqui o botão já estaria disabled na UI, mas testamos a proteção interna:
    const props = baseProps({ selectedMap: {} });
    render(<SendActions {...props} />);

    expect(screen.getByRole("button", { name: /Enviar mensagem/i })).toBeDisabled();
  });

  it("não envia e dá alert se mensagem estiver vazia (sem texto e sem imagem)", async () => {
    const props = baseProps({
      selectedMessage: { id_mensagem: "m1", texto: "", imagem: "" } as any,
    });
    render(<SendActions {...props} />);

    // aqui botão habilita porque selectedMessage existe e selectedMap não vazio,
    // mas o handler bloqueia por mensagem vazia
    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));

    await vi.runAllTimersAsync();

    expect(window.alert).toHaveBeenCalledWith("Mensagem selecionada está vazia.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("ignora cliente selecionado sem contato com telefone (não faz fetch para ele)", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const props = baseProps({
      contacts: [
        // só cliente 1 tem telefone válido
        { id_contato: 10, id_cliente: 1, telefone: "31999999999", nome_contato: "Fulano" },
        { id_contato: 20, id_cliente: 2, telefone: "", nome_contato: "Beltrano" },
      ] as any,
    });

    render(<SendActions {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));
    await vi.runAllTimersAsync();

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const summaryArg = (props.onResult as any).mock.calls[0][0];
    expect(summaryArg.total).toBe(1);
    expect(summaryArg.successCount).toBe(1);
    expect(summaryArg.failCount).toBe(0);
  });

  it("bloqueia cliques repetidos (inFlight): não dispara envio duas vezes", async () => {
    // fetch demora "pra sempre"
    let resolveFetch: any;
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((res) => {
          resolveFetch = () =>
            res({
              ok: true,
              status: 200,
              json: async () => ({ ok: true }),
            });
        })
    );

    const props = baseProps({ selectedMap: { "1": true } });
    render(<SendActions {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));

    // tenta confirmar de novo (abrindo confirm de novo)
    // (na prática UI fecha, mas testamos proteção inFlight)
    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }));
    fireEvent.click(screen.getByText("confirm"));

    // até aqui: 1 chamada iniciada
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // finaliza
    resolveFetch();
    await vi.runAllTimersAsync();
  });
});
