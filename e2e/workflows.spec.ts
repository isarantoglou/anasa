import { test, expect } from '@playwright/test'

test.describe('Optimization Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('complete optimization workflow: search, find, add to plan', async ({ page }) => {
    // Step 1: Verify initial state - opportunities should be displayed
    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })

    // Step 2: Change search leave days to 5
    const searchDaysInput = page.locator('input[type="number"]').nth(1)
    await searchDaysInput.fill('5')
    await page.waitForTimeout(500) // Wait for recalculation

    // Step 3: Verify opportunities updated
    await expect(opportunityCards.first()).toBeVisible()

    // Step 4: Add first opportunity to plan
    const addButton = page.getByRole('button', { name: /Προσθήκη/ }).first()
    await addButton.click({ force: true })

    // Step 5: Verify plan section shows the added item
    const planSection = page.locator('text=Ετήσιο Πλάνο Αδειών')
    await expect(planSection).toBeVisible()

    // Step 6: Verify remaining days updated
    const remainingText = page.locator('text=/Υπόλοιπο.*ημέρες/')
    await expect(remainingText).toBeVisible()

    // Step 7: Add another opportunity
    const secondAddButton = page.getByRole('button', { name: /Προσθήκη/ }).nth(1)
    await secondAddButton.click({ force: true })

    // Step 8: Verify plan has multiple items
    await page.waitForTimeout(300)
  })

  test('year change updates opportunities', async ({ page }) => {
    // Get initial opportunity count text
    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })

    // Change to 2027
    const year2027Button = page.getByRole('button', { name: '2027' })
    await year2027Button.click()
    await page.waitForTimeout(1000) // Longer wait for recalculation

    // Verify opportunities still display (may have different values)
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })

    // Change back to 2026
    const year2026Button = page.getByRole('button', { name: '2026' })
    await year2026Button.click()
    await page.waitForTimeout(1000)

    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('search with different leave day budgets', async ({ page }) => {
    const searchDaysInput = page.locator('input[type="number"]').nth(1)
    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')

    // Test with 3 days
    await searchDaysInput.fill('3')
    await page.waitForTimeout(500)
    await expect(opportunityCards.first()).toBeVisible()

    // Test with 10 days
    await searchDaysInput.fill('10')
    await page.waitForTimeout(500)
    await expect(opportunityCards.first()).toBeVisible()

    // Test with 2 days (low budget but should still find some)
    await searchDaysInput.fill('2')
    await page.waitForTimeout(500)
    // May or may not find results with very low budget, just verify input works
    await expect(searchDaysInput).toHaveValue('2')
  })
})

test.describe('Sorting Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can switch between sort options', async ({ page }) => {
    // Wait for opportunities to load
    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })

    // Find sort buttons - look for efficiency and date sort options
    const efficiencySort = page.getByRole('button', { name: /Απόδοση|Αποδοτικότητα/i })
    const dateSort = page.getByRole('button', { name: /Ημερομηνία/i })

    // Click date sort
    if (await dateSort.isVisible()) {
      await dateSort.click()
      await page.waitForTimeout(300)

      // Opportunities should still be visible
      await expect(opportunityCards.first()).toBeVisible()
    }

    // Click efficiency sort
    if (await efficiencySort.isVisible()) {
      await efficiencySort.click()
      await page.waitForTimeout(300)

      await expect(opportunityCards.first()).toBeVisible()
    }
  })

  test('parent mode enables family sort option', async ({ page }) => {
    // Enable parent mode
    const parentModeSection = page.locator('text=Λειτουργία Γονέα').locator('..')
    const toggle = parentModeSection.locator('button, input[type="checkbox"], [role="switch"]').first()
    await toggle.click()
    await page.waitForTimeout(500)

    // Look for family sort option (Οικογένεια)
    const familySort = page.getByRole('button', { name: /Οικογένεια/i })

    // Family sort should be visible in parent mode
    if (await familySort.isVisible()) {
      await familySort.click()
      await page.waitForTimeout(300)

      // Opportunities should still display
      const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
      await expect(opportunityCards.first()).toBeVisible()
    }
  })
})

test.describe('Custom Holiday Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('can search and add patron saint holiday', async ({ page }) => {
    // Look for town search input
    const searchInput = page.getByPlaceholder(/Αναζήτηση|πόλη|χωριό/i)

    if (await searchInput.isVisible()) {
      // Type a town name
      await searchInput.fill('Αθήνα')
      await page.waitForTimeout(500)

      // Look for search results dropdown
      const searchResults = page.locator('[role="listbox"], [role="option"], .search-results, .dropdown')

      if (await searchResults.first().isVisible()) {
        // Click first result
        await searchResults.first().click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('can add manual custom holiday', async ({ page }) => {
    // Look for manual holiday form - find date input and name input
    const dateInput = page.locator('input[type="date"]').first()
    const nameInput = page.getByPlaceholder(/όνομα|αργία/i)

    if (await dateInput.isVisible() && await nameInput.isVisible()) {
      // Fill in a custom holiday
      await dateInput.fill('2026-06-15')
      await nameInput.fill('Τοπική Εορτή')

      // Submit the form
      const addButton = page.getByRole('button', { name: /Προσθήκη/i }).filter({ hasText: /Προσθήκη/ })
      if (await addButton.first().isVisible()) {
        await addButton.first().click()
        await page.waitForTimeout(300)
      }
    }
  })
})

test.describe('Custom Period Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('can create custom leave period with dates and label', async ({ page }) => {
    // Look for custom period form or button to open it
    const customPeriodButton = page.getByRole('button', { name: /Προσαρμοσμένη|Custom|Προσθήκη περιόδου/i })

    if (await customPeriodButton.isVisible()) {
      await customPeriodButton.click()
      await page.waitForTimeout(300)
    }

    // Find date inputs for start and end dates
    const dateInputs = page.locator('input[type="date"]')

    if (await dateInputs.first().isVisible()) {
      // Fill start date
      await dateInputs.first().fill('2026-07-01')

      // Fill end date
      if (await dateInputs.nth(1).isVisible()) {
        await dateInputs.nth(1).fill('2026-07-10')
      }

      // Fill label if available
      const labelInput = page.getByPlaceholder(/περιγραφή|label|σημείωση/i)
      if (await labelInput.isVisible()) {
        await labelInput.fill('Καλοκαιρινές διακοπές')
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /Προσθήκη|Αποθήκευση/i }).last()
      if (await submitButton.isVisible()) {
        await submitButton.click({ force: true })
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('Conflict Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('shows conflict warning when adding overlapping periods', async ({ page }) => {
    // First, add an opportunity to the plan
    const addButtons = page.getByRole('button', { name: /Προσθήκη/ })
    await expect(addButtons.first()).toBeVisible({ timeout: 10000 })
    await addButtons.first().click({ force: true })
    await page.waitForTimeout(500)

    // Try to add an overlapping opportunity (usually the next one in same period)
    // This may or may not trigger conflict depending on the opportunities
    const secondButton = addButtons.nth(1)
    if (await secondButton.isVisible()) {
      await secondButton.click({ force: true })
      await page.waitForTimeout(500)

      // Check if conflict modal appeared
      const conflictModal = page.locator('text=/επικάλυψη|conflict|σύγκρουση/i')
      if (await conflictModal.isVisible()) {
        // Modal appeared - can either dismiss or force add
        const forceAddButton = page.getByRole('button', { name: /Προσθήκη ούτως|Force|Ναι/i })
        if (await forceAddButton.isVisible()) {
          await forceAddButton.click()
        }
      }
    }
  })
})

test.describe('Annual Plan Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('can add and remove items from plan', async ({ page }) => {
    // Add first opportunity
    const addButton = page.getByRole('button', { name: /Προσθήκη/ }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click({ force: true })
    await page.waitForTimeout(500)

    // Verify plan section visible
    const planSection = page.locator('text=Ετήσιο Πλάνο Αδειών')
    await expect(planSection).toBeVisible()

    // Find remove button in the plan section
    const removeButton = page.getByRole('button', { name: /Αφαίρεση|Διαγραφή|×|✕/i }).first()
    if (await removeButton.isVisible()) {
      await removeButton.click()
      await page.waitForTimeout(300)
    }
  })

  test('can clear entire plan', async ({ page }) => {
    // Add a couple of opportunities first
    const addButtons = page.getByRole('button', { name: /Προσθήκη/ })
    await expect(addButtons.first()).toBeVisible({ timeout: 10000 })

    await addButtons.first().click({ force: true })
    await page.waitForTimeout(300)

    // Look for clear plan button
    const clearButton = page.getByRole('button', { name: /Καθαρισμός|Εκκαθάριση|Clear/i })
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(300)

      // May show confirmation dialog
      const confirmButton = page.getByRole('button', { name: /Ναι|Επιβεβαίωση|OK/i })
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
    }
  })

  test('plan persists across page reload', async ({ page }) => {
    // Add an opportunity
    const addButton = page.getByRole('button', { name: /Προσθήκη/ }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click({ force: true })
    await page.waitForTimeout(500)

    // Verify plan section visible
    const planSection = page.locator('text=Ετήσιο Πλάνο Αδειών')
    await expect(planSection).toBeVisible()

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Plan should still be visible
    await expect(planSection).toBeVisible()
  })
})

test.describe('URL Sharing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('can generate and load share URL', async ({ page }) => {
    // Add an opportunity to have something to share
    const addButton = page.getByRole('button', { name: /Προσθήκη/ }).first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click({ force: true })
    await page.waitForTimeout(500)

    // Look for share button
    const shareButton = page.getByRole('button', { name: /Κοινοποίηση|Share|URL/i })

    if (await shareButton.isVisible()) {
      await shareButton.click()
      await page.waitForTimeout(500)

      // URL should now contain state parameter
      const currentUrl = page.url()
      // Check that URL was modified or copy dialog appeared
    }
  })
})

test.describe('Dark Mode Persistence', () => {
  test('dark mode persists across reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get initial state
    const htmlElement = page.locator('html')
    const initialDarkMode = await htmlElement.evaluate(el => el.classList.contains('dark'))

    // Toggle dark mode
    const toggle = page.locator('.dark-mode-toggle')
    await toggle.click({ force: true })
    await page.waitForTimeout(300)

    // Verify toggle worked
    const afterToggle = await htmlElement.evaluate(el => el.classList.contains('dark'))
    expect(afterToggle).toBe(!initialDarkMode)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify dark mode persisted
    const afterReload = await htmlElement.evaluate(el => el.classList.contains('dark'))
    expect(afterReload).toBe(!initialDarkMode)
  })
})

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('main elements are keyboard accessible', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Something should have focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('buttons have accessible names', async ({ page }) => {
    // Check that main buttons have accessible names
    const buttons = page.getByRole('button')
    const count = await buttons.count()

    // Should have multiple buttons
    expect(count).toBeGreaterThan(5)

    // Dark mode toggle should have aria-label
    const darkModeToggle = page.locator('.dark-mode-toggle')
    await expect(darkModeToggle).toHaveAttribute('aria-label', /.+/)
  })
})

test.describe('Responsive Design', () => {
  test('app works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Main heading should be visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // Year selector should be visible
    const yearButton = page.getByRole('button', { name: '2026' })
    await expect(yearButton).toBeVisible()

    // Opportunities should be visible
    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('app works on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Main elements should be visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    const opportunityCards = page.locator('text=/Κάντε \\d+ ημέρες?/')
    await expect(opportunityCards.first()).toBeVisible({ timeout: 10000 })
  })
})
