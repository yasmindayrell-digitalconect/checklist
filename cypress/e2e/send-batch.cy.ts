// Pré-condições simples:
// 1) Tenha pelo menos 1 cliente na tabela (renderizado na UI)
// 2) Tenha pelo menos 1 mensagem "visível" na tabela da direita

describe("Send batch flow", () => {
  beforeEach(() => {
    // mocka a API de envio como sucesso
    cy.intercept("POST", "/api/send_message", {
      statusCode: 200,
      body: { success: true, data: { messages: [{ id: "wamid.mock" }] } }
    }).as("sendMessage");
  });

  it("filters, selects, sends and shows summary", () => {
    cy.visit("/");

    // selecionar uma mensagem na tabela da direita
    cy.contains("Messages").should("be.visible");
    // clique na primeira linha (ajuste para seu título real)
    cy.get("table").contains("td", /promo|aviso|novidade/i).first().click();

    // filtrar clientes (opcional)
    cy.findByLabelText(/minimum credit/i).clear().type("0");
    cy.findByLabelText(/days since/i).clear().type("0");

    // selecionar todos filtrados
    cy.contains(/select all filtered/i).click();

    // enviar
    cy.contains(/send to selected/i).click();

    // espera as chamadas (pode ser várias; aqui esperamos ao menos 1)
    cy.wait("@sendMessage");

    // checa resumo
    cy.contains(/summary/i).should("not.exist"); // se não tem esse título, pule
    cy.contains(/total:/i).should("exist");
    cy.contains(/success:/i).should("exist");
    cy.contains(/failures:/i).should("exist");
  });
});
