import { describe, it, expect } from 'vitest'
import {
  useYearComparison,
  getEasterForYear,
  getCleanMondayForYear,
  getGoodFridayForYear,
  getEasterMondayForYear,
  getHolySpiritForYear,
  getFixedHolidayDay,
  FIXED_HOLIDAYS
} from './useYearComparison'

describe('useYearComparison', () => {
  describe('getEasterForYear', () => {
    it('should return correct Easter date for 2024', () => {
      const result = getEasterForYear(2024)
      expect(result).toBe('5 Μαΐ')
    })

    it('should return correct Easter date for 2025', () => {
      const result = getEasterForYear(2025)
      expect(result).toBe('20 Απρ')
    })

    it('should return correct Easter date for 2026', () => {
      const result = getEasterForYear(2026)
      expect(result).toBe('12 Απρ')
    })

    it('should return correct Easter date for 2027', () => {
      const result = getEasterForYear(2027)
      expect(result).toBe('2 Μαΐ')
    })
  })

  describe('getCleanMondayForYear', () => {
    it('should return date 48 days before Easter', () => {
      const result = getCleanMondayForYear(2026)
      // Easter 2026 is April 12, Clean Monday is Feb 23
      expect(result.label).toBe('23 Φεβ')
      expect(result.isWeekend).toBe(false) // Monday
    })

    it('should correctly identify weekend status', () => {
      // Clean Monday is always a Monday, so never weekend
      const result = getCleanMondayForYear(2025)
      expect(result.isWeekend).toBe(false)
    })
  })

  describe('getGoodFridayForYear', () => {
    it('should return date 2 days before Easter', () => {
      const result = getGoodFridayForYear(2026)
      // Easter 2026 is April 12, Good Friday is April 10
      expect(result.label).toBe('10 Απρ')
      expect(result.isWeekend).toBe(false) // Friday
    })

    it('should never be weekend (always Friday)', () => {
      const years = [2024, 2025, 2026, 2027, 2028]
      years.forEach(year => {
        const result = getGoodFridayForYear(year)
        expect(result.isWeekend).toBe(false)
      })
    })
  })

  describe('getEasterMondayForYear', () => {
    it('should return date 1 day after Easter', () => {
      const result = getEasterMondayForYear(2026)
      // Easter 2026 is April 12, Easter Monday is April 13
      expect(result.label).toBe('13 Απρ')
      expect(result.isWeekend).toBe(false) // Monday
    })

    it('should never be weekend (always Monday)', () => {
      const years = [2024, 2025, 2026, 2027, 2028]
      years.forEach(year => {
        const result = getEasterMondayForYear(year)
        expect(result.isWeekend).toBe(false)
      })
    })
  })

  describe('getHolySpiritForYear', () => {
    it('should return date 50 days after Easter', () => {
      const result = getHolySpiritForYear(2026)
      // Easter 2026 is April 12, Holy Spirit is June 1
      expect(result.label).toBe('1 Ιουν')
      expect(result.isWeekend).toBe(false) // Monday
    })

    it('should never be weekend (always Monday)', () => {
      const years = [2024, 2025, 2026, 2027, 2028]
      years.forEach(year => {
        const result = getHolySpiritForYear(year)
        expect(result.isWeekend).toBe(false)
      })
    })
  })

  describe('getFixedHolidayDay', () => {
    it('should return correct info for New Year', () => {
      const result = getFixedHolidayDay('Πρωτοχρονιά', 2026)
      // Jan 1, 2026 is Thursday
      expect(result.label).toBe('Πέμ 1/1')
      expect(result.isWeekend).toBe(false)
    })

    it('should return correct info for Christmas', () => {
      const result = getFixedHolidayDay('Χριστούγεννα', 2026)
      // Dec 25, 2026 is Friday
      expect(result.label).toBe('Παρ 25/12')
      expect(result.isWeekend).toBe(false)
    })

    it('should identify weekend holidays', () => {
      // Find a year where Jan 1 is Saturday or Sunday
      const result2028 = getFixedHolidayDay('Πρωτοχρονιά', 2028)
      // Jan 1, 2028 is Saturday
      expect(result2028.isWeekend).toBe(true)
    })

    it('should return default for unknown holiday', () => {
      const result = getFixedHolidayDay('Unknown Holiday', 2026)
      expect(result.label).toBe('-')
      expect(result.isWeekend).toBe(false)
    })

    it('should handle all fixed holidays', () => {
      FIXED_HOLIDAYS.forEach(holiday => {
        const result = getFixedHolidayDay(holiday, 2026)
        expect(result.label).not.toBe('-')
        expect(typeof result.isWeekend).toBe('boolean')
      })
    })
  })

  describe('FIXED_HOLIDAYS constant', () => {
    it('should contain all 8 Greek fixed holidays', () => {
      expect(FIXED_HOLIDAYS).toHaveLength(8)
      expect(FIXED_HOLIDAYS).toContain('Πρωτοχρονιά')
      expect(FIXED_HOLIDAYS).toContain('Θεοφάνεια')
      expect(FIXED_HOLIDAYS).toContain('Ευαγγελισμός')
      expect(FIXED_HOLIDAYS).toContain('Πρωτομαγιά')
      expect(FIXED_HOLIDAYS).toContain('Δεκαπενταύγουστος')
      expect(FIXED_HOLIDAYS).toContain('Ημέρα του Όχι')
      expect(FIXED_HOLIDAYS).toContain('Χριστούγεννα')
      expect(FIXED_HOLIDAYS).toContain('2η Χριστουγέννων')
    })
  })

  describe('useYearComparison composable', () => {
    it('should return all expected functions', () => {
      const result = useYearComparison()

      expect(result.fixedHolidays).toBeDefined()
      expect(result.getEasterForYear).toBeDefined()
      expect(result.getCleanMondayForYear).toBeDefined()
      expect(result.getGoodFridayForYear).toBeDefined()
      expect(result.getEasterMondayForYear).toBeDefined()
      expect(result.getHolySpiritForYear).toBeDefined()
      expect(result.getFixedHolidayDay).toBeDefined()
    })

    it('should return same results as standalone functions', () => {
      const composable = useYearComparison()

      expect(composable.getEasterForYear(2026)).toBe(getEasterForYear(2026))
      expect(composable.getCleanMondayForYear(2026)).toEqual(getCleanMondayForYear(2026))
      expect(composable.getGoodFridayForYear(2026)).toEqual(getGoodFridayForYear(2026))
    })
  })

  describe('edge cases', () => {
    it('should handle early Easter years', () => {
      // 2024 has relatively late Easter (May 5)
      const result = getEasterForYear(2024)
      expect(result).toBeTruthy()
    })

    it('should handle late Easter years', () => {
      // Easter can be as late as May 8
      const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
      years.forEach(year => {
        const result = getEasterForYear(year)
        expect(result).toBeTruthy()
        // Should contain month abbreviation
        expect(result).toMatch(/\d+\s+(Απρ|Μαΐ)/)
      })
    })
  })
})
