import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { Customer, Admin } from '../fixtures/users.json'

const baseUrl = "http://localhost:3000"
const serverBaseUrl = "http://localhost:3333"

Given('O usuário comum de email "teste@gmail.com" está logado', () => {
    cy.visit(baseUrl);

    cy.get("#navbarLoginButton")
        .click();

    cy.get("#emailInput")
        .type(Customer.email);

    cy.get("#senhaInput")
        .type(Customer.senha);

    cy.wait(200);
    
    cy.intercept("GET", serverBaseUrl+"/api/auth/me").as("LoggedInRequest")
    
    cy.get("#loginButton")
        .click();

    cy.wait("@LoggedInRequest");
        
    cy.get("#loggedInMessage")
        .should("exist") 
})
When('O usuário acessa a funcionalidade de listar pedidos', () => {
    cy.get("#pedidosCustomerButton")
        .click();
})
Then('Os pedidos existentes do usuário devem ser listados em sua tela', () => {
    cy.get("#pedidosUserContainer", {timeout: 5000})
        .should("contain", "Status");

    cy.get("#pedidosUserContainer")
        .children()
        .should("have.length.at.least", 1)
})

Given('O usuário administrador de email "admin@gmail.com" está logado', () => {
    cy.visit(baseUrl);

    cy.get("#navbarLoginButton")
        .click();

    cy.get("#emailInput")
        .type(Admin.email);

    cy.get("#senhaInput")
        .type(Admin.senha);

    cy.wait(200);

    cy.intercept("GET", serverBaseUrl+"/api/auth/me").as("LoggedInRequest")

    cy.get("#loginButton")
        .click();

    cy.wait("@LoggedInRequest");
        
    cy.get("#loggedInMessage")
        .should("exist")     
});

When('O administrador acessa a funcionalidade de listar pedidos', () => {
    cy.get("#pedidosAdminButton")
        .click();    
});

Then('A tela de busca por usuários deve ser exibida', () => {
    cy.get('#historicoPedidosUsuarioInput')
        .should('exist')
});

When('O administrador pesquisar por um usuário de nome "Teste"', () => {
    cy.get('#historicoPedidosUsuarioInput')
        .type('Teste');

    cy.get('#historicoPedidosSearchButton')
        .click();
})
Then('Deve ser exibida na listagem a opção de visualizar o histórico de pedidos do usuário "Teste"' , () => {
    cy.get('#historicoPedidosUserContainer')
        .contains('Teste')
        .should('exist');

    cy.get('#historicoPedidosUserContainer')
        .contains('Teste')
        .parent()
        .parent()
        .parent()
        .find('#openHistoricoButton')
        .should('exist');
})

When('O administrador clicar na opção de visualizar histórico de pedidos de "Teste"', () => {
    cy.get('#historicoPedidosUserContainer')
        .contains('Teste')
        .parent()
        .parent()
        .parent()
        .find('#openHistoricoButton')
        .click();
})

Then('Os pedidos existentes do usuário "Teste" devem ser listados em sua tela', () => {
    cy.get('#pedidosContainerAdmin')
        .should('contain.text', 'Valor');
})