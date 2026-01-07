/**
 * Greek School Holidays Data Module
 *
 * Provides school holiday periods for Greek public schools.
 * Based on the official Greek school calendar.
 */

export interface SchoolBreak {
  id: string
  name: string
  nameGreek: string
  startDate: Date
  endDate: Date
  icon: string
}

export interface SchoolHoliday {
  date: Date
  name: string
  nameGreek: string
}

/**
 * Calculate Orthodox Easter using Meeus/Jones/Butcher algorithm
 */
function calculateOrthodoxEaster(year: number): Date {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1

  // Julian calendar date
  const julianDate = new Date(year, month - 1, day)
  // Add 13 days for Gregorian conversion (valid for 1900-2099)
  julianDate.setDate(julianDate.getDate() + 13)

  return julianDate
}

/**
 * Get school breaks for a given year
 * Returns Christmas and Easter breaks
 */
export function getSchoolBreaks(year: number): SchoolBreak[] {
  const breaks: SchoolBreak[] = []

  // Christmas Break: December 24 - January 7
  // For a given year, Christmas break starts in December of that year
  breaks.push({
    id: 'christmas',
    name: 'Christmas Break',
    nameGreek: 'Διακοπές Χριστουγέννων',
    startDate: new Date(year, 11, 24), // Dec 24
    endDate: new Date(year + 1, 0, 7), // Jan 7 next year
    icon: '🎄'
  })

  // Easter Break: Approximately April 5-19 (depends on Orthodox Easter)
  // Easter break typically starts on Palm Sunday (1 week before Easter)
  // and ends on the Sunday after Easter (Thomas Sunday)
  const easter = calculateOrthodoxEaster(year)
  const easterBreakStart = new Date(easter)
  easterBreakStart.setDate(easter.getDate() - 7) // Palm Sunday (1 week before)
  const easterBreakEnd = new Date(easter)
  easterBreakEnd.setDate(easter.getDate() + 7) // Week after Easter

  breaks.push({
    id: 'easter',
    name: 'Easter Break',
    nameGreek: 'Διακοπές Πάσχα',
    startDate: easterBreakStart,
    endDate: easterBreakEnd,
    icon: '🐣'
  })

  return breaks
}

/**
 * Get individual school holidays (days off) for a given year
 * These are single days when schools are closed
 */
export function getSchoolHolidays(year: number): SchoolHoliday[] {
  const holidays: SchoolHoliday[] = []
  const easter = calculateOrthodoxEaster(year)

  // October 28 - Oxi Day (schools closed, parade)
  holidays.push({
    date: new Date(year, 9, 28),
    name: 'Oxi Day',
    nameGreek: 'Ημέρα του Όχι'
  })

  // November 17 - Polytechnic Uprising
  holidays.push({
    date: new Date(year, 10, 17),
    name: 'Polytechnic Uprising',
    nameGreek: '17 Νοεμβρίου'
  })

  // January 30 - Three Hierarchs (school holiday only)
  holidays.push({
    date: new Date(year, 0, 30),
    name: 'Three Hierarchs',
    nameGreek: 'Τριών Ιεραρχών'
  })

  // Clean Monday (48 days before Easter)
  const cleanMonday = new Date(easter)
  cleanMonday.setDate(easter.getDate() - 48)
  holidays.push({
    date: cleanMonday,
    name: 'Clean Monday',
    nameGreek: 'Καθαρά Δευτέρα'
  })

  // March 25 - Independence Day
  holidays.push({
    date: new Date(year, 2, 25),
    name: 'Independence Day',
    nameGreek: '25η Μαρτίου'
  })

  // May 1 - Labor Day
  holidays.push({
    date: new Date(year, 4, 1),
    name: 'Labor Day',
    nameGreek: 'Πρωτομαγιά'
  })

  // Whit Monday (50 days after Easter)
  const whitMonday = new Date(easter)
  whitMonday.setDate(easter.getDate() + 50)
  holidays.push({
    date: whitMonday,
    name: 'Whit Monday',
    nameGreek: 'Αγίου Πνεύματος'
  })

  return holidays
}

/**
 * Check if a date falls within any school break
 */
export function isInSchoolBreak(date: Date, breaks: SchoolBreak[]): SchoolBreak | null {
  const dateTime = date.getTime()
  for (const breakPeriod of breaks) {
    if (dateTime >= breakPeriod.startDate.getTime() && dateTime <= breakPeriod.endDate.getTime()) {
      return breakPeriod
    }
  }
  return null
}

/**
 * Check if a date is a school holiday
 */
export function isSchoolHoliday(date: Date, holidays: SchoolHoliday[]): SchoolHoliday | null {
  const dateStr = date.toDateString()
  for (const holiday of holidays) {
    if (holiday.date.toDateString() === dateStr) {
      return holiday
    }
  }
  return null
}

/**
 * Calculate overlap between a date range and school breaks
 * Returns the number of days that overlap and which breaks are involved
 */
export function calculateSchoolOverlap(
  startDate: Date,
  endDate: Date,
  year: number
): {
  totalOverlapDays: number
  overlappingBreaks: { break: SchoolBreak; days: number }[]
  overlappingHolidays: SchoolHoliday[]
} {
  const breaks = getSchoolBreaks(year)
  const holidays = getSchoolHolidays(year)

  // Also check previous year's Christmas break (which ends in January of current year)
  if (startDate.getMonth() === 0) { // January
    const prevYearBreaks = getSchoolBreaks(year - 1)
    const christmasBreak = prevYearBreaks.find(b => b.id === 'christmas')
    if (christmasBreak) {
      breaks.push(christmasBreak)
    }
  }

  let totalOverlapDays = 0
  const overlappingBreaks: { break: SchoolBreak; days: number }[] = []
  const overlappingHolidays: SchoolHoliday[] = []

  // Check break overlaps
  for (const breakPeriod of breaks) {
    const overlapStart = Math.max(startDate.getTime(), breakPeriod.startDate.getTime())
    const overlapEnd = Math.min(endDate.getTime(), breakPeriod.endDate.getTime())

    if (overlapStart <= overlapEnd) {
      const days = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
      totalOverlapDays += days
      overlappingBreaks.push({ break: breakPeriod, days })
    }
  }

  // Check individual holiday overlaps
  for (const holiday of holidays) {
    const holidayTime = holiday.date.getTime()
    if (holidayTime >= startDate.getTime() && holidayTime <= endDate.getTime()) {
      // Only count if not already in a break period
      const inBreak = breaks.some(b =>
        holidayTime >= b.startDate.getTime() && holidayTime <= b.endDate.getTime()
      )
      if (!inBreak) {
        overlappingHolidays.push(holiday)
        totalOverlapDays += 1
      }
    }
  }

  return {
    totalOverlapDays,
    overlappingBreaks,
    overlappingHolidays
  }
}

/**
 * Get all school-free periods for display
 */
export function getSchoolCalendar(year: number): {
  breaks: SchoolBreak[]
  holidays: SchoolHoliday[]
} {
  return {
    breaks: getSchoolBreaks(year),
    holidays: getSchoolHolidays(year)
  }
}
