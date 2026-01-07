/**
 * useGreekHolidays Composable
 *
 * Provides Greek public holidays for a given year, including:
 * - Orthodox Easter calculation using Meeus/Jones/Butcher algorithm
 * - Movable holidays dependent on Easter
 * - Fixed public holidays
 */

import { computed, ref, type Ref } from 'vue'
import { addDays, isWeekend, isSameDay } from 'date-fns'
import type { Holiday, CustomHoliday } from '../types'

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

/**
 * Get the offset between Julian and Gregorian calendars
 * This changes by 1 day every 100 years (except centuries divisible by 400)
 */
function getJulianGregorianOffset(year: number): number {
  // For years 1900-2099, the offset is 13 days
  // For years 2100-2199, it will be 14 days
  const century = Math.floor(year / 100)
  const leapCenturies = Math.floor(century / 4)
  return century - leapCenturies - 2
}

/**
 * Get all fixed Greek public holidays for a year
 */
function getFixedHolidays(year: number): Holiday[] {
  return [
    {
      date: new Date(year, 0, 1), // January 1
      name: "New Year's Day",
      nameGreek: 'Πρωτοχρονιά',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 0, 6), // January 6
      name: 'Epiphany',
      nameGreek: 'Θεοφάνια',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 2, 25), // March 25
      name: 'Independence Day',
      nameGreek: 'Εικοστή Πέμπτη Μαρτίου',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 4, 1), // May 1
      name: 'Labour Day',
      nameGreek: 'Πρωτομαγιά',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 7, 15), // August 15
      name: 'Assumption of Mary',
      nameGreek: 'Κοίμηση της Θεοτόκου',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 9, 28), // October 28
      name: 'Ohi Day',
      nameGreek: 'Επέτειος του Όχι',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 11, 25), // December 25
      name: 'Christmas Day',
      nameGreek: 'Χριστούγεννα',
      isMovable: false,
      isCustom: false
    },
    {
      date: new Date(year, 11, 26), // December 26
      name: 'Glorifying Mother of God',
      nameGreek: 'Σύναξη της Θεοτόκου',
      isMovable: false,
      isCustom: false
    }
  ]
}

/**
 * Get all movable holidays based on Orthodox Easter
 */
function getMovableHolidays(easterDate: Date): Holiday[] {
  return [
    {
      date: addDays(easterDate, -48), // 48 days before Easter
      name: 'Clean Monday',
      nameGreek: 'Καθαρά Δευτέρα',
      isMovable: true,
      isCustom: false
    },
    {
      date: addDays(easterDate, -2), // Good Friday
      name: 'Good Friday',
      nameGreek: 'Μεγάλη Παρασκευή',
      isMovable: true,
      isCustom: false
    },
    {
      date: easterDate, // Easter Sunday
      name: 'Easter Sunday',
      nameGreek: 'Κυριακή του Πάσχα',
      isMovable: true,
      isCustom: false
    },
    {
      date: addDays(easterDate, 1), // Easter Monday
      name: 'Easter Monday',
      nameGreek: 'Δευτέρα του Πάσχα',
      isMovable: true,
      isCustom: false
    },
    {
      date: addDays(easterDate, 50), // 50 days after Easter
      name: 'Whit Monday (Holy Spirit)',
      nameGreek: 'Αγίου Πνεύματος',
      isMovable: true,
      isCustom: false
    }
  ]
}

/**
 * Convert custom holidays to Holiday objects
 */
function convertCustomHolidays(customHolidays: CustomHoliday[]): Holiday[] {
  return customHolidays
    .filter(ch => ch.date && ch.name)
    .map(ch => ({
      date: new Date(ch.date),
      name: ch.name,
      nameGreek: ch.name,
      isMovable: false,
      isCustom: true
    }))
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, holidays: Holiday[]): Holiday | undefined {
  return holidays.find(h => isSameDay(h.date, date))
}

/**
 * Check if a holiday falls on a weekend (cost = 0 regardless)
 */
export function isHolidayOnWeekend(holiday: Holiday): boolean {
  return isWeekend(holiday.date)
}

/**
 * Main composable for Greek holidays
 */
export function useGreekHolidays(
  year: Ref<number>,
  customHolidays: Ref<CustomHoliday[]>,
  includeHolySpirit: Ref<boolean> = ref(true)
) {
  // Calculate Orthodox Easter for the year
  const orthodoxEaster = computed(() => calculateOrthodoxEaster(year.value))

  // Get all fixed holidays
  const fixedHolidays = computed(() => getFixedHolidays(year.value))

  // Get all movable holidays (filter Holy Spirit based on setting)
  const movableHolidays = computed(() => {
    const holidays = getMovableHolidays(orthodoxEaster.value)
    if (!includeHolySpirit.value) {
      return holidays.filter(h => h.name !== 'Whit Monday (Holy Spirit)')
    }
    return holidays
  })

  // Convert custom holidays
  const convertedCustomHolidays = computed(() =>
    convertCustomHolidays(customHolidays.value)
  )

  // Combine all holidays
  const allHolidays = computed(() => [
    ...fixedHolidays.value,
    ...movableHolidays.value,
    ...convertedCustomHolidays.value
  ].sort((a, b) => a.date.getTime() - b.date.getTime()))

  // Holidays that fall on weekdays (actual day-off value)
  const effectiveHolidays = computed(() =>
    allHolidays.value.filter(h => !isWeekend(h.date))
  )

  // Holidays that fall on weekends (no extra day off)
  const weekendHolidays = computed(() =>
    allHolidays.value.filter(h => isWeekend(h.date))
  )

  return {
    orthodoxEaster,
    fixedHolidays,
    movableHolidays,
    customHolidays: convertedCustomHolidays,
    allHolidays,
    effectiveHolidays,
    weekendHolidays,
    isHoliday: (date: Date) => isHoliday(date, allHolidays.value),
    isHolidayOnWeekend
  }
}
