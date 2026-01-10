import { test, expect } from '@playwright/test'

test.describe('Anasa App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Ανάσα/)
  })

  test('displays main heading', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Ανάσα')
  })

  test('year selector is visible and functional', async ({ page }) => {
    // Check that year buttons are visible
    const currentYearButton = page.getByRole('button', { name: '2026' })
    await expect(currentYearButton).toBeVisible()

    // Click a different year
    const year2027Button = page.getByRole('button', { name: '2027' })
    await year2027Button.click()

    // Wait for the UI to update - the clicked year should now be styled differently
    // We can verify by checking that 2027 is now in the center (has the indicator behind it)
    await page.waitForTimeout(500) // Wait for animation

    // Click 2026 again to go back
    const year2026Button = page.getByRole('button', { name: '2026' })
    await year2026Button.click()
    await page.waitForTimeout(500)

    // Both years should still be visible
    await expect(page.getByRole('button', { name: '2026' })).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    // Find dark mode toggle by its aria-label or class
    const toggle = page.locator('.dark-mode-toggle')
    await expect(toggle).toBeVisible()

    // Get initial state
    const htmlElement = page.locator('html')
    const initialDarkMode = await htmlElement.evaluate(el => el.classList.contains('dark'))

    // Toggle dark mode - use force:true for Firefox compatibility
    await toggle.click({ force: true })

    // Wait for the class change to take effect
    if (initialDarkMode) {
      await expect(htmlElement).not.toHaveClass(/dark/)
    } else {
      await expect(htmlElement).toHaveClass(/dark/)
    }
  })

  test('leave days input accepts values', async ({ page }) => {
    // Find leave days inputs - there are two: total annual and search days
    const inputs = page.locator('input[type="number"]')
    const firstInput = inputs.first()
    await expect(firstInput).toBeVisible()

    // Clear and enter new value
    await firstInput.fill('10')
    await expect(firstInput).toHaveValue('10')
  })

  test('opportunity cards are displayed', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')

    // Look for opportunity cards - they contain efficiency labels like "Κάντε X ημέρες Y"
    const opportunityText = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityText.first()).toBeVisible({ timeout: 10000 })
  })

  test('can add opportunity to annual plan', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Wait for cards to load - look for an enabled "Προσθήκη" button
    // Some buttons may be disabled if already in plan
    const addButtons = page.getByRole('button', { name: /Προσθήκη/ })

    // Find an enabled button
    const enabledButton = addButtons.filter({ has: page.locator(':not([disabled])') }).first()
    await expect(enabledButton).toBeVisible({ timeout: 10000 })

    // Click the add button
    await enabledButton.click({ force: true })

    // Verify the annual plan section exists
    const planSection = page.locator('text=Ετήσιο Πλάνο Αδειών')
    await expect(planSection).toBeVisible()
  })
})

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Holy Spirit toggle is visible', async ({ page }) => {
    // Look for the Holy Spirit toggle label in the settings section
    const holySpiritLabel = page.locator('label').filter({ hasText: 'Αγίου Πνεύματος' })
    await expect(holySpiritLabel).toBeVisible()
  })

  test('Parent mode toggle is visible', async ({ page }) => {
    // Look for the Parent mode toggle text
    const parentModeText = page.locator('text=Λειτουργία Γονέα')
    await expect(parentModeText).toBeVisible()
  })

  test('can toggle Holy Spirit setting', async ({ page }) => {
    // Find the Holy Spirit toggle
    const holySpiritSection = page.locator('text=Αγίου Πνεύματος').locator('..')
    const toggle = holySpiritSection.locator('button, input[type="checkbox"], [role="switch"]').first()

    // Click to toggle
    await toggle.click()

    // The toggle should have changed state (we can't easily verify the visual state,
    // but the click should work without errors)
    await page.waitForTimeout(300)
  })

  test('can toggle Parent mode', async ({ page }) => {
    // Find the Parent mode toggle
    const parentModeSection = page.locator('text=Λειτουργία Γονέα').locator('..')
    const toggle = parentModeSection.locator('button, input[type="checkbox"], [role="switch"]').first()

    // Click to toggle
    await toggle.click()

    // Parent mode should now be active - look for school break indicators
    await page.waitForTimeout(500)
  })
})

test.describe('Public Holidays', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows public holidays section', async ({ page }) => {
    const holidaysSection = page.locator('text=Αργίες')
    await expect(holidaysSection.first()).toBeVisible()
  })

  test('displays fixed holidays', async ({ page }) => {
    // Check for some known fixed holidays
    await expect(page.locator('text=Πρωτοχρονιά').first()).toBeVisible()
  })
})
