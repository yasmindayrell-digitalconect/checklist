import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Mock simples do Listbox do headlessui
    vi.mock("@headlessui/react", () => {
    const React = require("react");
    const Ctx = React.createContext(null);

    function Listbox({ value, onChange, children }: any) {
        return <Ctx.Provider value={{ value, onChange }}>{children}</Ctx.Provider>;
    }

    Listbox.Button = function Button({ children, ...props }: any) {
        return (
        <button type="button" {...props}>
            {children}
        </button>
        );
    };

    Listbox.Options = function Options({ children, ...props }: any) {
        return <div {...props}>{children}</div>;
    };

    Listbox.Option = function Option({ value, children, className, ...props }: any) {
        const ctx = React.useContext(Ctx);

        const key = value?.value === "" ? "all" : String(value?.value ?? "unknown");

        // ✅ se className vier como função (padrão do HeadlessUI), resolve pra string
        const resolvedClassName =
        typeof className === "function" ? className({ active: false }) : className;

        return (
        <button
            type="button"
            data-testid={`opt-${key}`}
            className={resolvedClassName}
            {...props}
            onClick={() => ctx?.onChange?.(value)}
        >
            {children}
        </button>
        );
    };

    return { Listbox };
    });


// ✅ Import depois do mock
import HistoryFilters from "@/components/history/HistoryFilters";

describe("HistoryFilters", () => {
  it("renderiza input com valor e chama setSearch no onChange", () => {
    const setSearch = vi.fn();
    const setStatusFilter = vi.fn();

    render(
      <HistoryFilters
        search="abc"
        setSearch={setSearch}
        statusFilter=""
        setStatusFilter={setStatusFilter}
      />
    );

    const input = screen.getByLabelText("Buscar") as HTMLInputElement;
    expect(input.value).toBe("abc");

    fireEvent.change(input, { target: { value: "alpha" } });
    expect(setSearch).toHaveBeenCalledWith("alpha");
  });

  it("mostra o label correto do status selecionado", () => {
    render(
      <HistoryFilters
        search=""
        setSearch={vi.fn()}
        statusFilter="delivered"
        setStatusFilter={vi.fn()}
      />
    );

    const deliveredButtons = screen.getAllByRole("button", { name: "Entregue" });
    expect(deliveredButtons[0]).toBeInTheDocument(); // Listbox.Button
  });

  it("ao escolher uma opção, chama setStatusFilter com o value correto", () => {
    const setStatusFilter = vi.fn();

    render(
      <HistoryFilters
        search=""
        setSearch={vi.fn()}
        statusFilter=""
        setStatusFilter={setStatusFilter}
      />
    );

    // ✅ clica na OPTION "Falhou" (value failed)
    fireEvent.click(screen.getByTestId("opt-failed"));
    expect(setStatusFilter).toHaveBeenCalledWith("failed");

    // ✅ clica na OPTION "Todos" (value "")
    fireEvent.click(screen.getByTestId("opt-all"));
    expect(setStatusFilter).toHaveBeenCalledWith("");
  });
});
