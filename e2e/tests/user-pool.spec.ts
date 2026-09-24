import { test, expect } from '@playwright/test';

test.describe.serial('User Pool CRUD Flow', () => {
  const userEmail = 'akyleefondo@gmail.com';

  test.beforeEach(async ({ page }) => {
    // Set a wide viewport to avoid mobile overlays (like the Sheet component)
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as Superadmin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'autotestsuperadmin@gmail.com');
    await page.fill('input[type="password"]', 'Superadmin123!');
    await page.click('button:has-text("SIGN IN")');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Accept Terms and Conditions if it pops up
    // Wait briefly to allow the modal to animate in
    await page.waitForTimeout(1000);
    const termsCheckbox = page.locator('#terms-agreement-checkbox');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.dispatchEvent('click');
      await page.waitForTimeout(300); // Wait for state to update
      await page.locator('button:has-text("Accept")').click();
      // Wait for it to close
      await page.waitForTimeout(500);
    }

    // Inject a global style to disable pointer events on any overlays created by the accessibility widget
    // This prevents the widget from randomly intercepting clicks during tests
    await page.addStyleTag({ content: '[data-idp-accessibility-managed="true"] { pointer-events: none !important; }' });
  });

  test('1. should Create a new admin user', async ({ page }) => {
    // Navigate to create user page
    await page.goto('http://localhost:5173/user-pool/create');
    await page.waitForLoadState('networkidle');

    // Fill Basic Info
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="givenName"]', 'Aaron Kyle');
    await page.fill('input[name="surname"]', 'Efondo');

    // Proceed to Next Step
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Account Setup
    // Select Account Type -> System Administrator
    // (Assuming the text matches the label inside the radio group)
    const adminRadio = page.locator('text="System Administrator"');
    if (await adminRadio.isVisible()) {
      await adminRadio.click();
    }

    // Accessible Clients (Combobox)
    const options = page.locator('[data-slot="combobox-item"]');
    
    await page.locator('input[placeholder="Select accessible app clients"]').click();
    await options.nth(0).click();
    
    await page.locator('input[placeholder="Select accessible app clients"]').click();
    await options.nth(1).click();

    // The user requested a 3rd accessible client
    await page.locator('input[placeholder="Select accessible app clients"]').click();
    await options.nth(2).click(); 

    // Manageable Clients (Combobox)
    await page.locator('input[placeholder="Select manageable app clients"]').click();
    await options.nth(0).click();
    
    await page.locator('input[placeholder="Select manageable app clients"]').click();
    await options.nth(1).click(); 

    // Role -> Admin
    await page.locator('text="Admin"').click();

    // Setup Method -> Temporary Password
    await page.locator('button:has-text("Temporary Password")').click(); // In a Select, we click the trigger
    await page.locator('[role="option"]:has-text("Temporary Password")').click();

    // Fill temporary password
    await page.fill('input[name="tempPassword"]', 'Admin123!');

    // Submit
    // Click Create User
    await page.locator('button:has-text("Create User")').click();

    // Wait for ANY toast to appear so we can see if it's an error or success
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    
    // Assert it contains success message (this will print the actual text if it fails)
    await expect(toastMessage).toContainText('User successfully created!');
  });

  test('2. should View the created user', async ({ page }) => {
    await page.goto('http://localhost:5173/user-pool');
    await page.waitForLoadState('networkidle');

    // Search for user
    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000); // Wait for debounce

    // Click View Action (Assuming it has a specific title)
    // Here we find the row containing the email, and click the View button inside it
    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="View"]').click();

    // Verify modal is open and shows user details
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${userEmail}`).first()).toBeVisible();
    await expect(page.locator('text=Aaron Kyle Efondo').first()).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('3. should Edit the created user', async ({ page }) => {
    await page.goto('http://localhost:5173/user-pool');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000);

    // Click Edit Action
    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="Edit"]').click();

    // Verify modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Edit accessible clients (toggle first option to add/remove)
    await page.locator('input[placeholder="Select accessible app clients"]').click();
    await page.locator('[data-slot="combobox-item"]').nth(0).click();
    await page.keyboard.press('Escape'); // Close dropdown to ensure Save button is clickable

    // Save
    await page.click('button:has-text("Save")');

    // Verify success toast
    await expect(page.locator('text=User updated successfully')).toBeVisible({ timeout: 10000 });
  });

  test('4. should Delete (temp delete) the created user', async ({ page }) => {
    await page.goto('http://localhost:5173/user-pool');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000);

    // Click Delete/Archive Action
    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="Delete"]').click();

    // Confirm deletion in the alert dialog
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Remove")').click();

    // Verify success toast
    await expect(page.locator(`text=${userEmail} removed successfully`)).toBeVisible({ timeout: 10000 });
  });

  test('5. should go to Archived Users and Restore the user', async ({ page }) => {
    await page.goto('http://localhost:5173/user-pool');
    await page.waitForLoadState('networkidle');

    // Click Archived Users button
    await page.locator('button:has-text("Archived Users")').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/archived/);

    // Search for user in archived list
    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000);

    // Click Restore Action
    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="Restore"]').click();

    // Confirm restoration
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Restore")').click();

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/restored/i);
  });

  test('6. should temporarily delete the user again', async ({ page }) => {
    // This repeats the temp delete so we can test permanent delete
    await page.goto('http://localhost:5173/user-pool');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000);

    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="Delete"]').click();

    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Remove")').click();

    await expect(page.locator(`text=${userEmail} removed successfully`)).toBeVisible({ timeout: 10000 });
  });

  test('7. should Permanently Delete the user in Archived Users', async ({ page }) => {
    await page.goto('http://localhost:5173/user-pool/archived');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder="Search by email, or name..."]', userEmail);
    await page.waitForTimeout(1000);

    // Click Permanently Delete Action
    const row = page.locator(`tr:has-text("${userEmail}")`);
    await row.locator('button[title^="Permanently delete"]').click();

    // Confirm permanent deletion
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.locator('button:has-text("Delete")').click();

    // Verify success toast
    const toastMessage = page.locator('[data-sonner-toast]');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });
    await expect(toastMessage).toContainText(/permanently deleted|removed completely|deleted/i);
  });
});
