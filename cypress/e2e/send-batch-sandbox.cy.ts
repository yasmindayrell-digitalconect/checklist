describe("Send message via 360dialog Sandbox", () => {
  it("sends to one client and shows result summary", () => {
    // 1️⃣ abre a página principal
    cy.visit("/");

    // 2️⃣ seleciona uma mensagem existente (primeira encontrada)
    cy.get("table").contains("td", "teste").first().click();

    // 3️⃣ seleciona o cliente pelo telefone exato
    cy.contains("td", "556196246646")
      .parent("tr")
      .find('input[type="checkbox"]')
      .check({ force: true });

    // 4️⃣ clica no botão para enviar
    cy.contains(/send to selected/i).click();

    // 5️⃣ espera a resposta real (sem intercept)
    cy.wait(5000); // sandbox pode demorar um pouco

    // 6️⃣ valida que o resumo aparece com Sucesso ou Falhas
    cy.contains(/total:/i).should("exist");
    cy.contains(/success:/i).should("exist");
    cy.contains(/failures:/i).should("exist");

    // opcional: imprime no log do Cypress o resumo encontrado
    cy.get("details pre").then($pre => {
      cy.log("Resumo:", $pre.text());
    });
  });
});
