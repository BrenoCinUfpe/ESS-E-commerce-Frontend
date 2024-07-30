Feature: Category
  Background:
    Given the user is logged as admin
    And the user is on the Categories page

  Scenario: User creates a new category successfully
    When the user opens the create category dialog
    And the user enters "Bota" in the category name input
    And the user enters "https://cdn-icons-png.flaticon.com/512/908/908036.png" in the category image input
    And the user clicks the create button
    Then a new category with name "Bota" should be added to the list

  Scenario: Edit an existing category
    Given a category with name "Bota" exists
    When the user opens the edit dialog for the category named "Bota"
    And the user changes the category name to "Sapato"
    And the user changes the category image to "https://cdn-icons-png.flaticon.com/512/908/908036.png"
    And the user clicks the update button
    Then the category name should be updated to "Sapato"

  Scenario: Delete an existing category
    Given a category with name "Sapato" exists
    When the user opens the delete dialog for the category named "Sapato"
    And the user confirms the deletion
    Then the category should no longer exist in the list