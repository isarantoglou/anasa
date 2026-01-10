/**
 * Greek Holiday Leave Optimizer - Type Definitions
 */

/** Represents a single holiday */
export interface Holiday {
  date: Date
  name: string
  nameGreek: string
  isMovable: boolean // True for Easter-dependent holidays
  isCustom: boolean // True for user-added holidays
}

/** Represents a date range for leave periods */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/** Represents a single day in the calendar with cost information */
export interface DayInfo {
  date: Date
  cost: 0 | 1 // 0 = free (weekend/holiday), 1 = workday
  isHoliday: boolean
  isWeekend: boolean
  holidayName?: string
}

/** Result of the leave optimization algorithm */
export interface OptimizationResult {
  range: DateRange
  totalDays: number // Total days in the period
  leaveDaysRequired: number // Workdays that cost leave
  freeDays: number // Weekends + holidays
  efficiency: number // totalDays / leaveDaysRequired
  efficiencyLabel: string // e.g., "Turn 3 days into 9"
  days: DayInfo[] // All days in the range
}

/** Custom holiday input from user */
export interface CustomHoliday {
  id: string
  name: string
  date: string // ISO date string - for one-time holidays, or calculated date for display
  isRecurring?: boolean // True for patron saints that recur every year
  recurringDate?: string // MM-DD format for recurring holidays (e.g., "10-26")
  isMovable?: boolean // True if Easter-dependent (e.g., Ζωοδόχος Πηγή)
  easterOffset?: number // Days from Easter for movable feasts (e.g., 5 for Ζωοδόχος Πηγή)
  movesIfBeforeEaster?: boolean // True for saints like St. George (April 23) that move to Easter Monday if their date falls before Easter
}

/** Configuration for the optimizer */
export interface OptimizerConfig {
  year: number
  availableLeaveDays: number
  customHolidays: CustomHoliday[]
}

/** Saved opportunity in the annual plan */
export interface SavedOpportunity {
  id: string
  range: DateRange
  totalDays: number
  leaveDaysRequired: number
  freeDays: number
  efficiency: number
  efficiencyLabel: string
  days: DayInfo[]
  addedAt: string // ISO date string
  isCustom?: boolean // True for manually added periods
  label?: string // Optional description for custom periods (e.g., "Ταξίδι στην Αμερική")
}

/** Annual leave plan */
export interface AnnualPlan {
  year: number
  opportunities: SavedOpportunity[]
  totalLeaveDays: number
  updatedAt: string
}
