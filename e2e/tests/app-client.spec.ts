import { test, expect } from '@playwright/test';

test.describe.serial('App Client CRUD Flow', () => {
  const clientName = 'testclient';
  const dummyLogoPath = 'tests/dummy-logo.png';

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');
    await page.click('button:has-text("SIGN IN")');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(1000);
    const termsCheckbox = page.locator('#terms-agreement-checkbox');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.dispatchEvent('click');
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Accept")').click();
      await page.waitForTimeout(500);
    }

    await page.addStyleTag({ content: '[data-idp-accessibility-managed="true"] { pointer-events: none !important; }' });
  });

  test('1. should Create a new app client', async ({ page }) => {
    await page.goto('http://localhost:5173/app-client');
    await page.waitForLoadState('networkidle');

    // Click Add Client
    await page.locator('button:has-text("Add Client")').click();
    await page.waitForURL('**/app-client/create');
    await page.waitForLoadState('networkidle');

    // Step 1: Basic Info
    await page.setInputFiles('input[type="file"]', dummyLogoPath);
    await page.fill('input[placeholder="(e.g., Identity Provider System)"]', clientName);
    await page.fill('textarea[placeholder="Short description of the application"]', 'dummy description');
    await page.locator('button:has-text("Next")').click();

    // Step 2: URLs
    await page.fill('input[placeholder="https://app.example.com"]', 'https://dummy.com');
    await page.fill('input[placeholder="https://app.example.com/callback"]', 'https://dummy.com/callback');
    await page.fill('input[placeholder="https://app.example.com/logout"]', 'https://dummy.com/logout');
    await page.locator('button:has-text("Next")').click();

    // Step 3: Grants
    // Click all unchecked checkboxes
    const checkboxes = await page.locator('button[role="checkbox"][aria-checked="false"]').all();
    for (const cb of checkboxes) {
      await cb.click();
    }

    // Submit Create
    await page.locator('button:has-text("Create Client")').click();

    // Handle Secret Modal
    const secretModal = page.locator('[role="dialog"]:has-text("Client Secret")');
    await expect(secretModal).toBeVisible({ timeout: 15000 });
    
    // Copy Secret
    await secretModal.locator('button[title="Copy secret"]').click();

    // Wait for Close button to become enabled and click it
    const closeBtn = secretModal.locator('button:has-text("Close")').last();
    await expect(closeBtn).toBeEnabled();
    await closeBtn.click();

    // Verify successful creation
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Created/i);
  });

  test('2. should View the created app client', async ({ page }) => {
    await page.goto('http://localhost:5173/app-client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.fill('input[placeholder="Search by name..."]', clientName);
    await page.waitForTimeout(1000);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.locator(`button[aria-label*="View ${clientName}" i]`).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    await dialog.locator('button:has-text("Close")').last().click();
  });

  test('3. should Generate new secret for the created app client', async ({ page }) => {
    await page.goto('http://localhost:5173/app-client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.fill('input[placeholder="Search by name..."]', clientName);
    await page.waitForTimeout(1000);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.locator(`button[aria-label*="Rotate secret for ${clientName}" i]`).first().click();

    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Generate")').click();

    const secretModal = page.locator('[role="dialog"]:has-text("Client Secret")');
    await expect(secretModal).toBeVisible({ timeout: 15000 });
    
    await secretModal.locator('button[title="Copy secret"]').click();
    
    const closeBtn = secretModal.locator('button:has-text("Close")').last();
    await expect(closeBtn).toBeEnabled();
    await closeBtn.click();
  });

  test('4. should Edit the created app client', async ({ page }) => {
    await page.goto('http://localhost:5173/app-client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.fill('input[placeholder="Search by name..."]', clientName);
    await page.waitForTimeout(1000);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.locator(`button[aria-label*="Edit ${clientName}" i]`).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    await dialog.locator('input[placeholder="(e.g., Identity Provider System)"]').fill(clientName + ' updated');
    await dialog.locator('input[placeholder="https://app.example.com"]').fill('https://dummy-updated.com');

    await dialog.locator('button:has-text("Save")').click();

    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Updated/i);
  });

  test('5. should Delete the created app client', async ({ page }) => {
    await page.goto('http://localhost:5173/app-client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    // Since we updated the name in the previous test, we search for the updated name
    await page.fill('input[placeholder="Search by name..."]', clientName + ' updated');
    await page.waitForTimeout(1000);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 15000 });

    await page.locator(`button[aria-label*="Delete ${clientName} updated" i]`).first().click();

    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Delete")').click();

    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/Deleted/i);
  });
});
