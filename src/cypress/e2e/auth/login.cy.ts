describe("Login", () => {
  it("faz login e redireciona", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: { ok: true, redirectTo: "/crm" },
      headers: { "content-type": "application/json" },
    }).as("login");

    cy.visit("/login");

    cy.contains("Entrar").should("be.visible");

    cy.get('input[placeholder="ex: 12345"]').type("123");
    cy.get('input[type="password"]').type("abc");
    cy.contains("button", "Entrar").click();

    cy.wait("@login");
    cy.location("pathname").should("eq", "/crm");
  });

  it("mostra erro quando credenciais inválidas", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: { error: "Senha inválida" },
      headers: { "content-type": "application/json" },
    }).as("loginFail");

    cy.visit("/login");

    cy.get('input[placeholder="ex: 12345"]').type("123");
    cy.get('input[type="password"]').type("errada");
    cy.contains("button", "Entrar").click();

    cy.wait("@loginFail");
    cy.contains("Senha inválida").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });
});