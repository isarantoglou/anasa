/**
 * Label Utilities
 *
 * Shared utilities for generating Greek labels used across the app.
 */

/**
 * Generate efficiency label in Greek
 * Shows how many leave days are needed for how many total days off
 *
 * @param leaveDays - Number of leave days required
 * @param totalDays - Total days off (including weekends/holidays)
 * @returns Greek label string
 */
export function getEfficiencyLabel(leaveDays: number, totalDays: number): string {
  if (leaveDays === 0) return `${totalDays} δωρεάν ημέρες`
  return `Κάντε ${leaveDays} ημέρ${leaveDays > 1 ? 'ες' : 'α'} ${totalDays}`
}
