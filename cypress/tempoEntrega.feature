Feature: Calcular Tempo de Entrega

  Scenario: Calcular tempo de entrega com CEP válido
    Given O usuário de email "admin@gmail.com" está logado
    When O usuário está na página "Carrinho"
    Then O usuário digita um CEP válido "50740-560" e verifica o tempo de entrega

  Scenario: Calcular tempo de entrega com CEP inválido
    Given O usuário de email "admin@gmail.com" está logado
    When O usuário está na página "Carrinho"
    Then O usuário digita um CEP inválido "1234567" e verifica a mensagem de erro

  Scenario: Calcular tempo de entrega sem digitar CEP
    Given O usuário de email "admin@gmail.com" está logado
    When O usuário está na página "Carrinho"
    Then O usuário tenta calcular sem digitar um CEP e verifica a mensagem de erro
