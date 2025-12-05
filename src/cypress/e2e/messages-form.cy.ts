describe("Messages page - create message flow", () => {
  it("sends successfully and shows success flash", () => {
    cy.intercept("POST", "/api/messages", {
      statusCode: 201,
      body: { success: true },
      headers: { "Content-Type": "application/json" }
    }).as("createMessage");

    cy.visit("/messages");

    cy.findByLabelText(/categoria/i).select("AVISO");
    cy.findByLabelText(/título/i).type("Título Cypress");
    cy.findByLabelText(/corpo/i).type("Corpo Cypress");

    cy.findByRole("button", { name: /enviar/i }).click();
    cy.wait("@createMessage");

    cy.contains(/mensagem enviada para aprovação/i).should("be.visible");

    cy.findByLabelText(/título/i).should("have.value", "");
    cy.findByLabelText(/corpo/i).should("have.value", "");
  });

  it("shows error flash on server failure", () => {
    cy.intercept("POST", "/api/messages", {
      statusCode: 500,
      body: { error: "Falha" },
      headers: { "Content-Type": "application/json" }
    }).as("createMessageFail");

    cy.visit("/messages");

    cy.findByLabelText(/categoria/i).select("PROMOÇÃO");
    cy.findByLabelText(/título/i).type("Erro Título");
    cy.findByLabelText(/corpo/i).type("Erro Corpo");

    cy.findByRole("button", { name: /enviar/i }).click();
    cy.wait("@createMessageFail");

    cy.contains(/falha ao enviar/i).should("be.visible");
  });
});
