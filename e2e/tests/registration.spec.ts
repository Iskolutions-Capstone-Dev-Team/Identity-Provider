import { test, expect } from '@playwright/test';

test.describe.serial('Registration Config CRUD Flow', () => {
  const accountTypeName = 'testaccounttype';

  test.beforeEach(async ({ page }) => {
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

  test('1. should Create a new registration config', async ({ page }) => {
    await page.goto('http://localhost:5173/registration');
    await page.waitForLoadState('networkidle');

    // Click Add Account Type
    await page.locator('button:has-text("Add Account Type")').click();
    await page.waitForURL('**/registration/create');
    await page.waitForLoadState('networkidle');

    // Fill Account Type Name
    await page.fill('input#account-type-name', accountTypeName);

    // Select at least 3 clients
    const options = page.locator('[data-slot="combobox-item"]');
    
    await page.locator('input[placeholder="Select app clients"]').click();
    await options.nth(0).click();
    
    await page.locator('input[placeholder="Select app clients"]').click();
    await options.nth(1).click();

    await page.locator('input[placeholder="Select app clients"]').click();
    await options.nth(2).click(); 

    // Click outside to close the dropdown so it doesn't block the button
    await page.locator('text="ACCOUNT TYPE"').first().click();
    await page.waitForTimeout(300);

    // Create Account Type
    await page.locator('button:has-text("Create Account Type")').click();

    // Wait for success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Created/i, { timeout: 10000 });
  });

  test('2. should View the created registration config', async ({ page }) => {
    await page.goto('http://localhost:5173/registration');
    await page.waitForLoadState('networkidle');

    // Wait for loading skeletons to disappear
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Search for config
    await page.fill('input[placeholder="Search by account type or client..."]', accountTypeName);
    await page.waitForTimeout(1000); // Wait for debounce

    // Wait for loading to finish again
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Click View Action
    await page.locator(`button[title*="View ${accountTypeName}" i]`).click();

    // Verify modal is open and shows account type name
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`h2:has-text("${accountTypeName}")`).first()).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('3. should Edit the created registration config', async ({ page }) => {
    await page.goto('http://localhost:5173/registration');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.fill('input[placeholder="Search by account type or client..."]', accountTypeName);
    await page.waitForTimeout(1000);
    
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Click Edit Action
    await page.locator(`button[title*="Edit ${accountTypeName}" i]`).click();

    // Wait for Edit modal
    const editDialog = page.locator('[role="dialog"]');
    await expect(editDialog).toBeVisible({ timeout: 5000 });

    // Exchange clients to keep it at 3 (uncheck the first one, check the fourth one)
    const options = page.locator('[data-slot="combobox-item"]');
    await editDialog.locator('input[placeholder="Select app clients"]').click();
    await options.nth(0).click(); // Uncheck
    await options.nth(3).click(); // Check a new one

    // Force click the save button to bypass any dropdown occlusion
    await editDialog.locator('button[type="submit"]').click({ force: true });

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Updated/i, { timeout: 10000 });
  });

  test('4. should Delete the created registration config', async ({ page }) => {
    await page.goto('http://localhost:5173/registration');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.fill('input[placeholder="Search by account type or client..."]', accountTypeName);
    await page.waitForTimeout(1000);
    
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Click Delete Action
    await page.locator(`button[title*="Delete ${accountTypeName}" i]`).click();

    // Confirm deletion in the alert dialog
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    
    await confirmDialog.locator('button:has-text("Delete")').click();

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Deleted/i, { timeout: 10000 });
  });
});
