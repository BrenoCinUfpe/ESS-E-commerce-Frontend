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

When('O usuário está na página "Carrinho"', () => {
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

Then('O usuário digita um CEP válido "50740-560" e verifica o tempo de entrega', () => {
    cy.get('input[placeholder="Digite seu CEP"]')
        .type("50740-560");

    cy.contains('div', 'Calcular')
        .click();

    cy.get('span.absolute.right-0')
        .should('include.text', 'dias');
});

Then('O usuário digita um CEP inválido "1234567" e verifica a mensagem de erro', () => {
    cy.get('input[placeholder="Digite seu CEP"]')
        .clear()
        .type("1234567");

    cy.contains('div', 'Calcular')
        .click();

    cy.get('p.text-red-500.mt-2')
        .should('include.text', 'CEP inválido. Por favor, insira um CEP válido.');
});

Then('O usuário tenta calcular sem digitar um CEP e verifica a mensagem de erro', () => {
    cy.get('input[placeholder="Digite seu CEP"]')
        .clear();

    cy.contains('div', 'Calcular')
        .click();

    cy.get('p.text-red-500.mt-2')
        .should('include.text', 'CEP inválido. Por favor, insira um CEP válido.');
});
