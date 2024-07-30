Feature: Cadastro e manutenção de itens no menu
  Contexto: 
    Given O usuário de email "teste@gmail.com" está logado
    And O usuário está na página Produtos

  Scenario: Inserção de novo produto
    Quando O usuário insere um novo produto com o nome "Produto C" 
    E O preço é "100"
    E O estoque é "10"
    E A descrição é "Descrição do produto"
    E A imagem é "https://www.google.com"
    E A categoria é "Categoria do produto"
    E salva
    Então O novo produto deve aparecer na lista com o nome "Produto C"

  Scenario: Verificação da presença de um produto
    Dado que existe um produto de nome "Teste" disponível na loja
    Então o usuário deve ser capaz de visualizar o produto

  Scenario: Edição de produto existente
    Dado que existe um produto de nome "Teste" disponível na loja
    Quando O usuário seleciona o produto de nome "Teste"
    E O usuário altera o nome do produto para "Produto B" e salva as alterações
    Então O produto deve ter o novo nome "Protudo B"

  Scenario: Deletando um produto existente
    Dado O produto "Produto B" está disponível na loja
    Quando O usuário seleciona o produto de nome "Produto B"
    E O usuário clica em "Deletar"
    Então O produto é removido da lista
