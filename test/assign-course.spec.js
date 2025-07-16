import { test, expect } from '@playwright/test';

test.describe('TestUser', () => {
  test.beforeEach(async ({ page }) => {

    // Navigate to login page first
    await page.goto('http://localhost:3000/login');
    
    // Check if already logged in, if not perform login
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Fill login form
      await page.fill('input[placeholder="Username"]', 'manit.ji');
      await page.fill('input[placeholder="Password"]', '075317524');
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForURL('http://localhost:3000', { timeout: 10000 });
    }

  });

  test('should add new user', async ({ page }) => {
    // Navigate to user management page
    await page.goto('http://localhost:3000/user');
    
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Click add new user button
    await page.click('button:has-text("เพิ่มใหม่")',{timeout: 5000});
    

    // Wait for modal to open
   await expect(page.locator('.modal')).toBeVisible();
    
    // Fill user form
    await page.fill('input[name="firstname"]', 'John');
    await page.fill('input[name="lastname"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.selectOption('select[name="role"]', 'นักวิทยาศาสตร์');
    
    // Submit form
    await page.click('button:has-text("บันทึก")');
    
    // Wait for success message or modal to close
    await expect(page.locator('.modal')).not.toBeVisible();
    
    // Verify user was added to table
    await expect(page.locator('table')).toContainText('John Doe');
  });

  test('should edit existing user', async ({ page }) => {
    // Navigate to user management page
    await page.goto('http://localhost:3000/user');
    
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Click edit button on first user
    await page.click('button:has-text("แก้ไข")');
    
    // Wait for modal to open
    await expect(page.locator('.modal')).toBeVisible();
    
    // Modify user information
    await page.fill('input[name="firstname"]', 'Jane');
    await page.fill('input[name="lastname"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    
    // Submit form
    await page.click('button:has-text("บันทึก")');
    
    // Wait for success message or modal to close
    await expect(page.locator('.modal')).not.toBeVisible();
    
    // Verify user was updated in table
    await expect(page.locator('table')).toContainText('Jane Smith');
  });

  test('should delete user', async ({ page }) => {
    // Navigate to user management page
    await page.goto('http://localhost:3000/user');
    
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Get initial user count
    const initialRows = await page.locator('table tbody tr').count();
    
    // Click delete button on first user
    await page.click('button:has-text("ลบ")');
    
    // Handle confirmation dialog
    await page.on('dialog', dialog => dialog.accept());
    
    // Or if using custom modal confirmation
    const confirmButton = page.locator('button:has-text("ตกลง")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify user count decreased
    const finalRows = await page.locator('table tbody tr').count();
    expect(finalRows).toBeLessThan(initialRows);
  });

  test('should search users', async ({ page }) => {
    // Navigate to user management page
    await page.goto('http://localhost:3000/user');
    
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="ค้นหา"]');
    
    // Search for specific user
    await searchInput.fill('John');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results
    await expect(page.locator('table tbody tr')).toContainText('John');
  });

  test('should validate required fields when adding user', async ({ page }) => {
    // Navigate to user management page
    await page.goto('http://localhost:3000/user');
    
    // Wait for page to load
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Click add new user button
    await page.click('button:has-text("เพิ่มใหม่")');
    
    // Wait for modal to open
    await expect(page.locator('.modal')).toBeVisible();
    
    // Try to submit empty form
    await page.click('button:has-text("บันทึก")');
    
    // Check for validation errors
    await expect(page.locator('.text-red-500')).toBeVisible();
    
    // Or check if form is still open (didn't submit)
    await expect(page.locator('.modal')).toBeVisible();
  });

});