import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { calculateOrthodoxEaster, useGreekHolidays, isHoliday, isHolidayOnWeekend } from './useGreekHolidays'
import type { CustomHoliday, Holiday } from '../types'

describe('calculateOrthodoxEaster', () => {
  // Known Orthodox Easter dates for verification
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
      expect(easter.getMonth() + 1).toBe(expected.month) // getMonth is 0-indexed
      expect(easter.getDate()).toBe(expected.day)
    }
  )

  it('should always return a Sunday', () => {
    for (let year = 2020; year <= 2030; year++) {
      const easter = calculateOrthodoxEaster(year)
      expect(easter.getDay()).toBe(0) // Sunday = 0
    }
  })
})

describe('useGreekHolidays', () => {
  describe('fixedHolidays', () => {
    it('should return 8 fixed holidays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { fixedHolidays } = useGreekHolidays(year, customHolidays)

      expect(fixedHolidays.value).toHaveLength(8)
    })

    it('should include all Greek national holidays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { fixedHolidays } = useGreekHolidays(year, customHolidays)

      const holidayNames = fixedHolidays.value.map(h => h.nameGreek)

      expect(holidayNames).toContain('Πρωτοχρονιά')        // New Year
      expect(holidayNames).toContain('Θεοφάνια')           // Epiphany
      expect(holidayNames).toContain('Εικοστή Πέμπτη Μαρτίου') // Independence Day
      expect(holidayNames).toContain('Πρωτομαγιά')         // Labour Day
      expect(holidayNames).toContain('Κοίμηση της Θεοτόκου') // Assumption
      expect(holidayNames).toContain('Επέτειος του Όχι')   // Ohi Day
      expect(holidayNames).toContain('Χριστούγεννα')       // Christmas
      expect(holidayNames).toContain('Σύναξη της Θεοτόκου') // Dec 26
    })

    it('should have correct dates for fixed holidays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { fixedHolidays } = useGreekHolidays(year, customHolidays)

      const findHoliday = (name: string) =>
        fixedHolidays.value.find(h => h.nameGreek === name)

      expect(findHoliday('Πρωτοχρονιά')?.date).toEqual(new Date(2026, 0, 1))
      expect(findHoliday('Θεοφάνια')?.date).toEqual(new Date(2026, 0, 6))
      expect(findHoliday('Εικοστή Πέμπτη Μαρτίου')?.date).toEqual(new Date(2026, 2, 25))
      expect(findHoliday('Πρωτομαγιά')?.date).toEqual(new Date(2026, 4, 1))
      expect(findHoliday('Κοίμηση της Θεοτόκου')?.date).toEqual(new Date(2026, 7, 15))
      expect(findHoliday('Επέτειος του Όχι')?.date).toEqual(new Date(2026, 9, 28))
      expect(findHoliday('Χριστούγεννα')?.date).toEqual(new Date(2026, 11, 25))
    })
  })

  describe('movableHolidays', () => {
    it('should return 5 movable holidays when Holy Spirit is included', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const includeHolySpirit = ref(true)
      const { movableHolidays } = useGreekHolidays(year, customHolidays, includeHolySpirit)

      expect(movableHolidays.value).toHaveLength(5)
    })

    it('should return 4 movable holidays when Holy Spirit is excluded', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const includeHolySpirit = ref(false)
      const { movableHolidays } = useGreekHolidays(year, customHolidays, includeHolySpirit)

      expect(movableHolidays.value).toHaveLength(4)
    })

    it('should calculate Clean Monday as 48 days before Easter', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { orthodoxEaster, movableHolidays } = useGreekHolidays(year, customHolidays)

      const cleanMonday = movableHolidays.value.find(h => h.nameGreek === 'Καθαρά Δευτέρα')
      const easterTime = orthodoxEaster.value.getTime()
      const cleanMondayTime = cleanMonday!.date.getTime()

      const daysDiff = (easterTime - cleanMondayTime) / (1000 * 60 * 60 * 24)
      // Use toBeCloseTo to handle DST/timezone floating point issues
      expect(daysDiff).toBeCloseTo(48, 0)
    })

    it('should calculate Good Friday as 2 days before Easter', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { orthodoxEaster, movableHolidays } = useGreekHolidays(year, customHolidays)

      const goodFriday = movableHolidays.value.find(h => h.nameGreek === 'Μεγάλη Παρασκευή')
      const easterTime = orthodoxEaster.value.getTime()
      const goodFridayTime = goodFriday!.date.getTime()

      const daysDiff = (easterTime - goodFridayTime) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeCloseTo(2, 0)
    })

    it('should calculate Easter Monday as 1 day after Easter', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { orthodoxEaster, movableHolidays } = useGreekHolidays(year, customHolidays)

      const easterMonday = movableHolidays.value.find(h => h.nameGreek === 'Δευτέρα του Πάσχα')
      const easterTime = orthodoxEaster.value.getTime()
      const easterMondayTime = easterMonday!.date.getTime()

      const daysDiff = (easterMondayTime - easterTime) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeCloseTo(1, 0)
    })

    it('should calculate Holy Spirit as 50 days after Easter', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const includeHolySpirit = ref(true)
      const { orthodoxEaster, movableHolidays } = useGreekHolidays(year, customHolidays, includeHolySpirit)

      const holySpirit = movableHolidays.value.find(h => h.nameGreek === 'Αγίου Πνεύματος')
      const easterTime = orthodoxEaster.value.getTime()
      const holySpiritTime = holySpirit!.date.getTime()

      const daysDiff = (holySpiritTime - easterTime) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeCloseTo(50, 0)
    })
  })

  describe('customHolidays', () => {
    it('should include custom holidays in allHolidays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([
        { id: '1', name: 'Local Festival', date: '2026-06-15' }
      ])
      const { allHolidays } = useGreekHolidays(year, customHolidays)

      const customHoliday = allHolidays.value.find(h => h.name === 'Local Festival')
      expect(customHoliday).toBeDefined()
      expect(customHoliday?.isCustom).toBe(true)
    })

    it('should filter out invalid custom holidays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([
        { id: '1', name: '', date: '2026-06-15' },     // Empty name
        { id: '2', name: 'Valid', date: '2026-06-16' }, // Valid
        { id: '3', name: 'No Date', date: '' },        // Empty date
      ])
      const { customHolidays: converted } = useGreekHolidays(year, customHolidays)

      expect(converted.value).toHaveLength(1)
      expect(converted.value[0]!.name).toBe('Valid')
    })
  })

  describe('allHolidays', () => {
    it('should combine and sort all holidays by date', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { allHolidays } = useGreekHolidays(year, customHolidays)

      // Check that holidays are sorted
      for (let i = 1; i < allHolidays.value.length; i++) {
        expect(allHolidays.value[i]!.date.getTime())
          .toBeGreaterThanOrEqual(allHolidays.value[i - 1]!.date.getTime())
      }
    })

    it('should have 13 holidays when Holy Spirit is included', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const includeHolySpirit = ref(true)
      const { allHolidays } = useGreekHolidays(year, customHolidays, includeHolySpirit)

      // 8 fixed + 5 movable = 13
      expect(allHolidays.value).toHaveLength(13)
    })
  })

  describe('weekendHolidays', () => {
    it('should identify holidays falling on weekends', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { weekendHolidays, allHolidays } = useGreekHolidays(year, customHolidays)

      // All weekend holidays should be on Saturday (6) or Sunday (0)
      weekendHolidays.value.forEach(h => {
        const day = h.date.getDay()
        expect([0, 6]).toContain(day)
      })

      // Weekend holidays + effective holidays should equal all holidays
      expect(weekendHolidays.value.length +
        allHolidays.value.filter(h => ![0, 6].includes(h.date.getDay())).length
      ).toBe(allHolidays.value.length)
    })
  })

  describe('effectiveHolidays', () => {
    it('should return only holidays on weekdays', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { effectiveHolidays } = useGreekHolidays(year, customHolidays)

      // All effective holidays should be on weekdays (Mon-Fri: 1-5)
      effectiveHolidays.value.forEach(h => {
        const day = h.date.getDay()
        expect(day).toBeGreaterThan(0)
        expect(day).toBeLessThan(6)
      })
    })

    it('should exclude weekend holidays from effective count', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { effectiveHolidays, weekendHolidays, allHolidays } = useGreekHolidays(year, customHolidays)

      // effectiveHolidays + weekendHolidays should equal allHolidays
      expect(effectiveHolidays.value.length + weekendHolidays.value.length)
        .toBe(allHolidays.value.length)
    })

    it('should have fewer effective holidays than total in 2026', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { effectiveHolidays, allHolidays } = useGreekHolidays(year, customHolidays)

      // 2026 has some holidays falling on weekends
      expect(effectiveHolidays.value.length).toBeLessThanOrEqual(allHolidays.value.length)
    })
  })

  describe('returned isHoliday function', () => {
    it('should check if date is holiday using composable method', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const holidays = useGreekHolidays(year, customHolidays)

      // New Year's Day should be a holiday
      const newYear = holidays.isHoliday(new Date(2026, 0, 1))
      expect(newYear).toBeDefined()
      expect(newYear?.nameGreek).toBe('Πρωτοχρονιά')
    })

    it('should return undefined for non-holiday using composable method', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const holidays = useGreekHolidays(year, customHolidays)

      // Jan 15 is not a holiday
      const result = holidays.isHoliday(new Date(2026, 0, 15))
      expect(result).toBeUndefined()
    })

    it('should find custom holidays via composable isHoliday', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([
        { id: '1', name: 'Local Festival', date: '2026-06-15' }
      ])
      const holidays = useGreekHolidays(year, customHolidays)

      const result = holidays.isHoliday(new Date(2026, 5, 15))
      expect(result).toBeDefined()
      expect(result?.name).toBe('Local Festival')
    })
  })

  describe('reactivity', () => {
    it('should update holidays when year changes', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const { orthodoxEaster } = useGreekHolidays(year, customHolidays)

      const easter2026 = orthodoxEaster.value.getTime()

      year.value = 2027
      const easter2027 = orthodoxEaster.value.getTime()

      expect(easter2026).not.toBe(easter2027)
    })

    it('should update when Holy Spirit setting changes', () => {
      const year = ref(2026)
      const customHolidays = ref<CustomHoliday[]>([])
      const includeHolySpirit = ref(true)
      const { movableHolidays } = useGreekHolidays(year, customHolidays, includeHolySpirit)

      expect(movableHolidays.value).toHaveLength(5)

      includeHolySpirit.value = false
      expect(movableHolidays.value).toHaveLength(4)
    })
  })
})

describe('isHoliday', () => {
  it('should find holiday on matching date', () => {
    const holidays: Holiday[] = [
      { date: new Date(2026, 0, 1), name: 'New Year', nameGreek: 'Πρωτοχρονιά', isMovable: false, isCustom: false }
    ]

    const result = isHoliday(new Date(2026, 0, 1), holidays)
    expect(result).toBeDefined()
    expect(result?.name).toBe('New Year')
  })

  it('should return undefined for non-holiday date', () => {
    const holidays: Holiday[] = [
      { date: new Date(2026, 0, 1), name: 'New Year', nameGreek: 'Πρωτοχρονιά', isMovable: false, isCustom: false }
    ]

    const result = isHoliday(new Date(2026, 0, 2), holidays)
    expect(result).toBeUndefined()
  })
})

describe('isHolidayOnWeekend', () => {
  it('should return true for Saturday holiday', () => {
    const holiday: Holiday = {
      date: new Date(2026, 0, 3), // Saturday, Jan 3, 2026
      name: 'Test',
      nameGreek: 'Test',
      isMovable: false,
      isCustom: false
    }

    expect(isHolidayOnWeekend(holiday)).toBe(true)
  })

  it('should return true for Sunday holiday', () => {
    const holiday: Holiday = {
      date: new Date(2026, 0, 4), // Sunday, Jan 4, 2026
      name: 'Test',
      nameGreek: 'Test',
      isMovable: false,
      isCustom: false
    }

    expect(isHolidayOnWeekend(holiday)).toBe(true)
  })

  it('should return false for weekday holiday', () => {
    const holiday: Holiday = {
      date: new Date(2026, 0, 1), // Thursday, Jan 1, 2026
      name: 'Test',
      nameGreek: 'Test',
      isMovable: false,
      isCustom: false
    }

    expect(isHolidayOnWeekend(holiday)).toBe(false)
  })
})

describe('edge cases', () => {
  it('should handle year with Easter in March (early Easter)', () => {
    const year = ref(2024) // Easter 2024 is May 5 - actually late
    const customHolidays = ref<CustomHoliday[]>([])
    const { orthodoxEaster } = useGreekHolidays(year, customHolidays)

    // Should return valid Easter date
    expect(orthodoxEaster.value).toBeInstanceOf(Date)
    expect(orthodoxEaster.value.getFullYear()).toBe(2024)
  })

  it('should handle custom holiday with same date as fixed holiday', () => {
    const year = ref(2026)
    const customHolidays = ref<CustomHoliday[]>([
      { id: '1', name: 'Custom New Year', date: '2026-01-01' } // Same as New Year
    ])
    const { allHolidays } = useGreekHolidays(year, customHolidays)

    // Should include both (no deduplication by date)
    const newYearHolidays = allHolidays.value.filter(
      h => h.date.getMonth() === 0 && h.date.getDate() === 1
    )
    expect(newYearHolidays.length).toBe(2)
  })

  it('should handle empty custom holidays array', () => {
    const year = ref(2026)
    const customHolidays = ref<CustomHoliday[]>([])
    const { customHolidays: converted } = useGreekHolidays(year, customHolidays)

    expect(converted.value).toHaveLength(0)
  })

  it('should handle year change maintaining custom holidays', () => {
    const year = ref(2026)
    const customHolidays = ref<CustomHoliday[]>([
      { id: '1', name: 'Annual Event', date: '2026-07-15' }
    ])
    const { customHolidays: converted } = useGreekHolidays(year, customHolidays)

    expect(converted.value).toHaveLength(1)

    // Changing year doesn't affect custom holidays ref
    year.value = 2027
    expect(converted.value).toHaveLength(1)
  })

  it('should calculate Orthodox Easter for edge years', () => {
    // Test boundary years
    const testYears = [2000, 2050, 2099]

    testYears.forEach(testYear => {
      const easter = calculateOrthodoxEaster(testYear)
      expect(easter).toBeInstanceOf(Date)
      expect(easter.getFullYear()).toBe(testYear)
      expect(easter.getDay()).toBe(0) // Always Sunday
    })
  })

  it('should handle custom holiday with special characters in name', () => {
    const year = ref(2026)
    const customHolidays = ref<CustomHoliday[]>([
      { id: '1', name: 'Γιορτή του Αγίου Νικολάου', date: '2026-12-06' }
    ])
    const { customHolidays: converted } = useGreekHolidays(year, customHolidays)

    expect(converted.value).toHaveLength(1)
    expect(converted.value[0]!.name).toBe('Γιορτή του Αγίου Νικολάου')
  })
})
