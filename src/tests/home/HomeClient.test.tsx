import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Mocks dos componentes filhos (pra testar só o HomeClient)
vi.mock("@/components/home/FiltersBar", () => ({
  default: (props: any) => (
    <div data-testid="FiltersBar">
      <button onClick={() => props.setMinCredit("1500")}>setMinCredit1500</button>
      <button onClick={() => props.setSeller("joao")}>setSellerJoao</button>
      <button onClick={() => props.setMinDaysSince("30")}>setMinDays30</button>
      <button onClick={() => props.setLastInteraction("2")}>setLastInteraction2</button>

      <div data-testid="FiltersState">
        minCredit={props.minCredit} seller={props.seller} minDaysSince={props.minDaysSince} lastInteraction={props.lastInteraction}
      </div>
    </div>
  ),
}));

vi.mock("@/components/home/ClientsTable", () => ({
  default: (props: any) => (
    <div data-testid="ClientsTable">
      <div data-testid="ClientsOrder">
        {(props.clients || []).map((c: any) => c.id_cliente).join(",")}
      </div>

      <div data-testid="AllFilteredSelected">
        {String(props.allFilteredSelected)}
      </div>

      <button onClick={() => props.onToggleSelectAll()}>toggleSelectAll</button>

      {(props.clients || []).map((c: any) => (
        <button
          key={c.id_cliente}
          onClick={() => props.onToggle(c.id_cliente)}
        >
          toggleOne:{c.id_cliente}
        </button>
      ))}

      <div data-testid="SelectedKeys">
        {Object.keys(props.selectedMap || {}).sort().join(",")}
      </div>
    </div>
  ),
}));

vi.mock("@/components/home/MessagesPanel", () => ({
  default: (props: any) => (
    <div data-testid="MessagesPanel">
      <div data-testid="MsgSearch">{props.search}</div>
      <div data-testid="SelectedMsgId">{props.selectedMessageID}</div>

      <button onClick={() => props.setSearch("promo")}>setSearchPromo</button>
      <button onClick={() => props.onSelectMessage("m1")}>selectM1</button>
      <button onClick={() => props.onSelectMessage("m2")}>selectM2</button>
    </div>
  ),
}));

vi.mock("@/components/home/MessagePreview", () => ({
  default: ({ message }: any) => (
    <div data-testid="MessagePreview">
      {message ? `preview:${message.id_mensagem}` : "preview:none"}
    </div>
  ),
}));

vi.mock("@/components/home/ResultSummary", () => ({
  default: ({ summary }: any) => (
    <div data-testid="ResultSummary">
      {summary ? `summary:${summary.status}` : "summary:none"}
    </div>
  ),
}));

vi.mock("@/components/home/SendActions", () => ({
  default: (props: any) => (
    <div data-testid="SendActions">
      <div data-testid="SendSelectedMsg">
        {props.selectedMessage ? props.selectedMessage.id_mensagem : ""}
      </div>

      <button onClick={() => props.onResult({ status: "ok" })}>emitResultOk</button>
      <button onClick={() => props.onResetSelection()}>resetAfterSend</button>
    </div>
  ),
}));

// ✅ Import do componente real (depois dos mocks)
import HomeClient from "@/components/home/HomeClient";

function makeData() {
  const Clients: any[] = [
    {
      id_cliente: 1,
      Cliente: "Alpha",
      Cidade: "bh",
      Vendedor: "Maria",
      Limite: 1000,
      data_ultima_compra: "2025-12-01",
      ultima_interacao: "2025-12-10T00:00:00.000Z",
    },
    {
      id_cliente: 2,
      Cliente: "Beta",
      Cidade: "sp",
      Vendedor: "Pedro",
      Limite: 500,
      data_ultima_compra: "2025-11-01",
      ultima_interacao: null,
    },
    {
      id_cliente: 3,
      Cliente: "Gamma",
      Cidade: "rj",
      Vendedor: "Joao",
      Limite: 2000,
      data_ultima_compra: "2025-12-11",
      ultima_interacao: "2025-12-11T00:00:00.000Z",
    },
  ];

  const Messages: any[] = [
    { id_mensagem: "m1", titulo: "Msg 1", status: "approved" },
    { id_mensagem: "m2", titulo: "Msg 2", status: "approved" },
  ];

  const Contacts: any[] = [{ id_cliente: 1 }, { id_cliente: 2 }, { id_cliente: 3 }];

  return { Clients, Messages, Contacts };
}

describe("HomeClient", () => {
  beforeEach(() => {
    // Congela tempo pra daysSince ficar determinístico
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-12T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza e ordena clientes por ultima_interacao (mais recente primeiro; null por último)", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    // Ordenação esperada:
    // id 3 (2025-12-11) -> id 1 (2025-12-10) -> id 2 (null)
    expect(screen.getByTestId("ClientsOrder").textContent).toBe("3,1,2");
  });

  it("aplica filtro por minCredit via FiltersBar mock", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    fireEvent.click(screen.getByText("setMinCredit1500"));

    // Só o cliente 3 tem Limite >= 1500
    expect(screen.getByTestId("ClientsOrder").textContent).toBe("3");
  });

  it("aplica filtro por vendedor via FiltersBar mock", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    fireEvent.click(screen.getByText("setSellerJoao"));

    expect(screen.getByTestId("ClientsOrder").textContent).toBe("3");
  });

  it("toggleSelectAll seleciona todos filtrados e depois desmarca todos", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    // inicialmente nenhum
    expect(screen.getByTestId("AllFilteredSelected").textContent).toBe("false");

    fireEvent.click(screen.getByText("toggleSelectAll"));
    expect(screen.getByTestId("AllFilteredSelected").textContent).toBe("true");

    // O SelectedMap deve conter 3 ids
    const selected1 = screen.getByTestId("SelectedKeys").textContent || "";
    expect(selected1.split(",").length).toBe(3);

    fireEvent.click(screen.getByText("toggleSelectAll"));
    expect(screen.getByTestId("AllFilteredSelected").textContent).toBe("false");
    expect(screen.getByTestId("SelectedKeys").textContent).toBe("");
  });

  it("toggleOne seleciona e deseleciona um cliente", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    fireEvent.click(screen.getByText("toggleOne:1"));
    expect(screen.getByTestId("SelectedKeys").textContent).toContain("1");

    fireEvent.click(screen.getByText("toggleOne:1"));
    expect(screen.getByTestId("SelectedKeys").textContent).not.toContain("1");
  });

  it("seleciona mensagem pelo MessagesPanel e reflete no MessagePreview + SendActions", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    expect(screen.getByTestId("MessagePreview").textContent).toBe("preview:none");

    fireEvent.click(screen.getByText("selectM1"));
    expect(screen.getByTestId("MessagePreview").textContent).toBe("preview:m1");
    expect(screen.getByTestId("SendSelectedMsg").textContent).toBe("m1");

    fireEvent.click(screen.getByText("selectM2"));
    expect(screen.getByTestId("MessagePreview").textContent).toBe("preview:m2");
    expect(screen.getByTestId("SendSelectedMsg").textContent).toBe("m2");
  });

  it("recebe resultado do SendActions e mostra no ResultSummary", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    expect(screen.getByTestId("ResultSummary").textContent).toBe("summary:none");

    fireEvent.click(screen.getByText("emitResultOk"));
    expect(screen.getByTestId("ResultSummary").textContent).toBe("summary:ok");
  });

  it("resetAfterSend limpa seleção + messageID + busca", () => {
    const { Clients, Messages, Contacts } = makeData();
    render(<HomeClient Clients={Clients} Messages={Messages} Contacts={Contacts} />);

    // seta busca e mensagem e seleção
    fireEvent.click(screen.getByText("setSearchPromo"));
    fireEvent.click(screen.getByText("selectM1"));
    fireEvent.click(screen.getByText("toggleOne:1"));

    expect(screen.getByTestId("MsgSearch").textContent).toBe("promo");
    expect(screen.getByTestId("SelectedMsgId").textContent).toBe("m1");
    expect(screen.getByTestId("SelectedKeys").textContent).toContain("1");

    // reseta
    fireEvent.click(screen.getByText("resetAfterSend"));

    expect(screen.getByTestId("MsgSearch").textContent).toBe("");
    expect(screen.getByTestId("SelectedMsgId").textContent).toBe("");
    expect(screen.getByTestId("SelectedKeys").textContent).toBe("");
    expect(screen.getByTestId("MessagePreview").textContent).toBe("preview:none");
  });
});
