/**
 * useYearComparison Composable
 *
 * Provides utilities for comparing holidays across different years.
 * Reuses the calculateOrthodoxEaster function from useGreekHolidays.
 */

import { format, addDays, isWeekend } from 'date-fns'
import { el } from 'date-fns/locale'
import { calculateOrthodoxEaster } from './useGreekHolidays'

export interface HolidayInfo {
  label: string
  isWeekend: boolean
}

// Fixed holiday dates mapping (MM-DD format)
const FIXED_HOLIDAY_DATES: Record<string, string> = {
  Πρωτοχρονιά: '01-01',
  Θεοφάνεια: '01-06',
  Ευαγγελισμός: '03-25',
  Πρωτομαγιά: '05-01',
  Δεκαπενταύγουστος: '08-15',
  'Ημέρα του Όχι': '10-28',
  Χριστούγεννα: '12-25',
  '2η Χριστουγέννων': '12-26',
}

// Greek day names
const GREEK_DAYS = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ']

// List of fixed holidays for iteration
export const FIXED_HOLIDAYS = Object.keys(FIXED_HOLIDAY_DATES)

/**
 * Get a movable holiday date based on Easter offset
 */
function getMovableHolidayDate(year: number, offsetFromEaster: number): Date {
  const easter = calculateOrthodoxEaster(year)
  return addDays(easter, offsetFromEaster)
}

/**
 * Format a date as holiday info with weekend detection
 */
function formatHolidayInfo(date: Date): HolidayInfo {
  return {
    label: format(date, 'd MMM', { locale: el }),
    isWeekend: isWeekend(date),
  }
}

/**
 * Get Easter date formatted for comparison
 */
export function getEasterForYear(year: number): string {
  const easter = calculateOrthodoxEaster(year)
  return format(easter, 'd MMM', { locale: el })
}

/**
 * Get Clean Monday info (48 days before Easter)
 */
export function getCleanMondayForYear(year: number): HolidayInfo {
  return formatHolidayInfo(getMovableHolidayDate(year, -48))
}

/**
 * Get Good Friday info (2 days before Easter)
 */
export function getGoodFridayForYear(year: number): HolidayInfo {
  return formatHolidayInfo(getMovableHolidayDate(year, -2))
}

/**
 * Get Easter Monday info (1 day after Easter)
 */
export function getEasterMondayForYear(year: number): HolidayInfo {
  return formatHolidayInfo(getMovableHolidayDate(year, 1))
}

/**
 * Get Holy Spirit Monday info (50 days after Easter)
 */
export function getHolySpiritForYear(year: number): HolidayInfo {
  return formatHolidayInfo(getMovableHolidayDate(year, 50))
}

/**
 * Get fixed holiday info for a given year
 */
export function getFixedHolidayDay(holidayName: string, year: number): HolidayInfo {
  const dateStr = FIXED_HOLIDAY_DATES[holidayName]
  if (!dateStr) return { label: '-', isWeekend: false }

  const [monthStr, dayStr] = dateStr.split('-')
  const month = parseInt(monthStr!, 10)
  const day = parseInt(dayStr!, 10)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay()

  return {
    label: `${GREEK_DAYS[dayOfWeek]} ${day}/${month}`,
    isWeekend: isWeekend(date),
  }
}

/**
 * Main composable for year comparison utilities
 */
export function useYearComparison() {
  return {
    fixedHolidays: FIXED_HOLIDAYS,
    getEasterForYear,
    getCleanMondayForYear,
    getGoodFridayForYear,
    getEasterMondayForYear,
    getHolySpiritForYear,
    getFixedHolidayDay,
  }
}
