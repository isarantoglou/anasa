/**
 * Orthodox Easter Calculation Utilities
 *
 * Shared utilities for calculating Orthodox Easter date
 * using the Meeus/Jones/Butcher algorithm.
 */

import { addDays } from 'date-fns'

/**
 * Get the offset between Julian and Gregorian calendars
 * This changes by 1 day every 100 years (except centuries divisible by 400)
 */
export function getJulianGregorianOffset(year: number): number {
  // For years 1900-2099, the offset is 13 days
  // For years 2100-2199, it will be 14 days
  const century = Math.floor(year / 100)
  const leapCenturies = Math.floor(century / 4)
  return century - leapCenturies - 2
}

/**
 * Calculate Orthodox Easter date using the Meeus/Jones/Butcher algorithm
 * This algorithm is specifically for the Julian calendar Easter,
 * then converted to Gregorian calendar.
 *
 * @param year - The year to calculate Easter for
 * @returns Date object for Orthodox Easter Sunday
 */
export function calculateOrthodoxEaster(year: number): Date {
  // Meeus/Jones/Butcher algorithm for Orthodox (Julian) Easter
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31) // 3 = March, 4 = April
  const day = ((d + e + 114) % 31) + 1

  // This gives Julian calendar date, need to convert to Gregorian
  // The Julian calendar is 13 days behind Gregorian in 1900-2099
  const julianDate = new Date(year, month - 1, day)

  // Add the Julian-Gregorian offset (13 days for years 1900-2099)
  const gregorianOffset = getJulianGregorianOffset(year)
  return addDays(julianDate, gregorianOffset)
}
