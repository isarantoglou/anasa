/**
 * useLeaveOptimizer Composable
 *
 * Implements a sliding window optimization algorithm to find
 * the best leave periods that maximize days off while minimizing
 * leave days used.
 *
 * WORKDAY CALCULATION VERIFICATION (2026):
 * =========================================
 * 2026 has 365 days total.
 *
 * Step 1: Count weekends
 * - January 2026 starts on Thursday
 * - Using date-fns to count all Saturdays and Sundays
 * - 2026 has 52 weeks + 1 day = 104 weekend days (52 Saturdays + 52 Sundays)
 *
 * Step 2: Count public holidays that fall on WEEKDAYS
 * Greek public holidays in 2026:
 * 1. New Year's Day (Jan 1) - Thursday - WEEKDAY
 * 2. Epiphany (Jan 6) - Tuesday - WEEKDAY
 * 3. Clean Monday (Mar 2, 2026) - Monday - WEEKDAY
 * 4. Independence Day (Mar 25) - Wednesday - WEEKDAY
 * 5. Good Friday (Apr 10, 2026) - Friday - WEEKDAY
 * 6. Easter Monday (Apr 13, 2026) - Monday - WEEKDAY
 * 7. Labour Day (May 1) - Friday - WEEKDAY
 * 8. Holy Spirit Monday (Jun 1, 2026) - Monday - WEEKDAY
 * 9. Assumption of Mary (Aug 15) - Saturday - WEEKEND (doesn't count)
 * 10. Ochi Day (Oct 28) - Wednesday - WEEKDAY
 * 11. Christmas Day (Dec 25) - Friday - WEEKDAY
 * 12. Second Day of Christmas (Dec 26) - Saturday - WEEKEND (doesn't count)
 *
 * Weekday holidays: 10 (excluding Aug 15 Sat and Dec 26 Sat)
 *
 * Step 3: Calculate workdays
 * Total days: 365
 * Weekend days: 104
 * Weekday holidays: 10
 * Workdays = 365 - 104 - 10 = 251
 *
 * The calculation of 251 workdays for 2026 is CORRECT.
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'
import {
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isWeekend,
  isSameDay,
  format,
  isAfter,
  isBefore,
  startOfDay
} from 'date-fns'
import { el } from 'date-fns/locale'
import type { Holiday, DayInfo, OptimizationResult, DateRange } from '../types'

/**
 * Generate a calendar with cost information
 * @param year - The year to generate calendar for
 * @param holidays - List of holidays
 * @param fromDate - Optional start date (for "Today" mode)
 */
function generateCalendar(
  year: number,
  holidays: Holiday[],
  fromDate?: Date
): DayInfo[] {
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))

  // Use fromDate if provided and it's within the year, otherwise use year start
  let start = yearStart
  if (fromDate) {
    const normalizedFromDate = startOfDay(fromDate)
    if (isAfter(normalizedFromDate, yearStart) && isBefore(normalizedFromDate, yearEnd)) {
      start = normalizedFromDate
    }
  }

  const allDays = eachDayOfInterval({ start, end: yearEnd })

  return allDays.map(date => {
    const weekend = isWeekend(date)
    const holiday = holidays.find(h => isSameDay(h.date, date))

    return {
      date,
      // Cost is 0 for weekends and holidays (free days), 1 for workdays
      cost: (weekend || holiday ? 0 : 1) as 0 | 1,
      isHoliday: !!holiday,
      isWeekend: weekend,
      holidayName: holiday?.name
    }
  })
}

/**
 * Calculate efficiency label in Greek (e.g., "Κάντε 3 ημέρες 9")
 */
function getEfficiencyLabel(leaveDays: number, totalDays: number): string {
  if (leaveDays === 0) return `${totalDays} δωρεάν ημέρες`
  return `Κάντε ${leaveDays} ημέρ${leaveDays > 1 ? 'ες' : 'α'} ${totalDays}`
}

/**
 * Holiday-anchored optimization algorithm
 *
 * Strategy: Find optimal leave periods that MUST include at least one public holiday.
 * The goal is to maximize days off by strategically using leave around holidays.
 *
 * For each holiday, we try different expansion strategies:
 * 1. Expand maximally in both directions
 * 2. Expand only left (to connect to previous weekend/holiday)
 * 3. Expand only right (to connect to next weekend/holiday)
 * 4. Try to bridge multiple holidays if they're close enough
 */
function findOptimalPeriods(
  calendar: DayInfo[],
  maxLeaveDays: number,
  topN: number = 3
): OptimizationResult[] {
  const results: OptimizationResult[] = []

  if (calendar.length === 0) return results

  // Find all holiday indices in the calendar
  const holidayIndices = calendar
    .map((day, index) => (day.isHoliday ? index : -1))
    .filter(i => i >= 0)

  if (holidayIndices.length === 0) return results

  // For each holiday, find the optimal period around it
  for (const holidayIndex of holidayIndices) {
    // Strategy 1: Expand maximally in both directions
    const maxExpansion = expandAroundHoliday(calendar, holidayIndex, maxLeaveDays, 'both')
    if (maxExpansion) results.push(maxExpansion)

    // Strategy 2: Expand primarily left (good when holiday is mid-week)
    const leftExpansion = expandAroundHoliday(calendar, holidayIndex, maxLeaveDays, 'left')
    if (leftExpansion) results.push(leftExpansion)

    // Strategy 3: Expand primarily right
    const rightExpansion = expandAroundHoliday(calendar, holidayIndex, maxLeaveDays, 'right')
    if (rightExpansion) results.push(rightExpansion)
  }

  // Try to find periods that bridge multiple holidays
  for (let i = 0; i < holidayIndices.length - 1; i++) {
    const firstHoliday = holidayIndices[i]!
    const secondHoliday = holidayIndices[i + 1]!

    // Check if we can bridge these two holidays within our leave budget
    const bridgeResult = tryBridgeHolidays(calendar, firstHoliday, secondHoliday, maxLeaveDays)
    if (bridgeResult) results.push(bridgeResult)
  }

  // Filter out results that don't actually contain a holiday (safety check)
  const holidayResults = results.filter(r => r.days.some(d => d.isHoliday))

  // Sort by leave days used (highest first = best use of budget), then by total days
  holidayResults.sort((a, b) => {
    // Primary: leave days used (prefer results that use more of the available budget)
    if (b.leaveDaysRequired !== a.leaveDaysRequired) {
      return b.leaveDaysRequired - a.leaveDaysRequired
    }
    // Secondary: total days (prefer longer vacations)
    return b.totalDays - a.totalDays
  })

  // Remove overlapping periods, keeping the best ones
  const nonOverlapping: OptimizationResult[] = []

  for (const result of holidayResults) {
    const overlaps = nonOverlapping.some(existing => {
      return !(
        result.range.endDate < existing.range.startDate ||
        result.range.startDate > existing.range.endDate
      )
    })

    if (!overlaps) {
      nonOverlapping.push(result)
      // Only limit if topN is specified (not 0 or Infinity)
      if (topN > 0 && topN < Infinity && nonOverlapping.length >= topN) break
    }
  }

  return nonOverlapping
}

/**
 * Expand around a holiday to find an optimal period
 */
function expandAroundHoliday(
  calendar: DayInfo[],
  holidayIndex: number,
  maxLeaveDays: number,
  direction: 'both' | 'left' | 'right'
): OptimizationResult | null {
  let left = holidayIndex
  let right = holidayIndex
  let cost: number = calendar[holidayIndex]?.cost ?? 0

  if (direction === 'both' || direction === 'left') {
    // Expand left
    while (left > 0) {
      const prevDay = calendar[left - 1]
      if (!prevDay) break
      const newCost = cost + prevDay.cost
      if (newCost > maxLeaveDays) break
      left--
      cost = newCost
    }
  }

  if (direction === 'both' || direction === 'right') {
    // Expand right
    while (right < calendar.length - 1) {
      const nextDay = calendar[right + 1]
      if (!nextDay) break
      const newCost = cost + nextDay.cost
      if (newCost > maxLeaveDays) break
      right++
      cost = newCost
    }
  }

  return createResult(calendar, left, right, cost)
}

/**
 * Try to bridge two holidays with leave days
 */
function tryBridgeHolidays(
  calendar: DayInfo[],
  firstHolidayIndex: number,
  secondHolidayIndex: number,
  maxLeaveDays: number
): OptimizationResult | null {
  // Calculate cost to bridge from first holiday to second
  let bridgeCost = 0
  for (let i = firstHolidayIndex; i <= secondHolidayIndex; i++) {
    bridgeCost += calendar[i]?.cost ?? 0
  }

  // If bridging alone exceeds budget, skip
  if (bridgeCost > maxLeaveDays) return null

  // Now expand outward from the bridged period
  let left = firstHolidayIndex
  let right = secondHolidayIndex
  let cost = bridgeCost

  // Expand left
  while (left > 0) {
    const prevDay = calendar[left - 1]
    if (!prevDay) break
    const newCost = cost + prevDay.cost
    if (newCost > maxLeaveDays) break
    left--
    cost = newCost
  }

  // Expand right
  while (right < calendar.length - 1) {
    const nextDay = calendar[right + 1]
    if (!nextDay) break
    const newCost = cost + nextDay.cost
    if (newCost > maxLeaveDays) break
    right++
    cost = newCost
  }

  return createResult(calendar, left, right, cost)
}

/**
 * Create an OptimizationResult from calendar indices
 */
function createResult(
  calendar: DayInfo[],
  left: number,
  right: number,
  cost: number
): OptimizationResult | null {
  const days = calendar.slice(left, right + 1)
  const totalDays = right - left + 1
  const freeDays = days.filter(d => d.cost === 0).length
  const holidayCount = days.filter(d => d.isHoliday).length

  // Must have at least one holiday and require at least 1 leave day
  if (holidayCount === 0 || cost === 0) return null

  // Must span at least 3 days (holiday + some buffer)
  if (totalDays < 3) return null

  const leftDay = calendar[left]
  const rightDay = calendar[right]
  if (!leftDay || !rightDay) return null

  return {
    range: {
      startDate: leftDay.date,
      endDate: rightDay.date
    },
    totalDays,
    leaveDaysRequired: cost,
    freeDays,
    efficiency: totalDays / cost,
    efficiencyLabel: getEfficiencyLabel(cost, totalDays),
    days
  }
}

/**
 * Find the single best period for given leave days
 */
function findBestPeriod(
  calendar: DayInfo[],
  leaveDays: number
): OptimizationResult | null {
  const results = findOptimalPeriods(calendar, leaveDays, 1)
  return results[0] || null
}

/**
 * Find periods around specific holidays
 */
function findHolidayOpportunities(
  calendar: DayInfo[],
  maxLeaveDays: number
): OptimizationResult[] {
  const opportunities: OptimizationResult[] = []

  if (calendar.length === 0) return opportunities

  // Find all holidays in the calendar
  const holidayIndices = calendar
    .map((day, index) => (day.isHoliday ? index : -1))
    .filter(i => i >= 0)

  for (const holidayIndex of holidayIndices) {
    const holidayDay = calendar[holidayIndex]
    if (!holidayDay) continue

    // Expand around each holiday
    let left = holidayIndex
    let right = holidayIndex
    let cost: number = holidayDay.cost

    // Expand left
    while (left > 0) {
      const prevDay = calendar[left - 1]
      if (!prevDay) break
      const newCost = cost + prevDay.cost
      if (newCost > maxLeaveDays) break
      left--
      cost = newCost
    }

    // Expand right
    while (right < calendar.length - 1) {
      const nextDay = calendar[right + 1]
      if (!nextDay) break
      const newCost = cost + nextDay.cost
      if (newCost > maxLeaveDays) break
      right++
      cost = newCost
    }

    const days = calendar.slice(left, right + 1)
    const totalDays = right - left + 1
    const freeDays = days.filter(d => d.cost === 0).length

    const leftDay = calendar[left]
    const rightDay = calendar[right]
    if (totalDays >= 3 && cost > 0 && leftDay && rightDay) {
      opportunities.push({
        range: {
          startDate: leftDay.date,
          endDate: rightDay.date
        },
        totalDays,
        leaveDaysRequired: cost,
        freeDays,
        efficiency: totalDays / cost,
        efficiencyLabel: getEfficiencyLabel(cost, totalDays),
        days
      })
    }
  }

  return opportunities
}

/**
 * Main composable for leave optimization
 *
 * @param year - The year to analyze
 * @param availableLeaveDays - Number of leave days available
 * @param holidays - List of holidays for the year
 * @param maxResults - Maximum number of results to return
 * @param calculateFromToday - If true, calculate from current date; if false, from January 1
 */
export function useLeaveOptimizer(
  year: Ref<number>,
  availableLeaveDays: Ref<number>,
  holidays: ComputedRef<Holiday[]>,
  maxResults: Ref<number> = ref(3),
  calculateFromToday: Ref<boolean> = ref(true)
) {
  // Get the start date based on the toggle
  const effectiveStartDate = computed(() => {
    if (!calculateFromToday.value) {
      return undefined // Full year calculation
    }

    const today = new Date()
    const currentYearValue = year.value
    const thisYear = new Date().getFullYear()

    // Only use today's date if we're looking at the current year
    if (currentYearValue === thisYear) {
      return today
    }

    // For future years, start from January 1
    // For past years, return undefined (full year, though opportunities are in the past)
    return undefined
  })

  // Generate the full year calendar (for stats)
  const fullYearCalendar = computed(() =>
    generateCalendar(year.value, holidays.value)
  )

  // Generate the calendar from the effective start date (for opportunities)
  const activeCalendar = computed(() =>
    generateCalendar(year.value, holidays.value, effectiveStartDate.value)
  )

  // Find the top N optimal periods (uses active calendar - respects "Today" toggle)
  const topOpportunities = computed(() =>
    findOptimalPeriods(activeCalendar.value, availableLeaveDays.value, maxResults.value)
  )

  // Find the single best period
  const bestOpportunity = computed(() =>
    findBestPeriod(activeCalendar.value, availableLeaveDays.value)
  )

  // Find opportunities around holidays
  const holidayOpportunities = computed(() =>
    findHolidayOpportunities(activeCalendar.value, availableLeaveDays.value)
  )

  // Statistics - uses the calendar based on the toggle
  const stats = computed(() => {
    const cal = calculateFromToday.value ? activeCalendar.value : fullYearCalendar.value
    const totalDays = cal.length
    const weekendDays = cal.filter(d => d.isWeekend).length
    const holidayDays = cal.filter(d => d.isHoliday && !d.isWeekend).length
    const workdays = cal.filter(d => d.cost === 1).length

    return {
      totalDays,
      weekendDays,
      holidayDays,
      workdays,
      freeDays: weekendDays + holidayDays
    }
  })

  // Full year statistics (always from Jan 1, for reference)
  const fullYearStats = computed(() => {
    const cal = fullYearCalendar.value
    const totalDays = cal.length
    const weekendDays = cal.filter(d => d.isWeekend).length
    const holidayDays = cal.filter(d => d.isHoliday && !d.isWeekend).length
    const workdays = cal.filter(d => d.cost === 1).length

    return {
      totalDays,
      weekendDays,
      holidayDays,
      workdays,
      freeDays: weekendDays + holidayDays
    }
  })

  // Format date range for display (in Greek)
  const formatDateRange = (range: DateRange): string => {
    return `${format(range.startDate, 'd MMM', { locale: el })} - ${format(range.endDate, 'd MMM yyyy', { locale: el })}`
  }

  // Get day type class for styling
  const getDayClass = (day: DayInfo): string => {
    if (day.isHoliday) return 'holiday'
    if (day.isWeekend) return 'weekend'
    return 'workday'
  }

  return {
    yearCalendar: fullYearCalendar,
    activeCalendar,
    topOpportunities,
    bestOpportunity,
    holidayOpportunities,
    stats,
    fullYearStats,
    formatDateRange,
    getDayClass,
    effectiveStartDate
  }
}
