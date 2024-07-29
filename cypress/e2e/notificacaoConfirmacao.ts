import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { Admin } from '../fixtures/users.json';

const baseUrl = "http://localhost:3000";
const serverBaseUrl = "http://localhost:3333";

Given('O usuário de email "admin@gmail.com" está logado', () => {
    cy.visit(baseUrl);

    cy.get("#navbarLoginButton")
        .click();

    cy.get("#emailInput")
        .type(Admin.email);

    cy.get("#senhaInput")
        .type(Admin.senha);

    cy.wait(200);

    cy.get("#loginButton")
        .click();

    cy.intercept("GET", serverBaseUrl + "/api/auth/me").as("LoggedInRequest");

    cy.wait("@LoggedInRequest", { timeout: 20000 });

    cy.get("#loggedInMessage")
        .should("exist");
});

When('O usuário está na página Carrinho', () => {
    cy.wait(1000);

    cy.get('[xmlns="http://www.w3.org/2000/svg"]')
        .click();

    cy.wait(200);

    cy.get("#navbarCartButton")
        .click();

    cy.get("#goToCartButton")
        .click();

    cy.wait(500);
    cy.get('body').type('{esc}');
});

Then('O usuário clica em Finalizar Compra e vê a mensagem de erro "Não é possível finalizar a compra sem o CEP. Tente novamente." no popup', () => {
    cy.contains('div', 'Finalizar Compra')
        .click();

    cy.get('div.bg-white.p-6.rounded-lg.shadow-lg.w-80')
        .should('be.visible')
        .within(() => {
            cy.get('h2')
                .should('contain', 'Confirmação de Pedido');

            cy.get('p')
                .should('contain', 'Não é possível finalizar a compra sem o CEP. Tente novamente.');
        });

    cy.get('button')
        .contains('Fechar')
        .click();
});

When('O usuário calcula o tempo de entrega com um CEP válido "50740-560"', () => {
    cy.get('input[placeholder="Digite seu CEP"]')
        .type("50740-560");

    cy.contains('div', 'Calcular')
        .click();

});

Then('O usuário clica em Finalizar Compra', () => {
    cy.contains('div', 'Finalizar Compra')
        .click();
});

Then('O usuário vê uma mensagem de confirmação de pedido "Pedido finalizado com sucesso! Tempo de entrega:"', () => {
    cy.get('div.bg-white.p-6.rounded-lg.shadow-lg.w-80')
        .should('be.visible')
        .within(() => {
            cy.get('h2')
                .should('contain', 'Confirmação de Pedido');

            cy.get('p')
                .should('contain', 'Pedido finalizado com sucesso! Tempo de entrega:');
        });
});
