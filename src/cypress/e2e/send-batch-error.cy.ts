describe("Send error flow", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/send_message", {
      statusCode: 401,
      body: { success: false, status: 401, data: { detail: "Invalid D360-API-KEY" } }
    }).as("sendMessageFail");
  });

  it("shows failure count when API fails", () => {
    cy.visit("/");

    // selecionar uma mensagem
    cy.get("table").contains("td", /promo|aviso|novidade/i).first().click();

    // selecionar todos filtrados
    cy.contains(/select all filtered/i).click();

    cy.contains(/send to selected/i).click();
    cy.wait("@sendMessageFail");

    cy.contains(/failures:/i).should("exist");
  });
});
