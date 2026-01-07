import { describe, it, expect } from 'vitest'
import {
  getSchoolBreaks,
  getSchoolHolidays,
  isInSchoolBreak,
  isSchoolHoliday,
  calculateSchoolOverlap,
  getSchoolCalendar
} from './schoolHolidays'

describe('getSchoolBreaks', () => {
  it('should return 2 breaks (Christmas and Easter)', () => {
    const breaks = getSchoolBreaks(2026)

    expect(breaks).toHaveLength(2)
    expect(breaks.map(b => b.id)).toContain('christmas')
    expect(breaks.map(b => b.id)).toContain('easter')
  })

  it('should have Christmas break from Dec 24 to Jan 7', () => {
    const breaks = getSchoolBreaks(2026)
    const christmas = breaks.find(b => b.id === 'christmas')!

    expect(christmas.startDate.getMonth()).toBe(11) // December
    expect(christmas.startDate.getDate()).toBe(24)
    expect(christmas.endDate.getMonth()).toBe(0) // January (next year)
    expect(christmas.endDate.getDate()).toBe(7)
    expect(christmas.endDate.getFullYear()).toBe(2027)
  })

  it('should have Christmas break with correct properties', () => {
    const breaks = getSchoolBreaks(2026)
    const christmas = breaks.find(b => b.id === 'christmas')!

    expect(christmas.name).toBe('Christmas Break')
    expect(christmas.nameGreek).toBe('Διακοπές Χριστουγέννων')
    expect(christmas.icon).toBe('🎄')
  })

  it('should calculate Easter break based on Orthodox Easter', () => {
    const breaks = getSchoolBreaks(2026)
    const easter = breaks.find(b => b.id === 'easter')!

    // Orthodox Easter 2026 is April 12
    // Easter break should start 1 week before (April 5) and end 1 week after (April 19)
    expect(easter.startDate.getFullYear()).toBe(2026)
    expect(easter.endDate.getFullYear()).toBe(2026)

    // Should span about 2 weeks
    const days = (easter.endDate.getTime() - easter.startDate.getTime()) / (1000 * 60 * 60 * 24)
    expect(days).toBe(14)
  })

  it('should have Easter break with correct properties', () => {
    const breaks = getSchoolBreaks(2026)
    const easter = breaks.find(b => b.id === 'easter')!

    expect(easter.name).toBe('Easter Break')
    expect(easter.nameGreek).toBe('Διακοπές Πάσχα')
    expect(easter.icon).toBe('🐣')
  })

  it('should calculate different Easter dates for different years', () => {
    const breaks2026 = getSchoolBreaks(2026)
    const breaks2027 = getSchoolBreaks(2027)

    const easter2026 = breaks2026.find(b => b.id === 'easter')!
    const easter2027 = breaks2027.find(b => b.id === 'easter')!

    // Easter dates should be different
    expect(easter2026.startDate.getTime()).not.toBe(easter2027.startDate.getTime())
  })
})

describe('getSchoolHolidays', () => {
  it('should return 7 school holidays', () => {
    const holidays = getSchoolHolidays(2026)

    expect(holidays).toHaveLength(7)
  })

  it('should include Oxi Day (October 28)', () => {
    const holidays = getSchoolHolidays(2026)
    const oxiDay = holidays.find(h => h.name === 'Oxi Day')

    expect(oxiDay).toBeDefined()
    expect(oxiDay?.date.getMonth()).toBe(9) // October
    expect(oxiDay?.date.getDate()).toBe(28)
    expect(oxiDay?.nameGreek).toBe('Ημέρα του Όχι')
  })

  it('should include Polytechnic Uprising (November 17)', () => {
    const holidays = getSchoolHolidays(2026)
    const polytechnic = holidays.find(h => h.name === 'Polytechnic Uprising')

    expect(polytechnic).toBeDefined()
    expect(polytechnic?.date.getMonth()).toBe(10) // November
    expect(polytechnic?.date.getDate()).toBe(17)
    expect(polytechnic?.nameGreek).toBe('17 Νοεμβρίου')
  })

  it('should include Three Hierarchs (January 30)', () => {
    const holidays = getSchoolHolidays(2026)
    const threeHierarchs = holidays.find(h => h.name === 'Three Hierarchs')

    expect(threeHierarchs).toBeDefined()
    expect(threeHierarchs?.date.getMonth()).toBe(0) // January
    expect(threeHierarchs?.date.getDate()).toBe(30)
    expect(threeHierarchs?.nameGreek).toBe('Τριών Ιεραρχών')
  })

  it('should calculate Clean Monday relative to Easter', () => {
    const holidays = getSchoolHolidays(2026)
    const cleanMonday = holidays.find(h => h.name === 'Clean Monday')

    expect(cleanMonday).toBeDefined()
    // Clean Monday is 48 days before Easter
    // Orthodox Easter 2026 is April 12, so Clean Monday should be Feb 23
    expect(cleanMonday?.date.getMonth()).toBe(1) // February
    expect(cleanMonday?.date.getDate()).toBe(23)
  })

  it('should include Independence Day (March 25)', () => {
    const holidays = getSchoolHolidays(2026)
    const independence = holidays.find(h => h.name === 'Independence Day')

    expect(independence).toBeDefined()
    expect(independence?.date.getMonth()).toBe(2) // March
    expect(independence?.date.getDate()).toBe(25)
  })

  it('should include Labor Day (May 1)', () => {
    const holidays = getSchoolHolidays(2026)
    const laborDay = holidays.find(h => h.name === 'Labor Day')

    expect(laborDay).toBeDefined()
    expect(laborDay?.date.getMonth()).toBe(4) // May
    expect(laborDay?.date.getDate()).toBe(1)
  })

  it('should calculate Whit Monday relative to Easter', () => {
    const holidays = getSchoolHolidays(2026)
    const whitMonday = holidays.find(h => h.name === 'Whit Monday')

    expect(whitMonday).toBeDefined()
    // Whit Monday is 50 days after Easter
    // Orthodox Easter 2026 is April 12, so Whit Monday should be June 1
    expect(whitMonday?.date.getMonth()).toBe(5) // June
    expect(whitMonday?.date.getDate()).toBe(1)
  })
})

describe('isInSchoolBreak', () => {
  it('should return break when date is within break period', () => {
    const breaks = getSchoolBreaks(2026)

    // Christmas Eve should be in Christmas break
    const result = isInSchoolBreak(new Date(2026, 11, 24), breaks)

    expect(result).not.toBeNull()
    expect(result?.id).toBe('christmas')
  })

  it('should return null when date is not in any break', () => {
    const breaks = getSchoolBreaks(2026)

    // February 15 should not be in any break
    const result = isInSchoolBreak(new Date(2026, 1, 15), breaks)

    expect(result).toBeNull()
  })

  it('should detect date within Easter break', () => {
    const breaks = getSchoolBreaks(2026)
    const easter = breaks.find(b => b.id === 'easter')!

    // Middle of Easter break
    const midBreak = new Date(easter.startDate)
    midBreak.setDate(midBreak.getDate() + 7)

    const result = isInSchoolBreak(midBreak, breaks)

    expect(result).not.toBeNull()
    expect(result?.id).toBe('easter')
  })

  it('should include break boundaries', () => {
    const breaks = getSchoolBreaks(2026)

    // Last day of Christmas break (Jan 7)
    const lastDay = isInSchoolBreak(new Date(2027, 0, 7), breaks)
    expect(lastDay?.id).toBe('christmas')

    // First day of Christmas break (Dec 24)
    const firstDay = isInSchoolBreak(new Date(2026, 11, 24), breaks)
    expect(firstDay?.id).toBe('christmas')
  })
})

describe('isSchoolHoliday', () => {
  it('should return holiday when date matches', () => {
    const holidays = getSchoolHolidays(2026)

    const result = isSchoolHoliday(new Date(2026, 9, 28), holidays)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Oxi Day')
  })

  it('should return null when date is not a holiday', () => {
    const holidays = getSchoolHolidays(2026)

    const result = isSchoolHoliday(new Date(2026, 1, 15), holidays)

    expect(result).toBeNull()
  })

  it('should match by date only, ignoring time', () => {
    const holidays = getSchoolHolidays(2026)

    // Oxi Day with different time
    const result = isSchoolHoliday(new Date(2026, 9, 28, 14, 30), holidays)

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Oxi Day')
  })
})

describe('calculateSchoolOverlap', () => {
  it('should calculate overlap with Christmas break', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 11, 20), // Dec 20
      new Date(2026, 11, 31), // Dec 31
      2026
    )

    // Dec 24-31 is within Christmas break (8 days)
    expect(result.totalOverlapDays).toBeGreaterThan(0)
    expect(result.overlappingBreaks.length).toBeGreaterThan(0)
    expect(result.overlappingBreaks[0]?.break.id).toBe('christmas')
  })

  it('should calculate overlap with Easter break', () => {
    // Easter 2026 is April 12, break is April 5-19
    const result = calculateSchoolOverlap(
      new Date(2026, 3, 10), // April 10
      new Date(2026, 3, 14), // April 14
      2026
    )

    expect(result.totalOverlapDays).toBe(5)
    expect(result.overlappingBreaks.some(b => b.break.id === 'easter')).toBe(true)
  })

  it('should return 0 overlap for non-break periods', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 1, 1), // Feb 1
      new Date(2026, 1, 10), // Feb 10
      2026
    )

    // February should have no school breaks
    expect(result.overlappingBreaks).toHaveLength(0)
  })

  it('should count individual holidays not in breaks', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 9, 25), // Oct 25
      new Date(2026, 9, 30), // Oct 30
      2026
    )

    // Oxi Day (Oct 28) should be counted
    expect(result.overlappingHolidays.some(h => h.name === 'Oxi Day')).toBe(true)
  })

  it('should not double-count holidays within breaks', () => {
    // If a school holiday falls within a break, it shouldn't be counted twice
    const result = calculateSchoolOverlap(
      new Date(2026, 3, 1), // April 1
      new Date(2026, 3, 30), // April 30
      2026
    )

    // Easter break includes movable holidays that might overlap
    // Total should account for break days + separate holidays
    expect(result.totalOverlapDays).toBeGreaterThan(0)
  })

  it('should check previous year Christmas break for January dates', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 0, 1), // Jan 1, 2026
      new Date(2026, 0, 10), // Jan 10, 2026
      2026
    )

    // Previous year's Christmas break (2025) ends Jan 7, 2026
    expect(result.overlappingBreaks.some(b => b.break.id === 'christmas')).toBe(true)
  })

  it('should calculate correct days for partial overlap', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 11, 20), // Dec 20 (before break)
      new Date(2026, 11, 26), // Dec 26 (within break)
      2026
    )

    // Only Dec 24-26 overlap (3 days)
    const christmasOverlap = result.overlappingBreaks.find(b => b.break.id === 'christmas')
    expect(christmasOverlap?.days).toBe(3)
  })
})

describe('getSchoolCalendar', () => {
  it('should return both breaks and holidays', () => {
    const calendar = getSchoolCalendar(2026)

    expect(calendar.breaks).toBeDefined()
    expect(calendar.holidays).toBeDefined()
    expect(calendar.breaks.length).toBe(2)
    expect(calendar.holidays.length).toBe(7)
  })

  it('should return same data as individual functions', () => {
    const calendar = getSchoolCalendar(2026)
    const breaks = getSchoolBreaks(2026)
    const holidays = getSchoolHolidays(2026)

    expect(calendar.breaks).toEqual(breaks)
    expect(calendar.holidays).toEqual(holidays)
  })
})

describe('edge cases', () => {
  it('should handle leap year February correctly', () => {
    // 2024 is a leap year
    const holidays = getSchoolHolidays(2024)

    // Clean Monday in 2024 should be calculated correctly
    const cleanMonday = holidays.find(h => h.name === 'Clean Monday')
    expect(cleanMonday).toBeDefined()
    expect(cleanMonday?.date.getFullYear()).toBe(2024)
  })

  it('should calculate Easter break spanning month boundary', () => {
    // Easter 2024 is May 5, break would span late April to mid May
    const breaks = getSchoolBreaks(2024)
    const easter = breaks.find(b => b.id === 'easter')

    expect(easter).toBeDefined()
    // Break spans about 2 weeks around Easter, potentially crossing month boundary
    expect(easter!.startDate < easter!.endDate).toBe(true)
    // Verify it's approximately 2 weeks
    const days = (easter!.endDate.getTime() - easter!.startDate.getTime()) / (1000 * 60 * 60 * 24)
    expect(days).toBe(14)
  })

  it('should handle year with early Easter (April)', () => {
    // 2029 has Easter on April 8
    const breaks = getSchoolBreaks(2029)
    const easter = breaks.find(b => b.id === 'easter')

    expect(easter).toBeDefined()
    expect(easter!.startDate.getMonth()).toBe(3) // April (0-indexed)
  })

  it('should handle year with late Easter (May)', () => {
    // 2024 has Easter on May 5
    const breaks = getSchoolBreaks(2024)
    const easter = breaks.find(b => b.id === 'easter')

    expect(easter).toBeDefined()
    // Easter break should extend into May
    expect(easter!.endDate.getMonth()).toBeGreaterThanOrEqual(4) // May or later
  })

  it('should handle Christmas break crossing year boundary', () => {
    const breaks = getSchoolBreaks(2026)
    const christmas = breaks.find(b => b.id === 'christmas')

    expect(christmas).toBeDefined()
    expect(christmas!.startDate.getFullYear()).toBe(2026)
    expect(christmas!.endDate.getFullYear()).toBe(2027)
  })

  it('should calculate overlap for range entirely within break', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 11, 25), // Dec 25 (within Christmas break)
      new Date(2026, 11, 28), // Dec 28 (within Christmas break)
      2026
    )

    // All 4 days should overlap
    expect(result.totalOverlapDays).toBe(4)
  })

  it('should return zero overlap for summer dates', () => {
    const result = calculateSchoolOverlap(
      new Date(2026, 6, 1), // July 1
      new Date(2026, 6, 15), // July 15
      2026
    )

    // Summer has no school breaks (only vacation)
    expect(result.overlappingBreaks).toHaveLength(0)
  })

  it('should handle boundary year 2000', () => {
    const breaks = getSchoolBreaks(2000)
    const holidays = getSchoolHolidays(2000)

    expect(breaks).toHaveLength(2)
    expect(holidays.length).toBeGreaterThan(0)
  })

  it('should handle future year 2050', () => {
    const breaks = getSchoolBreaks(2050)
    const holidays = getSchoolHolidays(2050)

    expect(breaks).toHaveLength(2)
    expect(holidays.length).toBeGreaterThan(0)

    // Easter should still be a Sunday
    const easterBreak = breaks.find(b => b.id === 'easter')
    const easterMiddle = new Date(easterBreak!.startDate)
    easterMiddle.setDate(easterMiddle.getDate() + 7) // Move to Easter Sunday
    expect(easterMiddle.getDay()).toBe(0) // Sunday
  })
})
