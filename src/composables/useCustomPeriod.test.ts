import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import {
  generateCustomCalendar,
  getEfficiencyLabel,
  createCustomPeriod,
  validateDateRange,
  useCustomPeriod,
} from './useCustomPeriod'
import type { Holiday } from '../types'

// Mock holidays for testing
const mockHolidays: Holiday[] = [
  {
    date: new Date(2026, 0, 1), // Jan 1, 2026 (Thursday)
    name: "New Year's Day",
    nameGreek: 'Πρωτοχρονιά',
    isMovable: false,
    isCustom: false,
  },
  {
    date: new Date(2026, 0, 6), // Jan 6, 2026 (Tuesday)
    name: 'Epiphany',
    nameGreek: 'Θεοφάνια',
    isMovable: false,
    isCustom: false,
  },
  {
    date: new Date(2026, 4, 1), // May 1, 2026 (Friday)
    name: 'Labour Day',
    nameGreek: 'Πρωτομαγιά',
    isMovable: false,
    isCustom: false,
  },
]

describe('generateCustomCalendar', () => {
  it('should generate correct DayInfo for a simple range', () => {
    // Monday Jan 5 to Wednesday Jan 7, 2026
    const start = new Date(2026, 0, 5)
    const end = new Date(2026, 0, 7)

    const calendar = generateCustomCalendar(start, end, mockHolidays)

    expect(calendar).toHaveLength(3)

    // Jan 5 - Monday, workday
    expect(calendar[0]!.date).toEqual(new Date(2026, 0, 5))
    expect(calendar[0]!.cost).toBe(1)
    expect(calendar[0]!.isWeekend).toBe(false)
    expect(calendar[0]!.isHoliday).toBe(false)

    // Jan 6 - Tuesday, Epiphany holiday
    expect(calendar[1]!.date).toEqual(new Date(2026, 0, 6))
    expect(calendar[1]!.cost).toBe(0)
    expect(calendar[1]!.isWeekend).toBe(false)
    expect(calendar[1]!.isHoliday).toBe(true)
    expect(calendar[1]!.holidayName).toBe('Θεοφάνια')

    // Jan 7 - Wednesday, workday
    expect(calendar[2]!.date).toEqual(new Date(2026, 0, 7))
    expect(calendar[2]!.cost).toBe(1)
    expect(calendar[2]!.isWeekend).toBe(false)
    expect(calendar[2]!.isHoliday).toBe(false)
  })

  it('should mark weekends correctly', () => {
    // Saturday Jan 3 to Sunday Jan 4, 2026
    const start = new Date(2026, 0, 3)
    const end = new Date(2026, 0, 4)

    const calendar = generateCustomCalendar(start, end, mockHolidays)

    expect(calendar).toHaveLength(2)

    // Saturday
    expect(calendar[0]!.isWeekend).toBe(true)
    expect(calendar[0]!.cost).toBe(0)

    // Sunday
    expect(calendar[1]!.isWeekend).toBe(true)
    expect(calendar[1]!.cost).toBe(0)
  })

  it('should handle single day range', () => {
    const singleDay = new Date(2026, 0, 5) // Monday

    const calendar = generateCustomCalendar(singleDay, singleDay, mockHolidays)

    expect(calendar).toHaveLength(1)
    expect(calendar[0]!.cost).toBe(1)
  })

  it('should handle holiday on weekend', () => {
    // Create a holiday on a Saturday
    const holidaysWithWeekend: Holiday[] = [
      {
        date: new Date(2026, 0, 3), // Saturday Jan 3
        name: 'Test Holiday',
        nameGreek: 'Δοκιμαστική Αργία',
        isMovable: false,
        isCustom: false,
      },
    ]

    const calendar = generateCustomCalendar(
      new Date(2026, 0, 3),
      new Date(2026, 0, 3),
      holidaysWithWeekend
    )

    expect(calendar[0]!.isWeekend).toBe(true)
    expect(calendar[0]!.isHoliday).toBe(true)
    expect(calendar[0]!.cost).toBe(0)
  })

  it('should handle long date ranges spanning multiple months', () => {
    // Jan 5 to Feb 5, 2026 - 32 days
    const start = new Date(2026, 0, 5)
    const end = new Date(2026, 1, 5)

    const calendar = generateCustomCalendar(start, end, mockHolidays)

    expect(calendar).toHaveLength(32)
    // First day is Monday Jan 5
    expect(calendar[0]!.date).toEqual(new Date(2026, 0, 5))
    // Last day is Thursday Feb 5
    expect(calendar[31]!.date).toEqual(new Date(2026, 1, 5))
  })

  it('should handle empty holidays array', () => {
    const start = new Date(2026, 0, 5)
    const end = new Date(2026, 0, 7)

    const calendar = generateCustomCalendar(start, end, [])

    expect(calendar).toHaveLength(3)
    // All weekdays should have cost 1
    expect(calendar[0]!.cost).toBe(1)
    expect(calendar[1]!.cost).toBe(1)
    expect(calendar[2]!.cost).toBe(1)
    expect(calendar.every((d) => !d.isHoliday)).toBe(true)
  })
})

describe('getEfficiencyLabel', () => {
  it('should return free days label when leaveDays is 0', () => {
    expect(getEfficiencyLabel(0, 2)).toBe('2 δωρεάν ημέρες')
    expect(getEfficiencyLabel(0, 5)).toBe('5 δωρεάν ημέρες')
  })

  it('should return singular form for 1 leave day', () => {
    expect(getEfficiencyLabel(1, 5)).toBe('Κάντε 1 ημέρα 5')
  })

  it('should return plural form for multiple leave days', () => {
    expect(getEfficiencyLabel(2, 7)).toBe('Κάντε 2 ημέρες 7')
    expect(getEfficiencyLabel(5, 9)).toBe('Κάντε 5 ημέρες 9')
  })
})

describe('createCustomPeriod', () => {
  it('should create valid OptimizationResult', () => {
    // Jan 5-7, 2026: Monday (work), Tuesday (Epiphany), Wednesday (work)
    const start = new Date(2026, 0, 5)
    const end = new Date(2026, 0, 7)

    const result = createCustomPeriod(start, end, mockHolidays)

    expect(result.range.startDate).toEqual(start)
    expect(result.range.endDate).toEqual(end)
    expect(result.totalDays).toBe(3)
    expect(result.leaveDaysRequired).toBe(2) // Mon + Wed
    expect(result.freeDays).toBe(1) // Epiphany
    expect(result.efficiency).toBe(1.5) // 3/2
    expect(result.efficiencyLabel).toBe('Κάντε 2 ημέρες 3')
    expect(result.days).toHaveLength(3)
  })

  it('should handle weekend-only period', () => {
    // Saturday Jan 3 to Sunday Jan 4, 2026
    const start = new Date(2026, 0, 3)
    const end = new Date(2026, 0, 4)

    const result = createCustomPeriod(start, end, mockHolidays)

    expect(result.totalDays).toBe(2)
    expect(result.leaveDaysRequired).toBe(0)
    expect(result.freeDays).toBe(2)
    expect(result.efficiency).toBe(2) // totalDays when leaveDays is 0
    expect(result.efficiencyLabel).toBe('2 δωρεάν ημέρες')
  })

  it('should handle single day period', () => {
    const singleDay = new Date(2026, 0, 5) // Monday

    const result = createCustomPeriod(singleDay, singleDay, mockHolidays)

    expect(result.totalDays).toBe(1)
    expect(result.leaveDaysRequired).toBe(1)
    expect(result.efficiency).toBe(1)
  })

  it('should include holiday around May 1st weekend', () => {
    // April 30 (Thu) to May 3 (Sun), 2026
    const start = new Date(2026, 3, 30)
    const end = new Date(2026, 4, 3)

    const result = createCustomPeriod(start, end, mockHolidays)

    expect(result.totalDays).toBe(4)
    expect(result.leaveDaysRequired).toBe(1) // Only Thursday
    expect(result.freeDays).toBe(3) // Friday (May 1 holiday) + Sat + Sun
    expect(result.efficiency).toBe(4) // 4/1
  })

  it('should handle single day that is a holiday', () => {
    // Jan 6, 2026 - Epiphany (Tuesday)
    const epiphany = new Date(2026, 0, 6)

    const result = createCustomPeriod(epiphany, epiphany, mockHolidays)

    expect(result.totalDays).toBe(1)
    expect(result.leaveDaysRequired).toBe(0)
    expect(result.freeDays).toBe(1)
    expect(result.efficiency).toBe(1) // totalDays when no leave required
    expect(result.efficiencyLabel).toBe('1 δωρεάν ημέρες')
  })

  it('should handle period with multiple consecutive holidays', () => {
    // Create holidays for Jan 5-7
    const consecutiveHolidays: Holiday[] = [
      {
        date: new Date(2026, 0, 5),
        name: 'H1',
        nameGreek: 'Α1',
        isMovable: false,
        isCustom: false,
      },
      {
        date: new Date(2026, 0, 6),
        name: 'H2',
        nameGreek: 'Α2',
        isMovable: false,
        isCustom: false,
      },
      {
        date: new Date(2026, 0, 7),
        name: 'H3',
        nameGreek: 'Α3',
        isMovable: false,
        isCustom: false,
      },
    ]

    const result = createCustomPeriod(
      new Date(2026, 0, 5),
      new Date(2026, 0, 7),
      consecutiveHolidays
    )

    expect(result.totalDays).toBe(3)
    expect(result.leaveDaysRequired).toBe(0)
    expect(result.freeDays).toBe(3)
    expect(result.efficiency).toBe(3)
  })
})

describe('validateDateRange', () => {
  // Mock the current date for consistent testing
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 8)) // Jan 8, 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return invalid when dates are empty', () => {
    const result = validateDateRange('', '', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Παρακαλώ επιλέξτε και τις δύο ημερομηνίες')
  })

  it('should return invalid when start date is empty', () => {
    const result = validateDateRange('', '2026-01-15', 2026)
    expect(result.valid).toBe(false)
  })

  it('should return invalid when end date is empty', () => {
    const result = validateDateRange('2026-01-10', '', 2026)
    expect(result.valid).toBe(false)
  })

  it('should return invalid for invalid date strings', () => {
    const result = validateDateRange('not-a-date', '2026-01-15', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Μη έγκυρη ημερομηνία')
  })

  it('should return invalid when start is after end', () => {
    const result = validateDateRange('2026-01-20', '2026-01-10', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Η ημερομηνία έναρξης πρέπει να είναι πριν την ημερομηνία λήξης')
  })

  it('should return invalid for past dates', () => {
    const result = validateDateRange('2026-01-05', '2026-01-10', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Η ημερομηνία έναρξης πρέπει να είναι στο μέλλον')
  })

  it('should return valid for today', () => {
    const result = validateDateRange('2026-01-08', '2026-01-10', 2026)
    expect(result.valid).toBe(true)
  })

  it('should return valid for future dates in current year', () => {
    const result = validateDateRange('2026-06-01', '2026-06-15', 2026)
    expect(result.valid).toBe(true)
  })

  it('should return invalid for dates before year start', () => {
    // Dec 25, 2025 is also in the past relative to our mocked date (Jan 8, 2026)
    // So the past dates check triggers first
    const result = validateDateRange('2025-12-25', '2026-01-05', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Η ημερομηνία έναρξης πρέπει να είναι στο μέλλον')
  })

  it('should return invalid for dates after year end', () => {
    const result = validateDateRange('2026-12-25', '2027-01-05', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Οι ημερομηνίες πρέπει να είναι εντός του έτους 2026')
  })

  it('should allow same day for start and end', () => {
    const result = validateDateRange('2026-06-15', '2026-06-15', 2026)
    expect(result.valid).toBe(true)
  })

  it('should return invalid for invalid end date with valid start', () => {
    const result = validateDateRange('2026-06-15', 'invalid', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Μη έγκυρη ημερομηνία')
  })

  it('should return invalid when start date is in future year', () => {
    const result = validateDateRange('2027-01-15', '2027-01-20', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Οι ημερομηνίες πρέπει να είναι εντός του έτους 2026')
  })

  it('should return invalid for malformed date string', () => {
    const result = validateDateRange('2026/06/15', '2026-06-15', 2026)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Μη έγκυρη ημερομηνία')
  })

  it('should handle last day of year', () => {
    const result = validateDateRange('2026-12-31', '2026-12-31', 2026)
    expect(result.valid).toBe(true)
  })

  it('should handle first day of year when it is today', () => {
    vi.setSystemTime(new Date(2026, 0, 1)) // Jan 1, 2026
    const result = validateDateRange('2026-01-01', '2026-01-05', 2026)
    expect(result.valid).toBe(true)
  })
})

describe('useCustomPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 8))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return composable functions', () => {
    const holidays = ref(mockHolidays)
    const composable = useCustomPeriod(holidays)

    expect(composable.createCustomPeriod).toBeDefined()
    expect(composable.validateDateRange).toBeDefined()
    expect(composable.generateCustomCalendar).toBeDefined()
  })

  it('should use holidays from ref', () => {
    const holidays = ref(mockHolidays)
    const { createCustomPeriod } = useCustomPeriod(holidays)

    // Jan 5-7 includes Epiphany (Jan 6)
    const result = createCustomPeriod(new Date(2026, 0, 5), new Date(2026, 0, 7))

    expect(result.freeDays).toBe(1) // Epiphany
  })

  it('should react to holiday changes', () => {
    const holidays = ref<Holiday[]>([])
    const { createCustomPeriod } = useCustomPeriod(holidays)

    // Without holidays, all weekdays are work days
    const result1 = createCustomPeriod(new Date(2026, 0, 5), new Date(2026, 0, 7))
    expect(result1.leaveDaysRequired).toBe(3) // Mon, Tue, Wed

    // Add Epiphany holiday
    holidays.value = mockHolidays

    const result2 = createCustomPeriod(new Date(2026, 0, 5), new Date(2026, 0, 7))
    expect(result2.leaveDaysRequired).toBe(2) // Mon, Wed (Tue is holiday)
  })
})
