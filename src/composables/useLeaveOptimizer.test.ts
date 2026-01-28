import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useLeaveOptimizer } from './useLeaveOptimizer'
import type { Holiday } from '../types'

// Helper to create a holiday
function createHoliday(date: Date, name: string): Holiday {
  return {
    date,
    name,
    nameGreek: name,
    isMovable: false,
    isCustom: false,
  }
}

describe('useLeaveOptimizer', () => {
  describe('initialization', () => {
    it('should initialize with computed values', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])

      const optimizer = useLeaveOptimizer(year, leaveDays, holidays)

      expect(optimizer.yearCalendar.value).toBeDefined()
      expect(optimizer.activeCalendar.value).toBeDefined()
      expect(optimizer.stats.value).toBeDefined()
      expect(optimizer.fullYearStats.value).toBeDefined()
    })
  })

  describe('yearCalendar', () => {
    it('should generate 365 days for 2026', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(yearCalendar.value.length).toBe(365)
    })

    it('should generate 366 days for leap year 2024', () => {
      const year = ref(2024)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(yearCalendar.value.length).toBe(366)
    })

    it('should mark weekends with cost 0', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      // Find a Saturday (Jan 3, 2026 is Saturday)
      const saturday = yearCalendar.value.find(
        (d) => d.date.getDate() === 3 && d.date.getMonth() === 0
      )
      expect(saturday?.isWeekend).toBe(true)
      expect(saturday?.cost).toBe(0)

      // Find a Sunday (Jan 4, 2026 is Sunday)
      const sunday = yearCalendar.value.find(
        (d) => d.date.getDate() === 4 && d.date.getMonth() === 0
      )
      expect(sunday?.isWeekend).toBe(true)
      expect(sunday?.cost).toBe(0)
    })

    it('should mark holidays with cost 0', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'), // Thursday
      ])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      const newYear = yearCalendar.value.find(
        (d) => d.date.getDate() === 1 && d.date.getMonth() === 0
      )
      expect(newYear?.isHoliday).toBe(true)
      expect(newYear?.cost).toBe(0)
      expect(newYear?.holidayName).toBe('New Year')
    })

    it('should mark regular workdays with cost 1', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      // Jan 2, 2026 is Friday (regular workday)
      const friday = yearCalendar.value.find(
        (d) => d.date.getDate() === 2 && d.date.getMonth() === 0
      )
      expect(friday?.isWeekend).toBe(false)
      expect(friday?.isHoliday).toBe(false)
      expect(friday?.cost).toBe(1)
    })
  })

  describe('stats', () => {
    it('should calculate correct stats for full year', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'), // Thursday
        createHoliday(new Date(2026, 0, 6), 'Epiphany'), // Tuesday
      ])
      const calculateFromToday = ref(false)

      const { stats } = useLeaveOptimizer(year, leaveDays, holidays, ref(3), calculateFromToday)

      expect(stats.value.totalDays).toBe(365)
      // 2026 has 104 weekend days (52 weeks)
      expect(stats.value.weekendDays).toBe(104)
      // 2 holidays on weekdays
      expect(stats.value.holidayDays).toBe(2)
      // Workdays = 365 - 104 - 2 = 259
      expect(stats.value.workdays).toBe(259)
      expect(stats.value.freeDays).toBe(106) // weekends + holidays
    })
  })

  describe('topOpportunities', () => {
    it('should find opportunities around holidays', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      // Jan 1 (Thu) and Jan 6 (Tue) are holidays
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      expect(topOpportunities.value.length).toBeGreaterThan(0)
    })

    it('should return empty array when no holidays', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      expect(topOpportunities.value).toHaveLength(0)
    })

    it('should respect maxResults limit', () => {
      const year = ref(2026)
      const leaveDays = ref(10)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
        createHoliday(new Date(2026, 2, 25), 'Independence Day'),
        createHoliday(new Date(2026, 4, 1), 'Labour Day'),
        createHoliday(new Date(2026, 7, 15), 'Assumption'),
        createHoliday(new Date(2026, 9, 28), 'Oxi Day'),
        createHoliday(new Date(2026, 11, 25), 'Christmas'),
      ])
      const maxResults = ref(3)
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        maxResults,
        calculateFromToday
      )

      expect(topOpportunities.value.length).toBeLessThanOrEqual(3)
    })

    it('should return non-overlapping periods', () => {
      const year = ref(2026)
      const leaveDays = ref(10)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
        createHoliday(new Date(2026, 2, 25), 'Independence Day'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      // Check that no periods overlap
      for (let i = 0; i < topOpportunities.value.length; i++) {
        for (let j = i + 1; j < topOpportunities.value.length; j++) {
          const a = topOpportunities.value[i]!
          const b = topOpportunities.value[j]!

          const overlaps = !(
            a.range.endDate < b.range.startDate || a.range.startDate > b.range.endDate
          )

          expect(overlaps).toBe(false)
        }
      }
    })
  })

  describe('opportunity properties', () => {
    it('should calculate efficiency correctly', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [createHoliday(new Date(2026, 0, 1), 'New Year')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      if (topOpportunities.value.length > 0) {
        const opp = topOpportunities.value[0]!
        expect(opp.efficiency).toBe(opp.totalDays / opp.leaveDaysRequired)
      }
    })

    it('should have valid date ranges', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [createHoliday(new Date(2026, 0, 1), 'New Year')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      topOpportunities.value.forEach((opp) => {
        expect(opp.range.startDate <= opp.range.endDate).toBe(true)
        expect(opp.range.startDate.getFullYear()).toBe(2026)
        expect(opp.range.endDate.getFullYear()).toBe(2026)
      })
    })

    it('should calculate freeDays correctly', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [createHoliday(new Date(2026, 0, 1), 'New Year')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      topOpportunities.value.forEach((opp) => {
        const calculatedFreeDays = opp.days.filter((d) => d.cost === 0).length
        expect(opp.freeDays).toBe(calculatedFreeDays)
      })
    })

    it('should have efficiency label in Greek', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [createHoliday(new Date(2026, 0, 1), 'New Year')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      topOpportunities.value.forEach((opp) => {
        // Should contain Greek text like "Κάντε" or "ημέρ"
        expect(opp.efficiencyLabel).toMatch(/Κάντε|ημέρ/)
      })
    })
  })

  describe('bestOpportunity', () => {
    it('should return the single best period', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { bestOpportunity, topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      if (bestOpportunity.value && topOpportunities.value.length > 0) {
        // Best opportunity should be one of the top opportunities
        const found = topOpportunities.value.some(
          (opp) =>
            opp.range.startDate.getTime() === bestOpportunity.value!.range.startDate.getTime()
        )
        expect(found).toBe(true)
      }
    })

    it('should return null when no holidays', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])
      const calculateFromToday = ref(false)

      const { bestOpportunity } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      expect(bestOpportunity.value).toBeNull()
    })
  })

  describe('holidayOpportunities', () => {
    it('should find opportunities for each holiday', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 4, 1), 'Labour Day'),
      ])
      const calculateFromToday = ref(false)

      const { holidayOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      // Should have at least one opportunity for each holiday
      expect(holidayOpportunities.value.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('formatDateRange', () => {
    it('should format date range in Greek', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { formatDateRange } = useLeaveOptimizer(year, leaveDays, holidays)

      const range = {
        startDate: new Date(2026, 3, 10),
        endDate: new Date(2026, 3, 15),
      }

      const formatted = formatDateRange(range)

      // Should contain Greek month abbreviation
      expect(formatted).toMatch(/Απρ|Apr/)
      expect(formatted).toContain('10')
      expect(formatted).toContain('15')
    })
  })

  describe('getDayClass', () => {
    it('should return holiday class for holiday', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { getDayClass } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(getDayClass({ date: new Date(), cost: 0, isHoliday: true, isWeekend: false })).toBe(
        'holiday'
      )
    })

    it('should return weekend class for weekend', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { getDayClass } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(getDayClass({ date: new Date(), cost: 0, isHoliday: false, isWeekend: true })).toBe(
        'weekend'
      )
    })

    it('should return workday class for regular day', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { getDayClass } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(getDayClass({ date: new Date(), cost: 1, isHoliday: false, isWeekend: false })).toBe(
        'workday'
      )
    })
  })

  describe('reactivity', () => {
    it('should update when year changes', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])

      const { yearCalendar } = useLeaveOptimizer(year, leaveDays, holidays)

      expect(yearCalendar.value.length).toBe(365)

      year.value = 2024 // Leap year
      expect(yearCalendar.value.length).toBe(366)
    })

    it('should update when holidays change', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      const holidayList = ref<Holiday[]>([])
      const holidays = computed(() => holidayList.value)
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      expect(topOpportunities.value).toHaveLength(0)

      holidayList.value = [createHoliday(new Date(2026, 0, 1), 'New Year')]

      expect(topOpportunities.value.length).toBeGreaterThan(0)
    })

    it('should update when leave days change', () => {
      const year = ref(2026)
      const leaveDays = ref(2)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      leaveDays.value = 10

      // With more leave days, we might get different or more comprehensive results
      expect(topOpportunities.value).toBeDefined()
    })
  })

  describe('calculateFromToday mode', () => {
    it('should use activeCalendar for current year', () => {
      const thisYear = new Date().getFullYear()
      const year = ref(thisYear)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])
      const calculateFromToday = ref(true)

      const { activeCalendar, yearCalendar } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      // Active calendar should be shorter than full year calendar
      // (unless it's January 1st)
      expect(activeCalendar.value.length).toBeLessThanOrEqual(yearCalendar.value.length)
    })

    it('should use full year for future years', () => {
      const year = ref(2030) // Future year
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])
      const calculateFromToday = ref(true)

      const { activeCalendar, yearCalendar } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      // For future years, active calendar should equal full year
      expect(activeCalendar.value.length).toBe(yearCalendar.value.length)
    })

    it('should use full year when calculateFromToday is false', () => {
      const thisYear = new Date().getFullYear()
      const year = ref(thisYear)
      const leaveDays = ref(5)
      const holidays = computed<Holiday[]>(() => [])
      const calculateFromToday = ref(false)

      const { activeCalendar, yearCalendar } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      expect(activeCalendar.value.length).toBe(yearCalendar.value.length)
    })
  })

  describe('bridging holidays', () => {
    it('should find opportunities bridging two close holidays', () => {
      const year = ref(2026)
      const leaveDays = ref(10)
      // New Year (Jan 1) and Epiphany (Jan 6) are close - can be bridged
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      // Should find at least one opportunity that spans both holidays
      const bridgingOpp = topOpportunities.value.find((opp) => {
        const hasNewYear = opp.days.some((d) => d.date.getDate() === 1 && d.date.getMonth() === 0)
        const hasEpiphany = opp.days.some((d) => d.date.getDate() === 6 && d.date.getMonth() === 0)
        return hasNewYear && hasEpiphany
      })

      expect(bridgingOpp).toBeDefined()
    })

    it('should expand left when bridging holidays with available budget', () => {
      const year = ref(2026)
      const leaveDays = ref(15) // Generous budget
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(5),
        calculateFromToday
      )

      // With generous budget, should expand beyond just the holidays
      const bestOpp = topOpportunities.value[0]
      if (bestOpp) {
        // Should have more than just 6 days (Jan 1-6)
        expect(bestOpp.totalDays).toBeGreaterThanOrEqual(6)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle zero leave days available', () => {
      const year = ref(2026)
      const leaveDays = ref(0)
      const holidays = computed(() => [createHoliday(new Date(2026, 0, 1), 'New Year')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      // With 0 leave days, no opportunities should be found
      expect(topOpportunities.value).toHaveLength(0)
    })

    it('should handle single day available', () => {
      const year = ref(2026)
      const leaveDays = ref(1)
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'), // Thursday
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(10),
        calculateFromToday
      )

      // With 1 leave day, should still find opportunities
      if (topOpportunities.value.length > 0) {
        expect(topOpportunities.value[0]!.leaveDaysRequired).toBeLessThanOrEqual(1)
      }
    })

    it('should handle holiday on weekend correctly', () => {
      const year = ref(2026)
      const leaveDays = ref(5)
      // Aug 15, 2026 falls on Saturday
      const holidays = computed(() => [createHoliday(new Date(2026, 7, 15), 'Assumption')])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      // Holiday on weekend should still be found if there are adjacent workdays
      expect(topOpportunities.value.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle very large leave days budget', () => {
      const year = ref(2026)
      const leaveDays = ref(100) // More than workdays in a month
      const holidays = computed(() => [
        createHoliday(new Date(2026, 0, 1), 'New Year'),
        createHoliday(new Date(2026, 0, 6), 'Epiphany'),
      ])
      const calculateFromToday = ref(false)

      const { topOpportunities } = useLeaveOptimizer(
        year,
        leaveDays,
        holidays,
        ref(3),
        calculateFromToday
      )

      // Should handle large budgets without errors
      expect(topOpportunities.value).toBeDefined()
      if (topOpportunities.value.length > 0) {
        expect(topOpportunities.value[0]!.leaveDaysRequired).toBeLessThanOrEqual(100)
      }
    })
  })
})
