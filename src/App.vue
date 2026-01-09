<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import { useGreekHolidays } from './composables/useGreekHolidays'
import { useLeaveOptimizer } from './composables/useLeaveOptimizer'
import { useAnnualPlan } from './composables/useAnnualPlan'
import { usePersistedBoolean, usePersistedNumber, usePersistedJson } from './composables/usePersistedState'
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

  // Load annual plan from localStorage
  loadAnnualPlanFromStorage()
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
  showAnnualPlan,
  conflictWarning,
  annualPlanTotalDays,
  remainingLeaveDays,
  loadFromStorage: loadAnnualPlanFromStorage,
  isInPlan,
  addToPlan,
  addCustomPeriod,
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
        v-if="annualPlan.length > 0 || showAnnualPlan"
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
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-center md:text-left">
            <span class="font-display text-xl font-semibold text-(--aegean-800)">Ανάσα</span>
            <p class="text-sm text-(--marble-500) mt-1">
              Υπολογισμός Ορθόδοξου Πάσχα με τον αλγόριθμο Meeus/Jones/Butcher
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm text-(--marble-400)">
            <span>Φτιαγμένο με</span>
            <svg class="w-4 h-4 text-(--terracotta-500)" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>από την <a href="https://www.oxygen.gr">Oxygen</a></span>
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
  </div>
</template>
