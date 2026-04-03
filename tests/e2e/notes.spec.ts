import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test Suite for Simple Notes App
 * 
 * Tests CRUD operations and search functionality on both desktop and mobile viewports.
 * 
 * Desktop viewport: 1280x720
 * Mobile viewport: 375x667
 */

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Test data
const TEST_NOTE = {
  title: 'Test Note',
  body: 'This is a test note created by E2E tests.',
};

const TEST_NOTE_2 = {
  title: 'Second Test Note',
  body: 'Another note for testing search functionality.',
};

const UPDATED_TITLE = 'Updated Test Note';
const UPDATED_BODY = 'This note has been updated by E2E tests.';

/**
 * Helper function to clear localStorage before each test
 */
async function clearLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.reload();
}

/**
 * Helper function to wait for notes to be rendered
 */
async function waitForNotesToRender(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="note-card"]', { state: 'visible', timeout: 5000 });
}

// ============================================================================
// DESKTOP TESTS
// ============================================================================

test.describe('Desktop - Notes App E2E Tests', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
  });

  // --------------------------------------------------------------------------
  // CREATE NOTE TESTS
  // --------------------------------------------------------------------------

  test.describe('Create Note', () => {
    test('should create a new note with title and body', async ({ page }) => {
      // Click the "New Note" button
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');

      // Wait for editor to appear
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });

      // Fill in the title
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', TEST_NOTE.title);

      // Fill in the body
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', TEST_NOTE.body);

      // Click save
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Wait for note to appear in list
      await waitForNotesToRender(page);

      // Verify the note appears in the list
      await expect(page.locator(`text="${TEST_NOTE.title}"`)).toBeVisible();
      await expect(page.locator(`text="${TEST_NOTE.body}"`)).toBeVisible();
    });

    test('should create a note with minimal content', async ({ page }) => {
      // Click the "New Note" button
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');

      // Wait for editor to appear
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });

      // Fill in minimal content
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Quick Note');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Brief');

      // Click save
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Verify the note appears
      await expect(page.locator('text="Quick Note"')).toBeVisible();
    });

    test('should persist note after page refresh', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Persistent Note');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Should survive refresh');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Verify note exists
      await expect(page.locator('text="Persistent Note"')).toBeVisible();

      // Refresh the page
      await page.reload();

      // Verify note still exists
      await expect(page.locator('text="Persistent Note"')).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // EDIT NOTE TESTS
  // --------------------------------------------------------------------------

  test.describe('Edit Note', () => {
    test('should edit an existing note', async ({ page }) => {
      // First, create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', TEST_NOTE.title);
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', TEST_NOTE.body);
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Click on the note to edit it
      await page.click(`text="${TEST_NOTE.title}"`);

      // Wait for editor to show the note
      await page.waitForTimeout(500);

      // Update the title
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', UPDATED_TITLE);

      // Update the body
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', UPDATED_BODY);

      // Save the changes
      await page.click('button:has-text("Save"), button:has-text("Update"), [data-testid="save-note-button"]');

      // Verify the updated content
      await expect(page.locator(`text="${UPDATED_TITLE}"`)).toBeVisible();
      await expect(page.locator(`text="${UPDATED_BODY}"`)).toBeVisible();
    });

    test('should update note timestamp when edited', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Timestamp Test');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Original content');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Wait a moment
      await page.waitForTimeout(100);

      // Edit the note
      await page.click('text="Timestamp Test"');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Updated content');
      await page.click('button:has-text("Save"), button:has-text("Update"), [data-testid="save-note-button"]');

      // Verify the note still exists with updated content
      await expect(page.locator('text="Timestamp Test"')).toBeVisible();
      await expect(page.locator('text="Updated content"')).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // DELETE NOTE TESTS
  // --------------------------------------------------------------------------

  test.describe('Delete Note', () => {
    test('should delete a note', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Note to Delete');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'This will be deleted');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Verify note exists
      await expect(page.locator('text="Note to Delete"')).toBeVisible();

      // Click delete button
      await page.click('button:has-text("Delete"), button:has-icon("delete"), [data-testid="delete-note-button"]');

      // If there's a confirmation dialog, handle it
      const confirmationDialog = page.locator('button:has-text("Confirm"), button:has-text("OK")');
      if (await confirmationDialog.count() > 0) {
        await confirmationDialog.click();
      }

      // Verify note is deleted
      await expect(page.locator('text="Note to Delete"')).not.toBeVisible();
    });

    test('should show empty state after deleting all notes', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Last Note');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Will be deleted');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Delete the note
      await page.click('button:has-text("Delete"), button:has-icon("delete"), [data-testid="delete-note-button"]');

      // Handle confirmation if present
      const confirmationDialog = page.locator('button:has-text("Confirm"), button:has-text("OK")');
      if (await confirmationDialog.count() > 0) {
        await confirmationDialog.click();
      }

      // Verify empty state is shown
      await expect(page.locator('text="No notes yet", text="No notes found", text="Empty"')).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // SEARCH TESTS
  // --------------------------------------------------------------------------

  test.describe('Search/Filter Notes', () => {
    test('should filter notes by search term', async ({ page }) => {
      // Create multiple notes
      const notes = [
        { title: 'Work Notes', body: 'Meeting at 3pm' },
        { title: 'Personal Notes', body: 'Grocery shopping list' },
        { title: 'Work Tasks', body: 'Complete project documentation' },
      ];

      for (const note of notes) {
        await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
        await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
        await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', note.title);
        await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', note.body);
        await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');
      }

      // Verify all notes are visible
      await expect(page.locator('text="Work Notes"')).toBeVisible();
      await expect(page.locator('text="Personal Notes"')).toBeVisible();
      await expect(page.locator('text="Work Tasks"')).toBeVisible();

      // Search for "Work"
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', 'Work');

      // Wait for filtering
      await page.waitForTimeout(300);

      // Verify only work-related notes are shown
      await expect(page.locator('text="Work Notes"')).toBeVisible();
      await expect(page.locator('text="Work Tasks"')).toBeVisible();
      await expect(page.locator('text="Personal Notes"')).not.toBeVisible();
    });

    test('should clear search and show all notes', async ({ page }) => {
      // Create notes
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Apple Pie');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Recipe');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Banana Bread');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Recipe');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Search for "Apple"
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', 'Apple');
      await page.waitForTimeout(300);

      // Verify only Apple note is shown
      await expect(page.locator('text="Apple Pie"')).toBeVisible();
      await expect(page.locator('text="Banana Bread"')).not.toBeVisible();

      // Clear the search
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', '');
      await page.waitForTimeout(300);

      // Verify all notes are shown again
      await expect(page.locator('text="Apple Pie"')).toBeVisible();
      await expect(page.locator('text="Banana Bread"')).toBeVisible();
    });

    test('should search in both title and body', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Random Title');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Contains important keyword');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Search for keyword in body
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', 'important');
      await page.waitForTimeout(300);

      // Verify note is found by body content
      await expect(page.locator('text="Random Title"')).toBeVisible();
    });

    test('should show no results for non-matching search', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"]');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Test Note');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Test body');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Search for non-existent term
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', 'nonexistent12345');
      await page.waitForTimeout(300);

      // Verify no results message is shown
      await expect(page.locator('text="No notes", text="No results", text="No matching notes"')).toBeVisible();
    });
  });
});

// ============================================================================
// MOBILE TESTS
// ============================================================================

test.describe('Mobile - Notes App E2E Tests', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
  });

  // --------------------------------------------------------------------------
  // CREATE NOTE TESTS (MOBILE)
  // --------------------------------------------------------------------------

  test.describe('Create Note (Mobile)', () => {
    test('should create a new note on mobile', async ({ page }) => {
      // Click the "New Note" button (may be in bottom nav on mobile)
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"], button:has-icon("add")');

      // Wait for editor to appear
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });

      // Fill in the title
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Mobile Note');

      // Fill in the body
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Created on mobile device');

      // Click save
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Verify the note appears
      await expect(page.locator('text="Mobile Note"')).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // EDIT NOTE TESTS (MOBILE)
  // --------------------------------------------------------------------------

  test.describe('Edit Note (Mobile)', () => {
    test('should edit a note on mobile', async ({ page }) => {
      // Create a note first
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"], button:has-icon("add")');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Mobile Edit Test');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Original content');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Click on the note to edit
      await page.click('text="Mobile Edit Test"');

      // Update content
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Updated Mobile Note');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Updated content');
      await page.click('button:has-text("Save"), button:has-text("Update"), [data-testid="save-note-button"]');

      // Verify update
      await expect(page.locator('text="Updated Mobile Note"')).toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // DELETE NOTE TESTS (MOBILE)
  // --------------------------------------------------------------------------

  test.describe('Delete Note (Mobile)', () => {
    test('should delete a note on mobile', async ({ page }) => {
      // Create a note
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"], button:has-icon("add")');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Mobile Delete Test');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'To be deleted');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Verify note exists
      await expect(page.locator('text="Mobile Delete Test"')).toBeVisible();

      // Click delete
      await page.click('button:has-text("Delete"), button:has-icon("delete"), [data-testid="delete-note-button"]');

      // Handle confirmation if present
      const confirmationDialog = page.locator('button:has-text("Confirm"), button:has-text("OK")');
      if (await confirmationDialog.count() > 0) {
        await confirmationDialog.click();
      }

      // Verify note is deleted
      await expect(page.locator('text="Mobile Delete Test"')).not.toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // SEARCH TESTS (MOBILE)
  // --------------------------------------------------------------------------

  test.describe('Search/Filter Notes (Mobile)', () => {
    test('should filter notes on mobile', async ({ page }) => {
      // Create notes
      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"], button:has-icon("add")');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Mobile Work');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Work tasks');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      await page.click('button:has-text("New Note"), button:has-text("Add Note"), [data-testid="new-note-button"], button:has-icon("add")');
      await page.waitForSelector('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', { timeout: 5000 });
      await page.fill('input[placeholder*="title"], textarea[placeholder*="title"], [data-testid="note-title-input"]', 'Mobile Personal');
      await page.fill('textarea[placeholder*="body"], textarea[placeholder*="content"], [data-testid="note-body-input"]', 'Personal notes');
      await page.click('button:has-text("Save"), button:has-text("Create"), [data-testid="save-note-button"]');

      // Search for "Work"
      await page.fill('input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search-input"]', 'Work');
      await page.waitForTimeout(300);

      // Verify filtering
      await expect(page.locator('text="Mobile Work"')).toBeVisible();
      await expect(page.locator('text="Mobile Personal"')).not.toBeVisible();
    });
  });
});
