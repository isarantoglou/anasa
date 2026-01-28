import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAnnualPlan } from './useAnnualPlan'
import type { OptimizationResult } from '../types'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

vi.stubGlobal('localStorage', localStorageMock)

// Helper to create mock opportunities
function createMockOpportunity(overrides: Partial<OptimizationResult> = {}): OptimizationResult {
  const startDate = overrides.range?.startDate || new Date(2026, 3, 10) // April 10, 2026
  const endDate = overrides.range?.endDate || new Date(2026, 3, 15) // April 15, 2026

  return {
    range: { startDate, endDate },
    totalDays: 6,
    leaveDaysRequired: 3,
    freeDays: 3,
    efficiency: 2,
    efficiencyLabel: 'Μετατρέψτε 3 ημέρες σε 6',
    days: [
      { date: startDate, cost: 1, isHoliday: false, isWeekend: false },
      {
        date: new Date(startDate.getTime() + 86400000),
        cost: 0,
        isHoliday: false,
        isWeekend: true,
      },
    ],
    ...overrides,
  }
}

describe('useAnnualPlan', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty plan', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, showAnnualPlan } = useAnnualPlan(currentYear, totalDays)

      expect(annualPlan.value).toEqual([])
      expect(showAnnualPlan.value).toBe(false)
    })
  })

  describe('addToPlan', () => {
    it('should add opportunity to plan', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, showAnnualPlan } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addToPlan(opportunity)

      expect(annualPlan.value).toHaveLength(1)
      expect(annualPlan.value[0]!.totalDays).toBe(6)
      expect(annualPlan.value[0]!.leaveDaysRequired).toBe(3)
      expect(showAnnualPlan.value).toBe(true)
    })

    it('should not add duplicate opportunity', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addToPlan(opportunity)
      addToPlan(opportunity) // Try to add again

      expect(annualPlan.value).toHaveLength(1)
    })

    it('should detect conflicting periods and show warning', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, conflictWarning } = useAnnualPlan(currentYear, totalDays)

      // Add first opportunity (April 10-15)
      const opp1 = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 10),
          endDate: new Date(2026, 3, 15),
        },
      })
      addToPlan(opp1)

      // Try to add overlapping opportunity (April 13-18)
      const opp2 = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 13),
          endDate: new Date(2026, 3, 18),
        },
      })
      addToPlan(opp2)

      expect(annualPlan.value).toHaveLength(1)
      expect(conflictWarning.value.show).toBe(true)
      expect(conflictWarning.value.pendingOpportunity).toEqual(opp2)
    })
  })

  describe('forceAddToPlan', () => {
    it('should add conflicting opportunity when forced', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, forceAddToPlan, conflictWarning } = useAnnualPlan(
        currentYear,
        totalDays
      )

      const opp1 = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 10),
          endDate: new Date(2026, 3, 15),
        },
      })
      addToPlan(opp1)

      const opp2 = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 13),
          endDate: new Date(2026, 3, 18),
        },
      })
      addToPlan(opp2)

      expect(conflictWarning.value.show).toBe(true)

      forceAddToPlan()

      expect(annualPlan.value).toHaveLength(2)
      expect(conflictWarning.value.show).toBe(false)
    })
  })

  describe('removeFromPlan', () => {
    it('should remove opportunity by id', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, removeFromPlan } = useAnnualPlan(currentYear, totalDays)

      addToPlan(createMockOpportunity())
      expect(annualPlan.value).toHaveLength(1)

      const id = annualPlan.value[0]!.id
      removeFromPlan(id)

      expect(annualPlan.value).toHaveLength(0)
    })

    it('should do nothing when id not found', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, removeFromPlan } = useAnnualPlan(currentYear, totalDays)

      addToPlan(createMockOpportunity())
      removeFromPlan('non-existent-id')

      expect(annualPlan.value).toHaveLength(1)
    })
  })

  describe('clearPlan', () => {
    it('should remove all opportunities', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, clearPlan } = useAnnualPlan(currentYear, totalDays)

      addToPlan(
        createMockOpportunity({
          range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
        })
      )
      addToPlan(
        createMockOpportunity({
          range: { startDate: new Date(2026, 4, 10), endDate: new Date(2026, 4, 15) },
        })
      )

      expect(annualPlan.value).toHaveLength(2)

      clearPlan()

      expect(annualPlan.value).toHaveLength(0)
    })
  })

  describe('isInPlan', () => {
    it('should return true for existing opportunity', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, isInPlan } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addToPlan(opportunity)

      expect(isInPlan(opportunity)).toBe(true)
    })

    it('should return false for non-existing opportunity', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { isInPlan } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      expect(isInPlan(opportunity)).toBe(false)
    })
  })

  describe('hasConflict', () => {
    it('should detect overlapping periods', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, hasConflict } = useAnnualPlan(currentYear, totalDays)

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      // Overlapping opportunity
      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 14), endDate: new Date(2026, 3, 20) },
      })

      expect(hasConflict(opp2)).not.toBeNull()
    })

    it('should return null for non-overlapping periods', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, hasConflict } = useAnnualPlan(currentYear, totalDays)

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      // Non-overlapping opportunity
      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 20), endDate: new Date(2026, 3, 25) },
      })

      expect(hasConflict(opp2)).toBeNull()
    })

    it('should detect adjacent periods as non-conflicting', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, hasConflict } = useAnnualPlan(currentYear, totalDays)

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      // Adjacent opportunity (starts day after opp1 ends)
      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 16), endDate: new Date(2026, 3, 20) },
      })

      expect(hasConflict(opp2)).toBeNull()
    })
  })

  describe('computed values', () => {
    it('should calculate annualPlanTotalDays correctly', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, annualPlanTotalDays } = useAnnualPlan(currentYear, totalDays)

      addToPlan(
        createMockOpportunity({
          leaveDaysRequired: 3,
          range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
        })
      )
      addToPlan(
        createMockOpportunity({
          leaveDaysRequired: 5,
          range: { startDate: new Date(2026, 4, 10), endDate: new Date(2026, 4, 18) },
        })
      )

      expect(annualPlanTotalDays.value).toBe(8)
    })

    it('should calculate remainingLeaveDays correctly', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, remainingLeaveDays } = useAnnualPlan(currentYear, totalDays)

      expect(remainingLeaveDays.value).toBe(25)

      addToPlan(
        createMockOpportunity({
          leaveDaysRequired: 5,
          range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 18) },
        })
      )

      expect(remainingLeaveDays.value).toBe(20)
    })
  })

  describe('dismissConflictWarning', () => {
    it('should reset conflict warning state', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan, conflictWarning, dismissConflictWarning } = useAnnualPlan(
        currentYear,
        totalDays
      )

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 18) },
      })
      addToPlan(opp2)

      expect(conflictWarning.value.show).toBe(true)

      dismissConflictWarning()

      expect(conflictWarning.value.show).toBe(false)
      expect(conflictWarning.value.conflictWith).toBeNull()
      expect(conflictWarning.value.pendingOpportunity).toBeNull()
    })
  })

  describe('localStorage persistence', () => {
    it('should load plan from localStorage when loadFromStorage is called', () => {
      const storedPlan = {
        year: 2026,
        opportunities: [
          {
            id: 'test-id',
            range: {
              startDate: new Date(2026, 3, 10).toISOString(),
              endDate: new Date(2026, 3, 15).toISOString(),
            },
            totalDays: 6,
            leaveDaysRequired: 3,
            freeDays: 3,
            efficiency: 2,
            efficiencyLabel: 'Test',
            days: [
              {
                date: new Date(2026, 3, 10).toISOString(),
                cost: 1,
                isHoliday: false,
                isWeekend: false,
              },
            ],
          },
        ],
      }
      localStorageMock.store['anasa-annual-plan'] = JSON.stringify(storedPlan)

      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, showAnnualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      // Call loadFromStorage to load the plan
      loadFromStorage()

      expect(annualPlan.value).toHaveLength(1)
      expect(annualPlan.value[0]!.id).toBe('test-id')
      expect(showAnnualPlan.value).toBe(true)
    })

    it('should restore Date objects from ISO strings', () => {
      const storedPlan = {
        year: 2026,
        opportunities: [
          {
            id: 'test-id',
            range: {
              startDate: '2026-04-10T00:00:00.000Z',
              endDate: '2026-04-15T00:00:00.000Z',
            },
            totalDays: 6,
            leaveDaysRequired: 3,
            freeDays: 3,
            efficiency: 2,
            efficiencyLabel: 'Test',
            days: [
              { date: '2026-04-10T00:00:00.000Z', cost: 1, isHoliday: false, isWeekend: false },
            ],
          },
        ],
      }
      localStorageMock.store['anasa-annual-plan'] = JSON.stringify(storedPlan)

      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      loadFromStorage()

      expect(annualPlan.value[0]!.range.startDate).toBeInstanceOf(Date)
      expect(annualPlan.value[0]!.range.endDate).toBeInstanceOf(Date)
      expect(annualPlan.value[0]!.days[0]!.date).toBeInstanceOf(Date)
    })

    it('should only load plan for current year', () => {
      const storedPlan = {
        year: 2025, // Different year
        opportunities: [
          {
            id: 'test-id',
            range: {
              startDate: new Date(2025, 3, 10).toISOString(),
              endDate: new Date(2025, 3, 15).toISOString(),
            },
            totalDays: 6,
            leaveDaysRequired: 3,
            freeDays: 3,
            efficiency: 2,
            efficiencyLabel: 'Test',
            days: [],
          },
        ],
      }
      localStorageMock.store['anasa-annual-plan'] = JSON.stringify(storedPlan)

      const currentYear = ref(2026) // Current year is 2026
      const totalDays = ref(25)
      const { annualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      loadFromStorage()

      // Should not load plan from different year
      expect(annualPlan.value).toHaveLength(0)
    })

    it('should handle corrupted JSON gracefully', () => {
      localStorageMock.store['anasa-annual-plan'] = 'not valid json {'

      const currentYear = ref(2026)
      const totalDays = ref(25)

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Should not throw
      expect(() => {
        const { annualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)
        loadFromStorage()
        expect(annualPlan.value).toHaveLength(0)
      }).not.toThrow()

      // Verify error was logged
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it('should not show annual plan panel when no items loaded', () => {
      // Empty storage
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { showAnnualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      loadFromStorage()

      expect(showAnnualPlan.value).toBe(false)
    })

    it('should save plan to localStorage when modified', async () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addToPlan } = useAnnualPlan(currentYear, totalDays)

      addToPlan(createMockOpportunity())

      // Wait for Vue's next tick for the watcher to trigger
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-annual-plan', expect.any(String))

      const savedData = JSON.parse(localStorageMock.store['anasa-annual-plan']!)
      expect(savedData.year).toBe(2026)
      expect(savedData.opportunities).toHaveLength(1)
    })

    it('should persist isCustom flag in localStorage', async () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      addCustomPeriod(createMockOpportunity())

      await new Promise((resolve) => setTimeout(resolve, 10))

      const savedData = JSON.parse(localStorageMock.store['anasa-annual-plan']!)
      expect(savedData.opportunities[0].isCustom).toBe(true)
    })

    it('should restore isCustom flag from localStorage', () => {
      const storedPlan = {
        year: 2026,
        opportunities: [
          {
            id: 'test-id',
            range: {
              startDate: new Date(2026, 3, 10).toISOString(),
              endDate: new Date(2026, 3, 15).toISOString(),
            },
            totalDays: 6,
            leaveDaysRequired: 3,
            freeDays: 3,
            efficiency: 2,
            efficiencyLabel: 'Test',
            days: [],
            isCustom: true,
          },
        ],
      }
      localStorageMock.store['anasa-annual-plan'] = JSON.stringify(storedPlan)

      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      loadFromStorage()

      expect(annualPlan.value[0]!.isCustom).toBe(true)
    })

    it('should persist label in localStorage', async () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      addCustomPeriod(createMockOpportunity(), 'Ταξίδι στην Ελλάδα')

      await new Promise((resolve) => setTimeout(resolve, 10))

      const savedData = JSON.parse(localStorageMock.store['anasa-annual-plan']!)
      expect(savedData.opportunities[0].label).toBe('Ταξίδι στην Ελλάδα')
    })

    it('should restore label from localStorage', () => {
      const storedPlan = {
        year: 2026,
        opportunities: [
          {
            id: 'test-id',
            range: {
              startDate: new Date(2026, 3, 10).toISOString(),
              endDate: new Date(2026, 3, 15).toISOString(),
            },
            totalDays: 6,
            leaveDaysRequired: 3,
            freeDays: 3,
            efficiency: 2,
            efficiencyLabel: 'Test',
            days: [],
            isCustom: true,
            label: 'Διακοπές Καλοκαιριού',
          },
        ],
      }
      localStorageMock.store['anasa-annual-plan'] = JSON.stringify(storedPlan)

      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, loadFromStorage } = useAnnualPlan(currentYear, totalDays)

      loadFromStorage()

      expect(annualPlan.value[0]!.label).toBe('Διακοπές Καλοκαιριού')
    })
  })

  describe('addCustomPeriod', () => {
    it('should add custom period with isCustom flag', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity)

      expect(annualPlan.value).toHaveLength(1)
      expect(annualPlan.value[0]!.isCustom).toBe(true)
    })

    it('should not add duplicate custom period', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity)
      addCustomPeriod(opportunity) // Try again

      expect(annualPlan.value).toHaveLength(1)
    })

    it('should detect conflict with existing periods', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, addCustomPeriod, conflictWarning } = useAnnualPlan(
        currentYear,
        totalDays
      )

      // Add regular opportunity
      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      // Try to add overlapping custom period
      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 18) },
      })
      addCustomPeriod(opp2)

      expect(annualPlan.value).toHaveLength(1)
      expect(conflictWarning.value.show).toBe(true)
      expect(conflictWarning.value.isCustom).toBe(true)
    })

    it('should preserve isCustom flag when force adding conflicting period', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, addCustomPeriod, forceAddToPlan } = useAnnualPlan(
        currentYear,
        totalDays
      )

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 18) },
      })
      addCustomPeriod(opp2)

      forceAddToPlan()

      expect(annualPlan.value).toHaveLength(2)
      expect(annualPlan.value[0]!.isCustom).toBeUndefined()
      expect(annualPlan.value[1]!.isCustom).toBe(true)
    })

    it('should add non-conflicting custom period directly', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, addCustomPeriod, conflictWarning } = useAnnualPlan(
        currentYear,
        totalDays
      )

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      // Non-overlapping custom period
      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 4, 10), endDate: new Date(2026, 4, 15) },
      })
      addCustomPeriod(opp2)

      expect(annualPlan.value).toHaveLength(2)
      expect(conflictWarning.value.show).toBe(false)
      expect(annualPlan.value[1]!.isCustom).toBe(true)
    })

    it('should add custom period with label', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity, 'Ταξίδι στην Αμερική')

      expect(annualPlan.value).toHaveLength(1)
      expect(annualPlan.value[0]!.label).toBe('Ταξίδι στην Αμερική')
    })

    it('should not set label when empty string', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity, '')

      expect(annualPlan.value).toHaveLength(1)
      expect(annualPlan.value[0]!.label).toBeUndefined()
    })

    it('should preserve label when force adding conflicting period', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan, addCustomPeriod, forceAddToPlan } = useAnnualPlan(
        currentYear,
        totalDays
      )

      const opp1 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
      })
      addToPlan(opp1)

      const opp2 = createMockOpportunity({
        range: { startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 18) },
      })
      addCustomPeriod(opp2, 'Διακοπές Πάσχα')

      forceAddToPlan()

      expect(annualPlan.value).toHaveLength(2)
      expect(annualPlan.value[1]!.label).toBe('Διακοπές Πάσχα')
    })

    it('should handle label with special characters', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity, 'Γάμος & Μήνα του Μέλιτος!')

      expect(annualPlan.value[0]!.label).toBe('Γάμος & Μήνα του Μέλιτος!')
    })

    it('should handle label with emoji', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addCustomPeriod(opportunity, 'Διακοπές 🏖️ στην Κρήτη')

      expect(annualPlan.value[0]!.label).toBe('Διακοπές 🏖️ στην Κρήτη')
    })

    it('should handle very long label', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addCustomPeriod } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      const longLabel = 'Α'.repeat(100) // 100 Greek characters
      addCustomPeriod(opportunity, longLabel)

      expect(annualPlan.value[0]!.label).toBe(longLabel)
    })
  })

  describe('regular addToPlan should not set isCustom', () => {
    it('should not have isCustom flag for regular opportunities', () => {
      const currentYear = ref(2026)
      const totalDays = ref(25)
      const { annualPlan, addToPlan } = useAnnualPlan(currentYear, totalDays)

      const opportunity = createMockOpportunity()
      addToPlan(opportunity)

      expect(annualPlan.value[0]!.isCustom).toBeUndefined()
    })
  })
})
