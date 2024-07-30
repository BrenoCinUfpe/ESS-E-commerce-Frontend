Feature: Notificação de Confirmação de Pedido

  Scenario: Tentar finalizar pedido sem calcular o tempo de entrega
    Given O usuário de email "admin@gmail.com" está logado
    When O usuário está na página Carrinho
    Then O usuário clica em Finalizar Compra e vê a mensagem de erro "Não é possível finalizar a compra sem o CEP. Tente novamente." no popup

  Scenario: Finalizar pedido após calcular o tempo de entrega
    Given O usuário de email "admin@gmail.com" está logado
    When O usuário está na página Carrinho
    And O usuário calcula o tempo de entrega com um CEP válido "50740-560"
    And O usuário clica em Finalizar Compra
    Then O usuário vê uma mensagem de confirmação de pedido "Pedido finalizado com sucesso! Tempo de entrega:"
