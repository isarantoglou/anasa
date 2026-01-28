import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  encodeState,
  decodeState,
  generateShareUrl,
  loadStateFromUrl,
  hasSharedState,
  clearUrlState,
  recalculateOpportunity,
  recalculateAppState,
  type AppState,
} from './useShareableState'
import type { SavedOpportunity, Holiday } from '../types'

// Helper to create mock app state
function createMockAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    year: 2026,
    includeHolySpirit: true,
    parentMode: false,
    totalAnnualLeaveDays: 25,
    customHolidays: [],
    annualPlan: [],
    ...overrides,
  }
}

// Helper to create mock opportunity
function createMockOpportunity(overrides: Partial<SavedOpportunity> = {}): SavedOpportunity {
  return {
    id: 'test-id',
    range: {
      startDate: new Date(2026, 3, 10),
      endDate: new Date(2026, 3, 15),
    },
    totalDays: 6,
    leaveDaysRequired: 4,
    freeDays: 2,
    efficiency: 1.5,
    efficiencyLabel: 'Κάντε 4 ημέρες 6',
    days: [],
    addedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Helper to create mock holiday
function createMockHoliday(date: Date, name: string): Holiday {
  return {
    date,
    name,
    nameGreek: name,
    isMovable: false,
    isCustom: false,
  }
}

describe('useShareableState', () => {
  // Save original location
  const originalLocation = window.location

  beforeEach(() => {
    // Mock window.location
    delete (window as unknown as { location?: Location }).location
    ;(window as unknown as { location: Location }).location = {
      ...originalLocation,
      href: 'http://localhost:5173/',
      search: '',
      origin: 'http://localhost:5173',
    } as Location
  })

  afterEach(() => {
    ;(window as unknown as { location: Location }).location = originalLocation
  })

  describe('encodeState', () => {
    it('should encode basic state to compressed string', () => {
      const state = createMockAppState()
      const encoded = encodeState(state)

      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should encode state with custom holidays', () => {
      const state = createMockAppState({
        customHolidays: [{ id: '1', date: '2026-04-23', name: 'Άγιος Γεώργιος' }],
      })
      const encoded = encodeState(state)

      expect(encoded).toBeTruthy()
    })

    it('should encode state with annual plan', () => {
      const state = createMockAppState({
        annualPlan: [createMockOpportunity()],
      })
      const encoded = encodeState(state)

      expect(encoded).toBeTruthy()
    })

    it('should encode state with custom period label', () => {
      const state = createMockAppState({
        annualPlan: [
          createMockOpportunity({
            isCustom: true,
            label: 'Ταξίδι στην Αμερική',
          }),
        ],
      })
      const encoded = encodeState(state)

      expect(encoded).toBeTruthy()
    })
  })

  describe('decodeState', () => {
    it('should decode encoded state correctly', () => {
      const originalState = createMockAppState()
      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded).not.toBeNull()
      expect(decoded!.year).toBe(originalState.year)
      expect(decoded!.includeHolySpirit).toBe(originalState.includeHolySpirit)
      expect(decoded!.parentMode).toBe(originalState.parentMode)
      expect(decoded!.totalAnnualLeaveDays).toBe(originalState.totalAnnualLeaveDays)
    })

    it('should decode state with custom holidays', () => {
      const originalState = createMockAppState({
        customHolidays: [{ id: '1', date: '2026-04-23', name: 'Άγιος Γεώργιος' }],
      })
      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded).not.toBeNull()
      expect(decoded!.customHolidays).toHaveLength(1)
      expect(decoded!.customHolidays[0]!.date).toBe('2026-04-23')
      expect(decoded!.customHolidays[0]!.name).toBe('Άγιος Γεώργιος')
    })

    it('should decode state with annual plan', () => {
      const originalState = createMockAppState({
        annualPlan: [createMockOpportunity()],
      })
      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded).not.toBeNull()
      expect(decoded!.annualPlan).toHaveLength(1)
      expect(decoded!.annualPlan[0]!.range.startDate).toEqual(new Date(2026, 3, 10))
      expect(decoded!.annualPlan[0]!.range.endDate).toEqual(new Date(2026, 3, 15))
    })

    it('should decode state with custom period label', () => {
      const originalState = createMockAppState({
        annualPlan: [
          createMockOpportunity({
            isCustom: true,
            label: 'Ταξίδι στην Αμερική',
          }),
        ],
      })
      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded).not.toBeNull()
      expect(decoded!.annualPlan[0]!.isCustom).toBe(true)
      expect(decoded!.annualPlan[0]!.label).toBe('Ταξίδι στην Αμερική')
    })

    it('should return null for invalid encoded string', () => {
      const decoded = decodeState('invalid-string')
      expect(decoded).toBeNull()
    })

    it('should return null for empty string', () => {
      const decoded = decodeState('')
      expect(decoded).toBeNull()
    })
  })

  describe('generateShareUrl', () => {
    it('should generate URL with encoded state', () => {
      const state = createMockAppState()
      const url = generateShareUrl(state)

      expect(url).toContain('http://localhost:5173/')
      expect(url).toContain('?s=')
    })

    it('should generate valid URL that can be decoded', () => {
      const state = createMockAppState({
        year: 2027,
        includeHolySpirit: false,
      })
      const url = generateShareUrl(state)

      // Extract the encoded parameter
      const urlObj = new URL(url)
      const encoded = urlObj.searchParams.get('s')

      expect(encoded).toBeTruthy()
      const decoded = decodeState(encoded!)
      expect(decoded!.year).toBe(2027)
      expect(decoded!.includeHolySpirit).toBe(false)
    })
  })

  describe('loadStateFromUrl', () => {
    it('should return null when no state in URL', () => {
      window.location.search = ''
      const state = loadStateFromUrl()
      expect(state).toBeNull()
    })

    it('should load state from URL parameter', () => {
      const originalState = createMockAppState({ year: 2028 })
      const encoded = encodeState(originalState)
      window.location.search = `?s=${encoded}`

      const state = loadStateFromUrl()
      expect(state).not.toBeNull()
      expect(state!.year).toBe(2028)
    })
  })

  describe('hasSharedState', () => {
    it('should return false when no state in URL', () => {
      window.location.search = ''
      expect(hasSharedState()).toBe(false)
    })

    it('should return true when state in URL', () => {
      window.location.search = '?s=somevalue'
      expect(hasSharedState()).toBe(true)
    })
  })

  describe('clearUrlState', () => {
    it('should call replaceState to remove state parameter', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
      window.location.search = '?s=somevalue'

      clearUrlState()

      expect(replaceStateSpy).toHaveBeenCalled()
      replaceStateSpy.mockRestore()
    })
  })

  describe('recalculateOpportunity', () => {
    it('should recalculate opportunity properties with holidays', () => {
      const opportunity = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 10), // April 10, 2026 (Friday)
          endDate: new Date(2026, 3, 13), // April 13, 2026 (Monday - Easter Monday)
        },
        totalDays: 0,
        leaveDaysRequired: 0,
        freeDays: 0,
        efficiency: 0,
        efficiencyLabel: '',
        days: [],
      })

      const holidays: Holiday[] = [
        createMockHoliday(new Date(2026, 3, 10), 'Μεγάλη Παρασκευή'),
        createMockHoliday(new Date(2026, 3, 13), 'Δευτέρα του Πάσχα'),
      ]

      const recalculated = recalculateOpportunity(opportunity, holidays)

      expect(recalculated.totalDays).toBe(4)
      expect(recalculated.days.length).toBe(4)
      expect(recalculated.leaveDaysRequired).toBeGreaterThanOrEqual(0)
      expect(recalculated.efficiencyLabel).toBeTruthy()
    })

    it('should preserve id, label, and isCustom', () => {
      const opportunity = createMockOpportunity({
        id: 'my-custom-id',
        isCustom: true,
        label: 'Test Label',
      })

      const recalculated = recalculateOpportunity(opportunity, [])

      expect(recalculated.id).toBe('my-custom-id')
      expect(recalculated.isCustom).toBe(true)
      expect(recalculated.label).toBe('Test Label')
    })
  })

  describe('recalculateAppState', () => {
    it('should recalculate all opportunities in state', () => {
      const state = createMockAppState({
        annualPlan: [
          createMockOpportunity({
            range: {
              startDate: new Date(2026, 0, 1),
              endDate: new Date(2026, 0, 4),
            },
            days: [],
          }),
          createMockOpportunity({
            range: {
              startDate: new Date(2026, 3, 10),
              endDate: new Date(2026, 3, 15),
            },
            days: [],
          }),
        ],
      })

      const holidays: Holiday[] = [createMockHoliday(new Date(2026, 0, 1), 'Πρωτοχρονιά')]

      const recalculated = recalculateAppState(state, holidays)

      expect(recalculated.annualPlan).toHaveLength(2)
      expect(recalculated.annualPlan[0]!.days.length).toBeGreaterThan(0)
      expect(recalculated.annualPlan[1]!.days.length).toBeGreaterThan(0)
    })

    it('should preserve other state properties', () => {
      const state = createMockAppState({
        year: 2027,
        includeHolySpirit: false,
        parentMode: true,
        totalAnnualLeaveDays: 30,
        customHolidays: [{ id: '1', date: '2027-05-01', name: 'Test' }],
      })

      const recalculated = recalculateAppState(state, [])

      expect(recalculated.year).toBe(2027)
      expect(recalculated.includeHolySpirit).toBe(false)
      expect(recalculated.parentMode).toBe(true)
      expect(recalculated.totalAnnualLeaveDays).toBe(30)
      expect(recalculated.customHolidays).toHaveLength(1)
    })
  })

  describe('round-trip encoding/decoding', () => {
    it('should preserve all state through encode/decode cycle', () => {
      const originalState = createMockAppState({
        year: 2027,
        includeHolySpirit: false,
        parentMode: true,
        totalAnnualLeaveDays: 30,
        customHolidays: [
          { id: '1', date: '2027-04-23', name: 'Άγιος Γεώργιος' },
          { id: '2', date: '2027-08-15', name: 'Κοίμηση Θεοτόκου' },
        ],
        annualPlan: [
          createMockOpportunity({
            range: {
              startDate: new Date(2027, 0, 1),
              endDate: new Date(2027, 0, 6),
            },
          }),
          createMockOpportunity({
            range: {
              startDate: new Date(2027, 3, 10),
              endDate: new Date(2027, 3, 20),
            },
            isCustom: true,
            label: 'Διακοπές Πάσχα',
          }),
        ],
      })

      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded).not.toBeNull()
      expect(decoded!.year).toBe(originalState.year)
      expect(decoded!.includeHolySpirit).toBe(originalState.includeHolySpirit)
      expect(decoded!.parentMode).toBe(originalState.parentMode)
      expect(decoded!.totalAnnualLeaveDays).toBe(originalState.totalAnnualLeaveDays)
      expect(decoded!.customHolidays).toHaveLength(2)
      expect(decoded!.annualPlan).toHaveLength(2)
      expect(decoded!.annualPlan[1]!.isCustom).toBe(true)
      expect(decoded!.annualPlan[1]!.label).toBe('Διακοπές Πάσχα')
    })

    it('should handle Greek characters correctly', () => {
      const originalState = createMockAppState({
        customHolidays: [{ id: '1', date: '2026-04-23', name: 'Άγιος Γεώργιος του Τροπαιοφόρου' }],
        annualPlan: [
          createMockOpportunity({
            label: 'Ταξίδι στην Ελλάδα με τα παιδιά',
          }),
        ],
      })

      const encoded = encodeState(originalState)
      const decoded = decodeState(encoded)

      expect(decoded!.customHolidays[0]!.name).toBe('Άγιος Γεώργιος του Τροπαιοφόρου')
      expect(decoded!.annualPlan[0]!.label).toBe('Ταξίδι στην Ελλάδα με τα παιδιά')
    })
  })

  describe('compression efficiency', () => {
    it('should produce reasonably short URLs for typical state', () => {
      const state = createMockAppState({
        annualPlan: [
          createMockOpportunity(),
          createMockOpportunity({
            range: {
              startDate: new Date(2026, 7, 10),
              endDate: new Date(2026, 7, 20),
            },
          }),
          createMockOpportunity({
            range: {
              startDate: new Date(2026, 11, 20),
              endDate: new Date(2027, 0, 5),
            },
          }),
        ],
        customHolidays: [{ id: '1', date: '2026-04-23', name: 'Άγιος Γεώργιος' }],
      })

      const url = generateShareUrl(state)

      // URL should be under 2000 characters for most browsers
      expect(url.length).toBeLessThan(2000)
    })
  })
})
