import { describe, it, expect } from 'vitest'
import { calculateOrthodoxEaster, getJulianGregorianOffset } from './easterCalculation'

describe('getJulianGregorianOffset', () => {
  it('should return 13 for years 1900-2099', () => {
    expect(getJulianGregorianOffset(1900)).toBe(13)
    expect(getJulianGregorianOffset(2000)).toBe(13)
    expect(getJulianGregorianOffset(2024)).toBe(13)
    expect(getJulianGregorianOffset(2026)).toBe(13)
    expect(getJulianGregorianOffset(2099)).toBe(13)
  })

  it('should return 14 for years 2100-2199', () => {
    expect(getJulianGregorianOffset(2100)).toBe(14)
    expect(getJulianGregorianOffset(2150)).toBe(14)
    expect(getJulianGregorianOffset(2199)).toBe(14)
  })

  it('should return 12 for years 1800-1899', () => {
    expect(getJulianGregorianOffset(1800)).toBe(12)
    expect(getJulianGregorianOffset(1850)).toBe(12)
    expect(getJulianGregorianOffset(1899)).toBe(12)
  })

  it('should handle century boundaries correctly', () => {
    // Year 400 is divisible by 400, so it's a leap century
    // Year 2000 is divisible by 400, so it's a leap century
    // Year 1900 is NOT divisible by 400
    expect(getJulianGregorianOffset(2000)).toBe(13)
    expect(getJulianGregorianOffset(2100)).toBe(14) // Not divisible by 400
  })
})

describe('calculateOrthodoxEaster', () => {
  // Known Orthodox Easter dates (verified against official sources)
  const knownEasterDates: [number, { month: number; day: number }][] = [
    [2020, { month: 4, day: 19 }],  // April 19, 2020
    [2021, { month: 5, day: 2 }],   // May 2, 2021
    [2022, { month: 4, day: 24 }],  // April 24, 2022
    [2023, { month: 4, day: 16 }],  // April 16, 2023
    [2024, { month: 5, day: 5 }],   // May 5, 2024
    [2025, { month: 4, day: 20 }],  // April 20, 2025
    [2026, { month: 4, day: 12 }],  // April 12, 2026
    [2027, { month: 5, day: 2 }],   // May 2, 2027
    [2028, { month: 4, day: 16 }],  // April 16, 2028
    [2029, { month: 4, day: 8 }],   // April 8, 2029
    [2030, { month: 4, day: 28 }],  // April 28, 2030
  ]

  it.each(knownEasterDates)(
    'should calculate correct Easter date for year %i',
    (year, expected) => {
      const easter = calculateOrthodoxEaster(year)
      expect(easter.getFullYear()).toBe(year)
      expect(easter.getMonth() + 1).toBe(expected.month)
      expect(easter.getDate()).toBe(expected.day)
    }
  )

  it('should always return a Sunday', () => {
    for (let year = 2020; year <= 2030; year++) {
      const easter = calculateOrthodoxEaster(year)
      expect(easter.getDay()).toBe(0) // 0 = Sunday
    }
  })

  it('should return dates in April or May', () => {
    for (let year = 2020; year <= 2050; year++) {
      const easter = calculateOrthodoxEaster(year)
      const month = easter.getMonth()
      expect(month).toBeGreaterThanOrEqual(3) // April (0-indexed)
      expect(month).toBeLessThanOrEqual(4) // May (0-indexed)
    }
  })

  it('should return a valid Date object', () => {
    const easter = calculateOrthodoxEaster(2026)
    expect(easter).toBeInstanceOf(Date)
    expect(isNaN(easter.getTime())).toBe(false)
  })

  it('should handle edge years correctly', () => {
    // Early year
    const early = calculateOrthodoxEaster(1950)
    expect(early.getFullYear()).toBe(1950)
    expect(early).toBeInstanceOf(Date)

    // Far future year
    const future = calculateOrthodoxEaster(2099)
    expect(future.getFullYear()).toBe(2099)
    expect(future).toBeInstanceOf(Date)
  })
})
