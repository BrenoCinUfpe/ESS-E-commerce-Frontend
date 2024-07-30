import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { Customer } from '../fixtures/users.json'


describe('Cadastro e manutenção de itens no menu', () => {
    const baseUrl = 'http://localhost:3000';
    const serverBaseUrl = 'http://localhost:3000/api';

    const productName = 'Teste';
    const newProductName = 'Produto B';
    const newProductNameToInsert = 'Produto C';
    const newProductPrice = '100';
    const newProductStock = '10';
    const newProductDescription = 'Descrição do produto';
    const newProductImage = 'https:\/www.google.com';
    const newProductCategory = 'Categoria do produto';

    beforeEach(() => {
        cy.visit(baseUrl);
    });

    // Teste de login
    Given('O usuário de email "teste@gmail.com" está logado', () => {
        cy.get("#navbarLoginButton").click();
        cy.get("#emailInput").type("teste@gmail.com");
        cy.get("#senhaInput").type("senha123");
        cy.intercept("GET", `${serverBaseUrl}/api/auth/me`).as("LoggedInRequest");
        cy.get("#loginButton").click();
        cy.wait("@LoggedInRequest");
        cy.get("#loggedInMessage").should("exist");
        cy.wait(200);
        cy.get('[xmlns="http://www.w3.org/2000/svg"]').click();
    });

    // Teste de visualização da página de produtos
        // Esperar até que os produtos estejam carregados
    Given('O usuário está na página Produtos', () => {
    cy.visit(baseUrl + "/product");
    cy.intercept("GET", `${serverBaseUrl}/api/product`).as("getProducts");
    cy.wait("@getProducts").its('response.statusCode').should('eq', 200);
    cy.get("div").contains("Todos os Produtos").should('exist');
});

    

    // Teste de inserção de um novo produto
    When('O usuário insere um novo produto com o nome "Produto C"', () => {
        cy.get("button").contains("Adicionar Produto").click();
        cy.get("input[placeholder='Nome da peça']").type(newProductNameToInsert);
    });

    When('o preço é "100"', () => {
        cy.get("input[placeholder='Preço']").type(newProductPrice);
    });

    When('o estoque é "10"', () => {
        cy.get("input[placeholder='Estoque']").type(newProductStock);
    });

    When('a descrição é "Descrição do produto"', () => {
        cy.get("input[placeholder='Descrição']").type(newProductDescription);
    });

    When('a imagem é "https:\/www.google.com"', () => {
        cy.get("input[placeholder='Imagem']").type(newProductImage);
    });

    When('a categoria é "Categoria do produto"', () => {
        cy.get("input[placeholder='Categoria']").type(newProductCategory);
    });

    When('salva as alterações', () => {
        cy.get("button").contains("Salvar").click();
    });

    Then('O novo produto deve aparecer na lista com o nome "Produto C"', () => {
        cy.get("div").contains(newProductNameToInsert).should('exist');
    });

    // Teste para visualizar um produto
    Given('O produto de nome {string} está disponível na loja', (product) => {
        cy.get("div").contains(product as string).should('exist');
    });


    Then("Então o usuário deve ser capaz de visualizar o produto", () => {
        cy.get("div").contains(productName).should('exist');
    });

    // Teste para selecionar um produto e abrir o formulário de edição
    When('O usuário seleciona o produto de nome {string}', (product) => {
        cy.get("div").contains(product as string).click();
        cy.get(".bg-gray-100").should("exist");
    });

    // Teste de edição de um produto
    When('O usuário altera o nome do produto para "Produto B" e salva as alterações', () => {
        cy.get("input[placeholder='Nome da peça']").clear().type(newProductName);
        cy.get("button").contains("Salvar alterações").click();
    });

    Then('O produto deve ter o novo nome "Produto B"', () => {
        cy.get("div").contains(newProductName).should('exist');
    });

    //teste deleção
    When('O usuário clica no botão "Deletar"', () => {
        cy.get("div").contains(newProductName).click();
        cy.get("button").contains("Deletar").click();
    });

    Then('O produto é removido da lista', () => {
        cy.get("div").contains(newProductName).should('not.exist');
    });

    
});
