import { test, expect } from '@playwright/test';

test.describe.serial('Role CRUD Flow', () => {
  const roleName = 'testadmin';
  const roleDescription = 'This is an automated test role for administration.';
  const roleDescriptionEdited = 'This is an automated test role for administration - Edited.';

  test.beforeEach(async ({ page }) => {
    // Set a wide viewport to avoid mobile overlays
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Superadmin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');
    await page.click('button:has-text("SIGN IN")');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Accept Terms and Conditions if it pops up
    await page.waitForTimeout(1000);
    const termsCheckbox = page.locator('#terms-agreement-checkbox');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.dispatchEvent('click');
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Accept")').click();
      await page.waitForTimeout(500);
    }

    // Block accessibility overlay from intercepting clicks
    await page.addStyleTag({ content: '[data-idp-accessibility-managed="true"] { pointer-events: none !important; }' });
  });

  test('1. should Create a new role', async ({ page }) => {
    await page.goto('http://localhost:5173/roles');
    await page.waitForLoadState('networkidle');

    // Click Add Role
    await page.locator('button:has-text("Add Role")').click();

    // The Add Role modal should appear
    await expect(page.locator('form#role-form')).toBeVisible({ timeout: 5000 });

    // Step 1: Fill Basic Info
    await page.fill('input#role-name', roleName);
    await page.fill('textarea#role-description', roleDescription);

    // Proceed to Step 2 (Permissions)
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Select a few permissions by clicking their labels
    await page.locator('label:has-text("Add user")').click();
    await page.locator('label:has-text("View all users")').click();
    await page.locator('label:has-text("Add appclient")').click();

    // Create Role
    await page.locator('button:has-text("Create Role")').click();

    // Wait for success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    // Assuming toast says "successfully"
    await expect(toastMessage).toContainText(/successfully/i);
  });

  test('2. should View the created role', async ({ page }) => {
    await page.goto('http://localhost:5173/roles');
    await page.waitForLoadState('networkidle');

    // Search for role
    await page.fill('input[placeholder="Search by role name..."]', roleName);
    await page.waitForTimeout(1000); // Wait for debounce

    // Click View Action
    const row = page.locator(`tr:has-text("${roleName}")`);
    await row.locator('button[title="View Role"]').click();

    // Verify modal is open and shows role details
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${roleName}`).first()).toBeVisible();
    await expect(page.locator(`text=${roleDescription}`).first()).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('3. should Edit the created role', async ({ page }) => {
    await page.goto('http://localhost:5173/roles');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by role name..."]', roleName);
    await page.waitForTimeout(1000);

    // Click Edit Action
    const row = page.locator(`tr:has-text("${roleName}")`);
    await row.locator('button[title="Edit Role"]').click();

    // Wait for Edit modal
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Step 1: Edit Description
    await page.fill('textarea#role-description', roleDescriptionEdited);

    // Step 2: Toggle some permissions
    // Uncheck "Add user" and check "Edit user"
    const editDialog = page.locator('[role="dialog"]');
    await editDialog.locator('label:has-text("Add user")').click();
    await editDialog.locator('label:has-text("Edit user")').click();

    // Save changes
    await editDialog.locator('button[type="submit"]').click();

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/successfully/i);
  });

  test('4. should Delete the created role', async ({ page }) => {
    await page.goto('http://localhost:5173/roles');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by role name..."]', roleName);
    await page.waitForTimeout(1000);

    // Click Delete Action
    const row = page.locator(`tr:has-text("${roleName}")`);
    await row.locator('button[title="Delete Role"]').click();

    // Confirm deletion in the alert dialog
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    
    // The Delete Confirm dialog uses the DeleteConfirmModal which has a "Delete" button by default
    await confirmDialog.locator('button:has-text("Delete")').click();

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/successfully/i, { timeout: 10000 });
  });
});
