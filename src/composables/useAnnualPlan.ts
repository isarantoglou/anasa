import { ref, computed, watch, type Ref } from 'vue'
import type { SavedOpportunity, OptimizationResult } from '../types'

export interface ConflictWarning {
  show: boolean
  conflictWith: SavedOpportunity | null
  pendingOpportunity: OptimizationResult | null
  isCustom?: boolean // Track if pending opportunity is custom
  pendingLabel?: string // Label for custom periods
}

export function useAnnualPlan(currentYear: Ref<number>, totalAnnualLeaveDays: Ref<number>) {
  // State
  const annualPlan = ref<SavedOpportunity[]>([])
  const showAnnualPlan = ref(false)
  const conflictWarning = ref<ConflictWarning>({
    show: false,
    conflictWith: null,
    pendingOpportunity: null,
    isCustom: false,
    pendingLabel: '',
  })

  // Computed
  const annualPlanTotalDays = computed(() => {
    return annualPlan.value.reduce((sum, opp) => sum + opp.leaveDaysRequired, 0)
  })

  const remainingLeaveDays = computed(() => {
    return totalAnnualLeaveDays.value - annualPlanTotalDays.value
  })

  // Persistence
  watch(
    annualPlan,
    (plan) => {
      const planData = {
        year: currentYear.value,
        opportunities: plan,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem('anasa-annual-plan', JSON.stringify(planData))
    },
    { deep: true }
  )

  // Load from localStorage
  function loadFromStorage() {
    const storedPlan = localStorage.getItem('anasa-annual-plan')
    if (storedPlan) {
      try {
        const planData = JSON.parse(storedPlan)
        // Only load if it's for the current year
        if (planData.year === currentYear.value) {
          // Restore Date objects from ISO strings
          annualPlan.value = planData.opportunities.map((opp: SavedOpportunity) => ({
            ...opp,
            range: {
              startDate: new Date(opp.range.startDate),
              endDate: new Date(opp.range.endDate),
            },
            days: opp.days.map((day) => ({
              ...day,
              date: new Date(day.date),
            })),
          }))
          if (annualPlan.value.length > 0) {
            showAnnualPlan.value = true
          }
        }
      } catch (e) {
        console.error('Failed to parse stored annual plan:', e)
      }
    }
  }

  // Check if opportunity is already in plan
  function isInPlan(opportunity: OptimizationResult): boolean {
    return annualPlan.value.some(
      (saved) =>
        saved.range.startDate.getTime() === opportunity.range.startDate.getTime() &&
        saved.range.endDate.getTime() === opportunity.range.endDate.getTime()
    )
  }

  // Check if opportunity conflicts with existing plan periods
  function hasConflict(opportunity: OptimizationResult): SavedOpportunity | null {
    for (const saved of annualPlan.value) {
      const newStart = opportunity.range.startDate.getTime()
      const newEnd = opportunity.range.endDate.getTime()
      const savedStart = saved.range.startDate.getTime()
      const savedEnd = saved.range.endDate.getTime()

      // Check for overlap
      if (newStart <= savedEnd && newEnd >= savedStart) {
        return saved
      }
    }
    return null
  }

  // Add opportunity to plan (internal, no conflict check)
  function addToPlanConfirmed(opportunity: OptimizationResult, isCustom = false, label = '') {
    const saved: SavedOpportunity = {
      id: crypto.randomUUID(),
      range: opportunity.range,
      totalDays: opportunity.totalDays,
      leaveDaysRequired: opportunity.leaveDaysRequired,
      freeDays: opportunity.freeDays,
      efficiency: opportunity.efficiency,
      efficiencyLabel: opportunity.efficiencyLabel,
      days: opportunity.days,
      addedAt: new Date().toISOString(),
      ...(isCustom && { isCustom: true }),
      ...(label && { label }),
    }
    annualPlan.value.push(saved)
    showAnnualPlan.value = true
    dismissConflictWarning()
  }

  // Add opportunity to annual plan (with conflict detection)
  function addToPlan(opportunity: OptimizationResult) {
    if (isInPlan(opportunity)) return

    const conflict = hasConflict(opportunity)
    if (conflict) {
      conflictWarning.value = {
        show: true,
        conflictWith: conflict,
        pendingOpportunity: opportunity,
      }
      return
    }

    addToPlanConfirmed(opportunity)
  }

  // Add custom period to annual plan (with conflict detection)
  function addCustomPeriod(opportunity: OptimizationResult, label = '') {
    if (isInPlan(opportunity)) return

    const conflict = hasConflict(opportunity)
    if (conflict) {
      conflictWarning.value = {
        show: true,
        conflictWith: conflict,
        pendingOpportunity: opportunity,
        isCustom: true,
        pendingLabel: label,
      }
      return
    }

    addToPlanConfirmed(opportunity, true, label)
  }

  // Force add despite conflict
  function forceAddToPlan() {
    if (conflictWarning.value.pendingOpportunity) {
      addToPlanConfirmed(
        conflictWarning.value.pendingOpportunity,
        conflictWarning.value.isCustom ?? false,
        conflictWarning.value.pendingLabel ?? ''
      )
    }
  }

  // Dismiss conflict warning
  function dismissConflictWarning() {
    conflictWarning.value = {
      show: false,
      conflictWith: null,
      pendingOpportunity: null,
      isCustom: false,
      pendingLabel: '',
    }
  }

  // Remove opportunity from annual plan
  function removeFromPlan(id: string) {
    annualPlan.value = annualPlan.value.filter((opp) => opp.id !== id)
  }

  // Clear entire annual plan
  function clearPlan() {
    annualPlan.value = []
  }

  // Direct add without conflict check (for URL loading)
  function addDirectToPlan(opportunity: SavedOpportunity) {
    annualPlan.value.push(opportunity)
    showAnnualPlan.value = true
  }

  return {
    // State
    annualPlan,
    showAnnualPlan,
    conflictWarning,

    // Computed
    annualPlanTotalDays,
    remainingLeaveDays,

    // Methods
    loadFromStorage,
    isInPlan,
    hasConflict,
    addToPlan,
    addCustomPeriod,
    addDirectToPlan,
    forceAddToPlan,
    dismissConflictWarning,
    removeFromPlan,
    clearPlan,
  }
}
