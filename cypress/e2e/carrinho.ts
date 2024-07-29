import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { Customer } from '../fixtures/users.json'

const baseUrl = "http://localhost:3000"
const serverBaseUrl = "http://localhost:3333"

Given('O usuário de email "teste@gmail.com" está logado', () => {
    cy.visit(baseUrl);

    cy.get("#navbarLoginButton")
        .click();

    cy.get("#emailInput")
        .type(Customer.email);

    cy.get("#senhaInput")
        .type(Customer.senha);

    cy.wait(200);

    cy.intercept("GET", serverBaseUrl+"/api/auth/me").as("LoggedInRequest");

    cy.get("#loginButton")
    .click();

    cy.wait("@LoggedInRequest");
        
    cy.get("#loggedInMessage")
        .should("exist") 

    cy.wait(200);

    // Fechando o Dialog
    cy.get('[xmlns="http://www.w3.org/2000/svg"]')
        .click();

})
When('O usuário está na página Carrinho', () => {
    cy.wait(200);

    cy.get("#navbarCartButton")
        .click();

    cy.get("#goToCartButton")
        .click();

    cy.wait(500);

    cy.url().should('include', '/carrinho');

    cy.get("#closeCartButton")
        .click();
})
Then('O usuário deve ver a lista de produtos em seu carrinho na tela', () => {

    cy.url().should('include', '/carrinho');

    cy.get("#productContainer")
        .children()
        .should("have.length.at.least", 1);

    cy.get("#productContainer")
        .should("contain", "Descrição");
})

When('O usuário clica no botão "Remover" correspondente ao produto de ID "1" no carrinho', ()=>{
    cy.get("#productContainer #productName")
        .contains("Produto A")
        .should("exist");
    
    cy.get("#productContainer #productName")
        .contains("Produto A")
        .parent()
        .find("#removeButton")
        .click();
})
Then('O produto deve ser removido da lista do carrinho', () => {
    cy.get("#productContainer")
        .should("not.contain", "Produto A");
})


// -----------------

Given('Existe um produto de ID "1" no carrinho do usuário', () => {
    cy.get("#productContainer #productName")
        .contains("Produto A")
        .should('exist');
})
Given('O usuário possui "1" unidade do produto especificado em seu carrinho', () => {

    cy.get("#productContainer #productName")
        .contains("Produto A")
        .parent()
        .find("#itemQuantity")
        .should('contain.text', '1')

})

When('O usuário clica no botão "+" ao lado do produto de ID "1" no carrinho', ()=>{
    cy.get("#productContainer #productName")
        .contains("Produto A")
        .parent()
        .find("#plusOneQuantity")
        .click();
})
Then('A quantidade do produto deve ser atualizada para "2" unidades e o usuário deve ver a nova quantidade na tela', () => {
    cy.get("#productContainer #productName")
        .contains("Produto A")
        .parent()
        .find("#itemQuantity")
        .should('contain.text', '2')

    cy.get("#productContainer #productName")
        .contains("Produto A")
        .parent()
        .find("#minusOneQuantity")
        .click();
})

Given('O usuário está na página Produtos', () => {
    cy.visit(baseUrl+"/product")
})
Given('Existe um produto de nome "Produto A" disponível na loja', () => {
    const productName = "Produto A";

    cy.get("div")
        .contains(productName)
        .should('exist');
})

When('O usuário clica no botão "Adicionar ao Carrinho" do produto de nome "Produto A"', () => {
    const productName = "Produto A";
    cy.intercept("POST", serverBaseUrl+"/api/cart/add").as("AddResponse");


    cy.wait(1500);

    cy.get("div")
        .contains(productName)
        .parent()
        .find("#addToCartButton")
        .click();

    cy.wait('@AddResponse');

    cy.wait(200);

})

Then('O usuário deve ver uma mensagem de confirmação', () => {
    cy.get('#addMessage')
        .should("contain", "sucesso");
    
    cy.wait(100);

    cy.get('[xmlns="http://www.w3.org/2000/svg"]')
        .last()
        .click();
})

Then('O produto deve aparecer na lista do carrinho', () => {
    const productName = "Produto A";
    cy.intercept("GET", serverBaseUrl+"/api/cart").as("CartResponse");

    cy.get("#navbarCartButton")
        .click();


    cy.wait('@CartResponse');

    cy.wait(100);

    cy.get("#sideCartContainer #productName")
        .contains(productName)
        .should('exist');
})


