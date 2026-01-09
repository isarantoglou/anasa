import { type Ref } from 'vue'
import {
  eachDayOfInterval,
  isWeekend,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  parseISO,
  isValid
} from 'date-fns'
import type { Holiday, DayInfo, OptimizationResult } from '../types'

/**
 * Validation result for date range input
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Generate calendar (DayInfo array) for a custom date range
 */
function generateCustomCalendar(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): DayInfo[] {
  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  return allDays.map(date => {
    const weekend = isWeekend(date)
    const holiday = holidays.find(h => isSameDay(h.date, date))

    return {
      date,
      cost: (weekend || holiday ? 0 : 1) as 0 | 1,
      isHoliday: !!holiday,
      isWeekend: weekend,
      holidayName: holiday?.nameGreek
    }
  })
}

/**
 * Calculate efficiency label (matches useLeaveOptimizer pattern)
 */
function getEfficiencyLabel(leaveDays: number, totalDays: number): string {
  if (leaveDays === 0) return `${totalDays} δωρεάν ημέρες`
  return `Κάντε ${leaveDays} ημέρ${leaveDays > 1 ? 'ες' : 'α'} ${totalDays}`
}

/**
 * Create OptimizationResult from custom date range
 */
function createCustomPeriod(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): OptimizationResult {
  const days = generateCustomCalendar(startDate, endDate, holidays)
  const totalDays = days.length
  const leaveDaysRequired = days.filter(d => d.cost === 1).length
  const freeDays = days.filter(d => d.cost === 0).length

  // Calculate efficiency (handle zero case - infinite efficiency)
  const efficiency = leaveDaysRequired === 0 ? totalDays : totalDays / leaveDaysRequired

  return {
    range: { startDate, endDate },
    totalDays,
    leaveDaysRequired,
    freeDays,
    efficiency,
    efficiencyLabel: getEfficiencyLabel(leaveDaysRequired, totalDays),
    days
  }
}

/**
 * Validate date range for custom period
 */
function validateDateRange(
  startDateStr: string,
  endDateStr: string,
  currentYear: number
): ValidationResult {
  // Check both dates provided
  if (!startDateStr || !endDateStr) {
    return { valid: false, error: 'Παρακαλώ επιλέξτε και τις δύο ημερομηνίες' }
  }

  // Parse and validate
  const startDate = parseISO(startDateStr)
  const endDate = parseISO(endDateStr)

  if (!isValid(startDate) || !isValid(endDate)) {
    return { valid: false, error: 'Μη έγκυρη ημερομηνία' }
  }

  // Start must be <= end
  if (isAfter(startDate, endDate)) {
    return {
      valid: false,
      error: 'Η ημερομηνία έναρξης πρέπει να είναι πριν την ημερομηνία λήξης'
    }
  }

  // Must be in future (or today)
  const today = startOfDay(new Date())
  if (isBefore(startDate, today)) {
    return { valid: false, error: 'Η ημερομηνία έναρξης πρέπει να είναι στο μέλλον' }
  }

  // Must be within selected year
  const yearStart = new Date(currentYear, 0, 1)
  const yearEnd = new Date(currentYear, 11, 31)

  if (isBefore(startDate, yearStart) || isAfter(endDate, yearEnd)) {
    return {
      valid: false,
      error: `Οι ημερομηνίες πρέπει να είναι εντός του έτους ${currentYear}`
    }
  }

  return { valid: true }
}

/**
 * Composable for custom period creation
 */
export function useCustomPeriod(holidays: Ref<Holiday[]>) {
  return {
    createCustomPeriod: (startDate: Date, endDate: Date) =>
      createCustomPeriod(startDate, endDate, holidays.value),
    validateDateRange,
    generateCustomCalendar: (startDate: Date, endDate: Date) =>
      generateCustomCalendar(startDate, endDate, holidays.value)
  }
}

// Export standalone functions for testing
export {
  generateCustomCalendar,
  getEfficiencyLabel,
  createCustomPeriod,
  validateDateRange
}
