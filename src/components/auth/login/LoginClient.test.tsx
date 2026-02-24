/** @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginClient, * as LoginMod from "./LoginClient";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

beforeEach(() => {
  replaceMock.mockReset();
  refreshMock.mockReset();
  vi.restoreAllMocks();
});

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("<LoginClient />", () => {
  it("mostra erro quando API responde !ok", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ error: "Usuário não encontrado" }, 401)
    );

    render(<LoginClient />);

    await user.type(screen.getByLabelText(/Cadastro ID/i), "123");
    await user.type(screen.getByLabelText(/Senha/i), "abc");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(await screen.findByText("Usuário não encontrado")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redireciona quando login ok", async () => {
    const user = userEvent.setup();

    const redirectSpy = vi
      .spyOn(LoginMod.nav, "hardRedirect")
      .mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ redirectTo: "/qualquer-rota" }, 200)
    );

    render(<LoginClient />);

    await user.type(screen.getByLabelText(/Cadastro ID/i), "123");
    await user.type(screen.getByLabelText(/Senha/i), "abc");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    await waitFor(() => {
      expect(redirectSpy).toHaveBeenCalledWith(expect.stringMatching(/^\/.*/));
    });
  });

    it("mostra 'Falha no login' se fetch der erro/rejeitar", async () => {
      const user = userEvent.setup();

      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

      render(<LoginClient />);

      await user.type(screen.getByLabelText(/Cadastro ID/i), "123");
      await user.type(screen.getByLabelText(/Senha/i), "abc");
      await user.click(screen.getByRole("button", { name: /Entrar/i }));

      expect(await screen.findByText("Falha no login")).toBeInTheDocument();
    });
  });