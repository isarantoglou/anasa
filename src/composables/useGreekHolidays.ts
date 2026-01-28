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
import { calculateOrthodoxEaster } from '../utils/easterCalculation'

// Re-export for backwards compatibility
export { calculateOrthodoxEaster }

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
      isCustom: false,
    },
    {
      date: new Date(year, 0, 6), // January 6
      name: 'Epiphany',
      nameGreek: 'Θεοφάνια',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 2, 25), // March 25
      name: 'Independence Day',
      nameGreek: 'Εικοστή Πέμπτη Μαρτίου',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 4, 1), // May 1
      name: 'Labour Day',
      nameGreek: 'Πρωτομαγιά',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 7, 15), // August 15
      name: 'Assumption of Mary',
      nameGreek: 'Κοίμηση της Θεοτόκου',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 9, 28), // October 28
      name: 'Ohi Day',
      nameGreek: 'Επέτειος του Όχι',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 11, 25), // December 25
      name: 'Christmas Day',
      nameGreek: 'Χριστούγεννα',
      isMovable: false,
      isCustom: false,
    },
    {
      date: new Date(year, 11, 26), // December 26
      name: 'Glorifying Mother of God',
      nameGreek: 'Σύναξη της Θεοτόκου',
      isMovable: false,
      isCustom: false,
    },
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
      isCustom: false,
    },
    {
      date: addDays(easterDate, -2), // Good Friday
      name: 'Good Friday',
      nameGreek: 'Μεγάλη Παρασκευή',
      isMovable: true,
      isCustom: false,
    },
    {
      date: easterDate, // Easter Sunday
      name: 'Easter Sunday',
      nameGreek: 'Κυριακή του Πάσχα',
      isMovable: true,
      isCustom: false,
    },
    {
      date: addDays(easterDate, 1), // Easter Monday
      name: 'Easter Monday',
      nameGreek: 'Δευτέρα του Πάσχα',
      isMovable: true,
      isCustom: false,
    },
    {
      date: addDays(easterDate, 50), // 50 days after Easter
      name: 'Whit Monday (Holy Spirit)',
      nameGreek: 'Αγίου Πνεύματος',
      isMovable: true,
      isCustom: false,
    },
  ]
}

/**
 * Convert custom holidays to Holiday objects for the given year
 * Handles recurring holidays (patron saints) and movable feasts (Easter-dependent)
 */
function convertCustomHolidays(
  customHolidays: CustomHoliday[],
  year: number,
  easterDate: Date
): Holiday[] {
  return customHolidays
    .filter((ch) => ch.name && (ch.date || ch.recurringDate))
    .map((ch) => {
      let date: Date

      if (ch.isMovable && ch.easterOffset !== undefined) {
        // Movable feast: calculate from Easter
        date = addDays(easterDate, ch.easterOffset)
      } else if (ch.movesIfBeforeEaster && ch.recurringDate) {
        // Conditionally movable feast (e.g., Saint George):
        // If fixed date falls on/before Easter, move to Bright Monday (Easter + 1)
        const parts = ch.recurringDate.split('-')
        const month = parts[0] ?? '01'
        const day = parts[1] ?? '01'
        const fixedDate = new Date(year, parseInt(month) - 1, parseInt(day))

        if (fixedDate <= easterDate) {
          // Move to Bright Monday (Easter Monday)
          date = addDays(easterDate, 1)
        } else {
          // Celebrate on fixed date
          date = fixedDate
        }
      } else if (ch.isRecurring && ch.recurringDate) {
        // Recurring holiday: use recurringDate with current year
        const parts = ch.recurringDate.split('-')
        const month = parts[0] ?? '01'
        const day = parts[1] ?? '01'
        date = new Date(year, parseInt(month) - 1, parseInt(day))
      } else {
        // One-time holiday: use stored date
        date = new Date(ch.date)
      }

      return {
        date,
        name: ch.name,
        nameGreek: ch.name,
        isMovable: ch.isMovable ?? false,
        isCustom: true,
      }
    })
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => isSameDay(h.date, date))
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
      return holidays.filter((h) => h.name !== 'Whit Monday (Holy Spirit)')
    }
    return holidays
  })

  // Convert custom holidays (recalculates dates for recurring/movable holidays)
  const convertedCustomHolidays = computed(() =>
    convertCustomHolidays(customHolidays.value, year.value, orthodoxEaster.value)
  )

  // Combine all holidays
  const allHolidays = computed(() =>
    [...fixedHolidays.value, ...movableHolidays.value, ...convertedCustomHolidays.value].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
  )

  // Holidays that fall on weekdays (actual day-off value)
  const effectiveHolidays = computed(() => allHolidays.value.filter((h) => !isWeekend(h.date)))

  // Holidays that fall on weekends (no extra day off)
  const weekendHolidays = computed(() => allHolidays.value.filter((h) => isWeekend(h.date)))

  return {
    orthodoxEaster,
    fixedHolidays,
    movableHolidays,
    customHolidays: convertedCustomHolidays,
    allHolidays,
    effectiveHolidays,
    weekendHolidays,
    isHoliday: (date: Date) => isHoliday(date, allHolidays.value),
    isHolidayOnWeekend,
  }
}
