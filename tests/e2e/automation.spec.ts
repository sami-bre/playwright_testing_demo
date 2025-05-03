import { test, expect } from '@playwright/test';

// Base URL for the tests - adjust if your app runs on a different port
const baseURL = 'http://localhost:3000';

// Helper function to create a unique todo text for each test run
const createTodoText = (baseText: string) => `${baseText} - ${Date.now()}`;

// Helper function to add a todo item
async function addTodo(page: any, text: string) {
  // Use existing locators for input and button as they don't have test-ids yet
  await page.locator('input[name="todoText"]').fill(text);
  await page.locator('button[type="submit"]:has-text("Add")').click();
  // Wait for the item to appear in the incomplete list using test-id
  await expect(page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${text}")`)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  // Go to the starting url before each test
  await page.goto(baseURL);
});





test.describe('Todo Application', () => {
  test('should allow users to add a todo item', async ({ page }) => {
    const todoText = createTodoText('Buy milk');
    await addTodo(page, todoText);

    // Verify the new todo is visible in the incomplete list using test-id
    await expect(page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`)).toBeVisible();
  });





  test('should allow users to mark a todo as complete', async ({ page }) => {
    const todoText = createTodoText('Walk the dog');
    await addTodo(page, todoText);

    // Find the todo item using its test-id within the incomplete list
    const todoItemLocator = page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);

    // Find the checkbox within that item using test-id and click it
    const checkboxLocator = todoItemLocator.locator('[data-testid^="todo-item-checkbox-"]');
    // Use click() instead of check() to handle async updates
    await checkboxLocator.click();

    // Verify the item is now in the completed list using test-id
    await expect(page.locator(`[data-testid="completed-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`)).toBeVisible();

    // Verify the item is no longer in the incomplete list using test-id
    await expect(page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`)).not.toBeVisible();

    // Verify the checkbox in the completed list is checked using test-id
    const completedItemLocator = page.locator(`[data-testid="completed-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await expect(completedItemLocator.locator('[data-testid^="todo-item-checkbox-"]')).toBeChecked();
  });





  test('should allow users to uncomplete a todo item', async ({ page }) => {
    const todoText = createTodoText('Learn Playwright');
    await addTodo(page, todoText);

    // --- Mark as complete ---
    const incompleteItemLocator = page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    const incompleteCheckboxLocator = incompleteItemLocator.locator('[data-testid^="todo-item-checkbox-"]');
    await incompleteCheckboxLocator.click();

    // Verify it moved to completed list
    const completedItemLocator = page.locator(`[data-testid="completed-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await expect(completedItemLocator).toBeVisible();
    await expect(incompleteItemLocator).not.toBeVisible(); // Ensure it's gone from incomplete

    // --- Mark as incomplete again ---
    const completedCheckboxLocator = completedItemLocator.locator('[data-testid^="todo-item-checkbox-"]');
    await completedCheckboxLocator.click();

    // Verify it moved back to incomplete list
    await expect(incompleteItemLocator).toBeVisible();
    await expect(completedItemLocator).not.toBeVisible(); // Ensure it's gone from completed

    // Verify the checkbox in the incomplete list is unchecked
    await expect(incompleteCheckboxLocator).not.toBeChecked();
  });





  test('should allow users to archive a completed todo item', async ({ page }) => {
    const todoText = createTodoText('Review PR');
    await addTodo(page, todoText);

    // --- Mark as complete ---
    const incompleteItemLocator = page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    const incompleteCheckboxLocator = incompleteItemLocator.locator('[data-testid^="todo-item-checkbox-"]');
    await incompleteCheckboxLocator.click();

    // Verify it moved to completed list
    const completedItemLocator = page.locator(`[data-testid="completed-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await expect(completedItemLocator).toBeVisible();

    // --- Archive the completed item ---
    // Listen for the confirmation dialog and accept it *before* the click
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`); // Optional: log the message
      dialog.accept().catch(() => {}); // Accept the dialog
    });

    const archiveButtonLocator = completedItemLocator.locator('[data-testid^="todo-item-archive-button-"]');
    await archiveButtonLocator.click(); // This click triggers the dialog

    // Verify the item is no longer in the completed list
    await expect(completedItemLocator).not.toBeVisible();

    // Verify the item is also not in the incomplete list
    await expect(incompleteItemLocator).not.toBeVisible();

    // --- Verify item appears in the Archived tab ---
    // Click the Archived tab
    await page.locator('[data-testid="archived-todos-tab"]').click();

    // Verify the archived item is visible in the archived list
    const archivedItemLocator = page.locator(`[data-testid="archived-todo-list"] >> [data-testid^="archived-todo-item-"]:has-text("${todoText}")`);
    await expect(archivedItemLocator).toBeVisible();
  });





  test('should allow users to delete an active todo item', async ({ page }) => {
    const todoText = createTodoText('Delete me (active)');
    await addTodo(page, todoText);

    // Find the active todo item
    const activeItemLocator = page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await expect(activeItemLocator).toBeVisible();

    // --- Delete the active item ---
    // Listen for the confirmation dialog and accept it
    page.once('dialog', dialog => dialog.accept().catch(() => {}));

    const deleteButtonLocator = activeItemLocator.locator('[data-testid^="todo-item-delete-button-"]');
    await deleteButtonLocator.click(); // Triggers dialog

    // Verify the item is no longer in the incomplete list
    await expect(activeItemLocator).not.toBeVisible();
  });




  test('should allow users to delete an archived todo item', async ({ page }) => {
    const todoText = createTodoText('Delete me (archived)');
    await addTodo(page, todoText);

    // --- Mark as complete ---
    const incompleteItemLocator = page.locator(`[data-testid="incomplete-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await incompleteItemLocator.locator('[data-testid^="todo-item-checkbox-"]').click();

    // --- Archive the completed item ---
    const completedItemLocator = page.locator(`[data-testid="completed-todo-list"] >> [data-testid^="todo-item-"]:has-text("${todoText}")`);
    await expect(completedItemLocator).toBeVisible();
    page.once('dialog', dialog => dialog.accept().catch(() => {})); // Accept archive confirmation
    await completedItemLocator.locator('[data-testid^="todo-item-archive-button-"]').click();
    await expect(completedItemLocator).not.toBeVisible(); // Wait for archive to complete

    // --- Navigate to Archived tab ---
    await page.locator('[data-testid="archived-todos-tab"]').click();
    const archivedItemLocator = page.locator(`[data-testid="archived-todo-list"] >> [data-testid^="archived-todo-item-"]:has-text("${todoText}")`);
    await expect(archivedItemLocator).toBeVisible();

    // --- Delete the archived item ---
    // Listen for the confirmation dialog and accept it
    page.once('dialog', dialog => dialog.accept().catch(() => {}));

    const deleteButtonLocator = archivedItemLocator.locator('[data-testid^="archived-todo-item-delete-button-"]');
    await deleteButtonLocator.click(); // Triggers dialog

    // Verify the item is no longer in the archived list
    await expect(archivedItemLocator).not.toBeVisible();
  });
});
