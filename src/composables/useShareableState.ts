/**
 * useShareableState Composable
 *
 * Provides URL-based state sharing using LZ-String compression.
 * Enables users to share their leave plan setup via URL.
 */

import LZString from 'lz-string'
import type { CustomHoliday, SavedOpportunity, Holiday } from '../types'
import { createCustomPeriod } from './useCustomPeriod'

/** Version number for the shareable state format */
const STATE_VERSION = 1

/** URL parameter name for the shared state */
const URL_PARAM = 's'

/**
 * Minimal shareable state format (compressed to URL)
 * Uses short keys to minimize URL length
 */
interface ShareableState {
  v: number              // Version
  y: number              // Year
  h: boolean             // Include Holy Spirit
  p: boolean             // Parent mode
  t: number              // Total annual leave days
  c: [string, string][]  // Custom holidays: [date, name][]
  a: ShareablePlan[]     // Annual plan items
}

/**
 * Minimal plan item format
 * [startDate, endDate, label?, isCustom?]
 */
type ShareablePlan = [string, string] | [string, string, string] | [string, string, string, boolean]

/**
 * Full app state that can be shared
 */
export interface AppState {
  year: number
  includeHolySpirit: boolean
  parentMode: boolean
  totalAnnualLeaveDays: number
  customHolidays: CustomHoliday[]
  annualPlan: SavedOpportunity[]
}

/**
 * Result of loading state from URL
 */
export interface LoadedState extends AppState {
  isFromUrl: boolean
}

/**
 * Encode app state to a compressed URL-safe string
 */
export function encodeState(state: AppState): string {
  const shareable: ShareableState = {
    v: STATE_VERSION,
    y: state.year,
    h: state.includeHolySpirit,
    p: state.parentMode,
    t: state.totalAnnualLeaveDays,
    c: state.customHolidays.map(h => [h.date, h.name]),
    a: state.annualPlan.map(opp => {
      const startDate = formatDateCompact(opp.range.startDate)
      const endDate = formatDateCompact(opp.range.endDate)

      // Only include label and isCustom if they exist
      if (opp.label && opp.isCustom) {
        return [startDate, endDate, opp.label, true]
      } else if (opp.label) {
        return [startDate, endDate, opp.label]
      } else if (opp.isCustom) {
        return [startDate, endDate, '', true]
      }
      return [startDate, endDate]
    })
  }

  const json = JSON.stringify(shareable)
  return LZString.compressToEncodedURIComponent(json)
}

/**
 * Decode a compressed URL-safe string back to app state
 * Returns null if decoding fails
 */
export function decodeState(encoded: string): AppState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null

    const shareable: ShareableState = JSON.parse(json)

    // Version check for future compatibility
    if (shareable.v !== STATE_VERSION) {
      console.warn(`State version mismatch: expected ${STATE_VERSION}, got ${shareable.v}`)
      // For now, try to load anyway - future versions might need migration
    }

    // Validate required fields
    if (typeof shareable.y !== 'number' ||
        typeof shareable.h !== 'boolean' ||
        typeof shareable.p !== 'boolean' ||
        typeof shareable.t !== 'number') {
      return null
    }

    return {
      year: shareable.y,
      includeHolySpirit: shareable.h,
      parentMode: shareable.p,
      totalAnnualLeaveDays: shareable.t,
      customHolidays: (shareable.c || []).map(([date, name], index) => ({
        id: `shared-${index}-${Date.now()}`,
        date,
        name
      })),
      annualPlan: (shareable.a || []).map((item, index) =>
        createOpportunityFromShared(item, index, shareable.y)
      )
    }
  } catch (error) {
    console.error('Failed to decode shared state:', error)
    return null
  }
}

/**
 * Generate a shareable URL for the given state
 */
export function generateShareUrl(state: AppState): string {
  const encoded = encodeState(state)
  const url = new URL(window.location.href)
  url.search = '' // Clear existing params
  url.searchParams.set(URL_PARAM, encoded)
  return url.toString()
}

/**
 * Load state from URL if present
 * Returns null if no shared state in URL
 */
export function loadStateFromUrl(): AppState | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get(URL_PARAM)

  if (!encoded) return null

  return decodeState(encoded)
}

/**
 * Check if URL contains shared state
 */
export function hasSharedState(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has(URL_PARAM)
}

/**
 * Clear the shared state from URL without page reload
 */
export function clearUrlState(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(URL_PARAM)
  window.history.replaceState({}, '', url.toString())
}

/**
 * Format date as compact YYYY-MM-DD string
 */
function formatDateCompact(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse compact date string to Date object
 */
function parseDateCompact(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year!, month! - 1, day)
}

/**
 * Create a SavedOpportunity from shared plan item
 * Note: days array will be empty - it needs to be recalculated by the app
 */
function createOpportunityFromShared(
  item: ShareablePlan,
  index: number,
  _year: number
): SavedOpportunity {
  const [startDateStr, endDateStr, label, isCustom] = item
  const startDate = parseDateCompact(startDateStr)
  const endDate = parseDateCompact(endDateStr)

  // Calculate basic properties from dates
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return {
    id: `shared-${index}-${Date.now()}`,
    range: { startDate, endDate },
    totalDays,
    leaveDaysRequired: 0, // Will be recalculated
    freeDays: 0,          // Will be recalculated
    efficiency: 0,        // Will be recalculated
    efficiencyLabel: '',  // Will be recalculated
    days: [],             // Will be recalculated
    addedAt: new Date().toISOString(),
    isCustom: isCustom || false,
    label: label || undefined
  }
}

/**
 * Recalculate a SavedOpportunity's properties using holidays
 * This is needed after loading from URL since we don't share the days array
 */
export function recalculateOpportunity(
  opportunity: SavedOpportunity,
  holidays: Holiday[]
): SavedOpportunity {
  const result = createCustomPeriod(
    opportunity.range.startDate,
    opportunity.range.endDate,
    holidays
  )

  return {
    ...opportunity,
    totalDays: result.totalDays,
    leaveDaysRequired: result.leaveDaysRequired,
    freeDays: result.freeDays,
    efficiency: result.efficiency,
    efficiencyLabel: result.efficiencyLabel,
    days: result.days
  }
}

/**
 * Recalculate all opportunities in an AppState
 */
export function recalculateAppState(
  state: AppState,
  holidays: Holiday[]
): AppState {
  return {
    ...state,
    annualPlan: state.annualPlan.map(opp => recalculateOpportunity(opp, holidays))
  }
}

/**
 * Composable for managing shareable state
 */
export function useShareableState() {
  return {
    encodeState,
    decodeState,
    generateShareUrl,
    loadStateFromUrl,
    hasSharedState,
    clearUrlState,
    recalculateOpportunity,
    recalculateAppState
  }
}
