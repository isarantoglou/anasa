<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import { useGreekHolidays } from './composables/useGreekHolidays'
import { useLeaveOptimizer } from './composables/useLeaveOptimizer'
import { useAnnualPlan } from './composables/useAnnualPlan'
import { usePersistedBoolean, usePersistedNumber, usePersistedJson } from './composables/usePersistedState'
import {
  loadStateFromUrl,
  hasSharedState,
  clearUrlState,
  generateShareUrl,
  recalculateAppState,
  type AppState
} from './composables/useShareableState'
import { calculateSchoolOverlap, getSchoolBreaks, type SchoolBreak } from './data/schoolHolidays'
import type { CustomHoliday, OptimizationResult } from './types'

// Components
import OpportunityCard from './components/OpportunityCard.vue'
import SettingsCard from './components/SettingsCard.vue'
import CustomHolidaysCard from './components/CustomHolidaysCard.vue'
import PublicHolidaysCard from './components/PublicHolidaysCard.vue'
import AnnualPlanSection from './components/AnnualPlanSection.vue'
import HolidayTable from './components/HolidayTable.vue'
import ConflictWarningModal from './components/modals/ConflictWarningModal.vue'
import LeaveRequestModal from './components/modals/LeaveRequestModal.vue'
import YearComparisonModal from './components/modals/YearComparisonModal.vue'
import ShareCard from './components/modals/ShareCard.vue'
import AnnualPlanShareCard from './components/modals/AnnualPlanShareCard.vue'
import { version } from '../package.json'

// Persisted state (auto-syncs with localStorage)
const customHolidays = usePersistedJson<CustomHoliday[]>('custom-holidays', [])
const totalAnnualLeaveDays = usePersistedNumber('total-days', 25)
const parentMode = usePersistedBoolean('parent-mode', false)
const includeHolySpirit = usePersistedBoolean('holy-spirit', true)

// Dark mode needs special handling for system preference fallback
const isDarkMode = ref(false)

onMounted(() => {
  // Load dark mode with system preference fallback
  const stored = localStorage.getItem('anasa-dark-mode')
  if (stored !== null) {
    isDarkMode.value = stored === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateDarkModeClass()

  // Check for shared state in URL first
  checkForSharedState()

  // If we have shared state, apply it after a tick (to let holidays compute)
  if (pendingUrlState.value) {
    nextTick(() => {
      applySharedState()
    })
  } else {
    // Load annual plan from localStorage only if no shared state
    loadAnnualPlanFromStorage()
  }
})

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('anasa-dark-mode', String(isDarkMode.value))
  updateDarkModeClass()
}

function updateDarkModeClass() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Non-persisted reactive state
const currentYear = ref(new Date().getFullYear())
const searchLeaveDays = ref(5)
const maxResults = ref(100)
const sortByDate = ref(false)
const sortByFamily = ref(false)
const calculateFromToday = ref(true)

// Annual Plan (using composable)
const {
  annualPlan,
  conflictWarning,
  annualPlanTotalDays,
  remainingLeaveDays,
  loadFromStorage: loadAnnualPlanFromStorage,
  isInPlan,
  addToPlan,
  addCustomPeriod,
  addDirectToPlan,
  forceAddToPlan,
  dismissConflictWarning,
  removeFromPlan,
  clearPlan
} = useAnnualPlan(currentYear, totalAnnualLeaveDays)

// Use composables
const {
  orthodoxEaster,
  allHolidays,
  weekendHolidays
} = useGreekHolidays(currentYear, customHolidays, includeHolySpirit)

const {
  topOpportunities,
  stats,
  formatDateRange,
  effectiveStartDate
} = useLeaveOptimizer(currentYear, searchLeaveDays, allHolidays, maxResults, calculateFromToday)

// School breaks for current year
const schoolBreaks = computed(() => getSchoolBreaks(currentYear.value))

// Get school overlap info for an opportunity
function getSchoolOverlapInfo(opportunity: OptimizationResult): {
  totalOverlapDays: number
  overlappingBreaks: { break: SchoolBreak; days: number }[]
  hasOverlap: boolean
  primaryBreak: SchoolBreak | null
} {
  const overlap = calculateSchoolOverlap(
    opportunity.range.startDate,
    opportunity.range.endDate,
    currentYear.value
  )

  return {
    totalOverlapDays: overlap.totalOverlapDays,
    overlappingBreaks: overlap.overlappingBreaks,
    hasOverlap: overlap.totalOverlapDays > 0,
    primaryBreak: overlap.overlappingBreaks.length > 0 ? overlap.overlappingBreaks[0]!.break : null
  }
}

// Sorted opportunities
const sortedOpportunities = computed(() => {
  const opportunities = [...topOpportunities.value]

  if (sortByFamily.value && parentMode.value) {
    return opportunities.sort((a, b) => {
      const overlapA = getSchoolOverlapInfo(a).totalOverlapDays
      const overlapB = getSchoolOverlapInfo(b).totalOverlapDays
      if (overlapB !== overlapA) {
        return overlapB - overlapA
      }
      return b.efficiency - a.efficiency
    })
  }

  if (sortByDate.value) {
    return opportunities.sort((a, b) =>
      a.range.startDate.getTime() - b.range.startDate.getTime()
    )
  }

  return opportunities
})

// Check if we're calculating from today for current year
const showingFromToday = computed(() => {
  return calculateFromToday.value && currentYear.value === new Date().getFullYear()
})

// Format the effective start date
const effectiveStartLabel = computed(() => {
  if (effectiveStartDate.value) {
    return format(effectiveStartDate.value, 'd MMMM yyyy', { locale: el })
  }
  return '1 Ιανουαρίου'
})

// Custom holidays handlers
function addCustomHoliday(holiday: CustomHoliday) {
  customHolidays.value.push(holiday)
}

function removeCustomHoliday(id: string) {
  customHolidays.value = customHolidays.value.filter(h => h.id !== id)
}

// Export annual plan to .ics calendar file
function exportToCalendar() {
  if (annualPlan.value.length === 0) return

  const events = annualPlan.value.map(opp => {
    const startDate = format(opp.range.startDate, 'yyyyMMdd')
    const endDate = format(new Date(opp.range.endDate.getTime() + 86400000), 'yyyyMMdd')
    const uid = `${opp.id}@anasa.oxygen.gr`
    const description = `${opp.efficiencyLabel}\\n${opp.leaveDaysRequired} ημέρες άδειας → ${opp.totalDays} ημέρες ελεύθερες`

    return `BEGIN:VEVENT
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:Άδεια - ${opp.leaveDaysRequired} ημέρες
DESCRIPTION:${description}
UID:${uid}
END:VEVENT`
  }).join('\n')

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Anasa by Oxygen//Leave Optimizer//EL
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Άδειες ${currentYear.value}
${events}
END:VCALENDAR`

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `anasa-${currentYear.value}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

// Year Comparison Modal
const showYearComparison = ref(false)

function toggleYearComparison() {
  showYearComparison.value = !showYearComparison.value
}

// Leave Request Modal
const showLeaveRequest = ref(false)

// Share opportunity as image
const isGeneratingImage = ref(false)
const opportunityToShare = ref<OptimizationResult | null>(null)

// URL sharing state
const shareUrlCopied = ref(false)
const loadedFromUrl = ref(false)
const pendingUrlState = ref<AppState | null>(null)

// Check for shared state on mount
function checkForSharedState() {
  if (hasSharedState()) {
    const state = loadStateFromUrl()
    if (state) {
      pendingUrlState.value = state
    }
  }
}

// Apply shared state once holidays are ready
function applySharedState() {
  if (!pendingUrlState.value) return

  const state = pendingUrlState.value

  // Recalculate opportunities with current holidays
  const recalculated = recalculateAppState(state, allHolidays.value)

  // Apply state
  currentYear.value = recalculated.year
  includeHolySpirit.value = recalculated.includeHolySpirit
  parentMode.value = recalculated.parentMode
  totalAnnualLeaveDays.value = recalculated.totalAnnualLeaveDays

  // Replace custom holidays
  customHolidays.value = recalculated.customHolidays

  // Clear and replace annual plan
  clearPlan()
  for (const opp of recalculated.annualPlan) {
    addDirectToPlan(opp)
  }

  // Clear URL and show notification
  clearUrlState()
  loadedFromUrl.value = true
  pendingUrlState.value = null

  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    loadedFromUrl.value = false
  }, 5000)
}

// Generate shareable URL and copy to clipboard
async function copyShareUrl() {
  const state: AppState = {
    year: currentYear.value,
    includeHolySpirit: includeHolySpirit.value,
    parentMode: parentMode.value,
    totalAnnualLeaveDays: totalAnnualLeaveDays.value,
    customHolidays: customHolidays.value,
    annualPlan: annualPlan.value
  }

  const url = generateShareUrl(state)

  try {
    await navigator.clipboard.writeText(url)
    shareUrlCopied.value = true
    setTimeout(() => {
      shareUrlCopied.value = false
    }, 3000)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    shareUrlCopied.value = true
    setTimeout(() => {
      shareUrlCopied.value = false
    }, 3000)
  }
}

async function shareAsImage(opportunity: OptimizationResult) {
  opportunityToShare.value = opportunity
  isGeneratingImage.value = true

  await nextTick()

  const cardElement = document.getElementById('share-card')
  if (!cardElement) {
    isGeneratingImage.value = false
    return
  }

  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `anasa-${format(opportunity.range.startDate, 'yyyy-MM-dd')}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('Failed to generate image:', error)
  } finally {
    isGeneratingImage.value = false
    opportunityToShare.value = null
  }
}

// Share annual plan as image
async function shareAnnualPlanAsImage() {
  if (annualPlan.value.length === 0) return

  isGeneratingImage.value = true
  await nextTick()

  const cardElement = document.getElementById('annual-plan-share-card')
  if (!cardElement) {
    isGeneratingImage.value = false
    return
  }

  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `anasa-plan-${currentYear.value}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('Failed to generate annual plan image:', error)
  } finally {
    isGeneratingImage.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-marble-texture">
    <!-- Decorative wave background -->
    <div class="fixed inset-0 bg-waves pointer-events-none opacity-50"></div>

    <!-- Header -->
    <header class="relative bg-(--marble-white)/80 backdrop-blur-md border-b border-(--marble-200) top-0 z-50">
      <div class="max-w-350 mx-auto px-6 lg:px-8 py-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="animate-fade-in-up">
            <h1 class="heading-hero">
              <span class="text-(--aegean-800)">Ανάσα</span>
            </h1>
            <p class="mt-2 text-(--marble-500) text-lg font-body">
              Πάρε ανάσα από τη δουλειά
            </p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Easter Badge -->
            <div class="animate-fade-in-up delay-200 flex items-center gap-3 px-5 py-3 rounded-2xl bg-(--terracotta-100) border border-(--terracotta-200)">
              <div class="w-10 h-10 rounded-full bg-(--terracotta-500) flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-xs font-semibold text-(--terracotta-600) uppercase tracking-wider">Ορθόδοξο Πάσχα {{ currentYear }}</div>
                <div class="stat-number text-xl font-semibold text-(--terracotta-700)">
                  {{ format(orthodoxEaster, 'd MMMM', { locale: el }) }}
                </div>
              </div>
            </div>

            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="dark-mode-toggle"
              :aria-label="isDarkMode ? 'Αλλαγή σε φωτεινή λειτουργία' : 'Αλλαγή σε σκοτεινή λειτουργία'"
            >
              <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Decorative border -->
      <div class="greek-key-border"></div>
    </header>

    <main class="relative max-w-350 mx-auto px-6 lg:px-8 py-10">
      <!-- Configuration Section -->
      <section class="mb-12 animate-fade-in-up delay-100">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SettingsCard
            :current-year="currentYear"
            :calculate-from-today="calculateFromToday"
            :include-holy-spirit="includeHolySpirit"
            :parent-mode="parentMode"
            :total-annual-leave-days="totalAnnualLeaveDays"
            :search-leave-days="searchLeaveDays"
            :remaining-leave-days="remainingLeaveDays"
            :annual-plan-length="annualPlan.length"
            :showing-from-today="showingFromToday"
            :effective-start-label="effectiveStartLabel"
            :school-breaks="schoolBreaks"
            :stats="stats"
            @update:current-year="currentYear = $event"
            @update:calculate-from-today="calculateFromToday = $event"
            @update:include-holy-spirit="includeHolySpirit = $event"
            @update:parent-mode="parentMode = $event"
            @update:total-annual-leave-days="totalAnnualLeaveDays = $event"
            @update:search-leave-days="searchLeaveDays = $event"
            @toggle-year-comparison="toggleYearComparison"
          />

          <CustomHolidaysCard
            :custom-holidays="customHolidays"
            :current-year="currentYear"
            @add-holiday="addCustomHoliday"
            @remove-holiday="removeCustomHoliday"
          />

          <PublicHolidaysCard
            :current-year="currentYear"
            :all-holidays="allHolidays"
            :weekend-holidays="weekendHolidays"
          />
        </div>
      </section>

      <!-- Annual Plan Section -->
      <AnnualPlanSection
        :current-year="currentYear"
        :annual-plan="annualPlan"
        :annual-plan-total-days="annualPlanTotalDays"
        :remaining-leave-days="remainingLeaveDays"
        :format-date-range="formatDateRange"
        :holidays="allHolidays"
        @remove-from-plan="removeFromPlan"
        @clear-plan="clearPlan"
        @export-to-calendar="exportToCalendar"
        @show-leave-request="showLeaveRequest = true"
        @add-custom-period="addCustomPeriod"
        @share-url="copyShareUrl"
        @share-as-image="shareAnnualPlanAsImage"
      />

      <!-- Results Section -->
      <section class="mb-12 animate-fade-in-up delay-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 class="heading-section">Ευκαιρίες Άδειας</h2>
            <p class="text-(--marble-500) mt-1">
              {{ sortedOpportunities.length }} ευκαιρίες για {{ searchLeaveDays }} ημέρες άδειας
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-(--marble-500)">Ταξινόμηση:</span>
            <div class="toggle-switch-container">
              <button
                @click="sortByDate = false; sortByFamily = false"
                class="toggle-switch-option"
                :class="{ active: !sortByDate && !sortByFamily }"
              >
                Απόδοση
              </button>
              <button
                @click="sortByDate = true; sortByFamily = false"
                class="toggle-switch-option"
                :class="{ active: sortByDate && !sortByFamily }"
              >
                Ημερομηνία
              </button>
              <button
                v-if="parentMode"
                @click="sortByFamily = true; sortByDate = false"
                class="toggle-switch-option"
                :class="{ active: sortByFamily }"
              >
                Οικογένεια
              </button>
            </div>
          </div>
        </div>

        <div v-if="topOpportunities.length === 0" class="card-elevated p-12 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-(--marble-100) flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-(--marble-400)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-(--marble-500) text-lg">
            Δεν βρέθηκαν ευκαιρίες βελτιστοποίησης. Δοκιμάστε να προσαρμόσετε τις διαθέσιμες ημέρες άδειας.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <OpportunityCard
            v-for="(opportunity, index) in sortedOpportunities"
            :key="`${opportunity.range.startDate.getTime()}-${opportunity.range.endDate.getTime()}`"
            :opportunity="opportunity"
            :index="index"
            :sort-by-date="sortByDate"
            :parent-mode="parentMode"
            :is-in-plan="isInPlan(opportunity)"
            :is-generating-image="isGeneratingImage"
            :current-year="currentYear"
            @add-to-plan="addToPlan"
            @share-as-image="shareAsImage"
          />
        </div>
      </section>

      <!-- Full Holiday Table -->
      <HolidayTable
        :current-year="currentYear"
        :all-holidays="allHolidays"
      />
    </main>

    <!-- Modals -->
    <ConflictWarningModal
      :show="conflictWarning.show"
      :conflict-with="conflictWarning.conflictWith"
      :format-date-range="formatDateRange"
      @dismiss="dismissConflictWarning"
      @force-add="forceAddToPlan"
    />

    <LeaveRequestModal
      :show="showLeaveRequest"
      :annual-plan="annualPlan"
      :annual-plan-total-days="annualPlanTotalDays"
      :current-year="currentYear"
      @close="showLeaveRequest = false"
    />

    <YearComparisonModal
      :show="showYearComparison"
      :current-year="currentYear"
      :include-holy-spirit="includeHolySpirit"
      @close="showYearComparison = false"
    />

    <!-- Footer -->
    <footer class="relative mt-16 border-t border-(--marble-200) bg-(--marble-50)">
      <div class="greek-key-border"></div>
      <div class="max-w-350 mx-auto px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span class="font-display text-xl font-semibold text-(--aegean-800)">Ανάσα</span>
              <a
                href="https://github.com/isarantoglou/anasa/blob/master/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs px-1.5 py-0.5 rounded bg-(--marble-200) text-(--marble-500) hover:bg-(--aegean-100) hover:text-(--aegean-600) font-mono transition-colors"
              >v{{ version }}</a>
            </div>
            <p class="text-sm text-(--marble-500) mt-1">
              Υπολογισμός Ορθόδοξου Πάσχα με τον αλγόριθμο Meeus/Jones/Butcher
            </p>
          </div>

          <!-- Social Links -->
          <div class="flex items-center gap-4">
            <a href="https://www.facebook.com/pelatologio" target="_blank" rel="noopener noreferrer" class="text-(--marble-400) hover:text-(--aegean-600) transition-colors" aria-label="Facebook">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/oxygenpelatologio" target="_blank" rel="noopener noreferrer" class="text-(--marble-400) hover:text-(--terracotta-500) transition-colors" aria-label="Instagram">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/pelatologio/" target="_blank" rel="noopener noreferrer" class="text-(--marble-400) hover:text-(--aegean-600) transition-colors" aria-label="LinkedIn">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@oxygensuite" target="_blank" rel="noopener noreferrer" class="text-(--marble-400) hover:text-(--terracotta-500) transition-colors" aria-label="YouTube">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://github.com/isarantoglou/anasa" target="_blank" rel="noopener noreferrer" class="text-(--marble-400) hover:text-(--marble-700) transition-colors" aria-label="GitHub">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>

          <div class="flex items-center gap-3 text-sm text-(--marble-400)">
            <span>Φτιαγμένο με</span>
            <svg class="w-4 h-4 text-(--terracotta-500)" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>από την <a href="https://www.oxygen.gr" class="hover:text-(--aegean-600) transition-colors">Oxygen</a></span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Hidden Share Card for Image Generation -->
    <ShareCard
      :opportunity="opportunityToShare"
      :current-year="currentYear"
      :format-date-range="formatDateRange"
    />

    <!-- Hidden Annual Plan Share Card for Image Generation -->
    <AnnualPlanShareCard
      :annual-plan="annualPlan"
      :current-year="currentYear"
      :annual-plan-total-days="annualPlanTotalDays"
      :remaining-leave-days="remainingLeaveDays"
      :total-annual-leave-days="totalAnnualLeaveDays"
    />

    <!-- URL Loaded Notification -->
    <Transition name="slide-up">
      <div
        v-if="loadedFromUrl"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-(--aegean-600) text-white shadow-xl flex items-center gap-3"
      >
        <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-medium">Το κοινόχρηστο πλάνο φορτώθηκε επιτυχώς!</span>
        <button
          @click="loadedFromUrl = false"
          class="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- URL Copied Notification -->
    <Transition name="slide-up">
      <div
        v-if="shareUrlCopied"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-(--success-600) text-white shadow-xl flex items-center gap-3"
      >
        <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        <span class="font-medium">Ο σύνδεσμος αντιγράφηκε στο πρόχειρο!</span>
      </div>
    </Transition>
  </div>
</template>
