<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { OptimizationResult, DayInfo } from '../types'
import { calculateSchoolOverlap } from '../data/schoolHolidays'

const props = defineProps<{
  opportunity: OptimizationResult
  index: number
  sortByDate: boolean
  parentMode: boolean
  isInPlan: boolean
  isGeneratingImage: boolean
  currentYear: number
}>()

const emit = defineEmits<{
  addToPlan: [opportunity: OptimizationResult]
  shareAsImage: [opportunity: OptimizationResult]
}>()

// Format date range
function formatDateRange(range: { startDate: Date; endDate: Date }): string {
  const start = format(range.startDate, 'd MMM', { locale: el })
  const end = format(range.endDate, 'd MMM', { locale: el })
  return `${start} - ${end}`
}

// Get rank class for card header
function getRankClass(index: number): string {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-default'
}

// Get rank label
function getRankLabel(index: number): string {
  if (index === 0) return 'Καλύτερη Επιλογή'
  return `#${index + 1}`
}

// Get day styling class
function getDayClass(day: DayInfo): string {
  if (day.isHoliday) return 'day-holiday'
  if (day.isWeekend) return 'day-weekend'
  return 'day-workday'
}

// Get efficiency tooltip text
function getEfficiencyTooltip(efficiency: number, leaveDays: number, totalDays: number): string {
  return `${efficiency.toFixed(1)}x απόδοση: Για κάθε 1 ημέρα άδειας, παίρνετε ${efficiency.toFixed(1)} ημέρες ελεύθερες. Χρησιμοποιώντας ${leaveDays} ημέρ${leaveDays > 1 ? 'ες' : 'α'} άδειας παίρνετε ${totalDays} συνολικές ημέρες.`
}

// Get school overlap info for parent mode
const schoolOverlapInfo = computed(() => {
  const overlap = calculateSchoolOverlap(
    props.opportunity.range.startDate,
    props.opportunity.range.endDate,
    props.currentYear
  )

  return {
    totalOverlapDays: overlap.totalOverlapDays,
    overlappingBreaks: overlap.overlappingBreaks,
    hasOverlap: overlap.totalOverlapDays > 0,
    primaryBreak: overlap.overlappingBreaks.length > 0 ? overlap.overlappingBreaks[0]!.break : null,
  }
})
</script>

<template>
  <div class="card-elevated group flex flex-col overflow-hidden">
    <!-- Card Header with Rank -->
    <div class="px-6 py-5 text-white" :class="sortByDate ? 'rank-default' : getRankClass(index)">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold tracking-wider text-white/70 uppercase">
            {{
              sortByDate
                ? format(opportunity.range.startDate, 'MMMM', { locale: el })
                : getRankLabel(index)
            }}
          </span>
          <p class="mt-1 text-xl font-semibold">
            {{ formatDateRange(opportunity.range) }}
          </p>
        </div>
        <!-- Efficiency Badge with Tooltip -->
        <div class="tooltip-container">
          <div
            class="stat-number cursor-help rounded-xl bg-white/20 px-4 py-2 text-sm font-bold text-white"
          >
            {{ opportunity.efficiency.toFixed(1) }}x
          </div>
          <div class="tooltip">
            {{
              getEfficiencyTooltip(
                opportunity.efficiency,
                opportunity.leaveDaysRequired,
                opportunity.totalDays
              )
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex flex-1 flex-col p-6">
      <!-- Key Stats -->
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div class="rounded-xl bg-(--warning-100) p-3 text-center">
          <div class="stat-number text-2xl font-bold text-(--warning-700)">
            {{ opportunity.leaveDaysRequired }}
          </div>
          <div class="mt-1 text-[10px] font-semibold tracking-wider text-(--warning-700) uppercase">
            Άδεια
          </div>
        </div>
        <div class="rounded-xl bg-(--success-100) p-3 text-center">
          <div class="stat-number text-2xl font-bold text-(--success-700)">
            {{ opportunity.totalDays }}
          </div>
          <div class="mt-1 text-[10px] font-semibold tracking-wider text-(--success-700) uppercase">
            Σύνολο
          </div>
        </div>
        <div class="rounded-xl bg-(--aegean-100) p-3 text-center">
          <div class="stat-number text-2xl font-bold text-(--aegean-700)">
            {{ opportunity.freeDays }}
          </div>
          <div class="mt-1 text-[10px] font-semibold tracking-wider text-(--aegean-700) uppercase">
            Δωρεάν
          </div>
        </div>
      </div>

      <!-- Efficiency Label -->
      <div class="rounded-xl border border-(--marble-200) bg-(--marble-100) px-4 py-3 text-center">
        <span class="text-lg font-semibold text-(--aegean-800)">
          {{ opportunity.efficiencyLabel }}
        </span>
      </div>

      <!-- School Break Badge (Parent Mode) -->
      <div
        v-if="parentMode && schoolOverlapInfo.hasOverlap"
        class="from-(#FDF2F8) to-(#FCE7F3) border-(#FBCFE8) mt-4 rounded-xl border bg-linear-to-r p-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ schoolOverlapInfo.primaryBreak?.icon }}</span>
            <div>
              <span class="text-(#BE185D) text-sm font-semibold">
                {{ schoolOverlapInfo.primaryBreak?.nameGreek }}
              </span>
              <p class="text-(#9D174D) text-xs">
                {{ schoolOverlapInfo.totalOverlapDays }} ημέρες με τα παιδιά
              </p>
            </div>
          </div>
          <div class="text-2xl">👨‍👩‍👧</div>
        </div>
      </div>

      <!-- Day Timeline -->
      <div class="mt-6 border-t border-(--marble-200) pt-6">
        <h4 class="mb-4 text-xs font-semibold tracking-wider text-(--marble-500) uppercase">
          Ανάλυση Ημερών
        </h4>
        <div class="flex flex-wrap gap-1.5">
          <div
            v-for="(day, dayIndex) in opportunity.days"
            :key="dayIndex"
            :title="day.holidayName || format(day.date, 'EEEE, d MMMM', { locale: el })"
            class="day-indicator cursor-default"
            :class="getDayClass(day)"
          >
            {{ format(day.date, 'd') }}
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex flex-wrap gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="day-workday h-4 w-4 rounded"></div>
            <span class="text-(--marble-500)">Εργάσιμη</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="day-weekend h-4 w-4 rounded"></div>
            <span class="text-(--marble-500)">Σ/Κ</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="day-holiday h-4 w-4 rounded"></div>
            <span class="text-(--marble-500)">Αργία</span>
          </div>
        </div>
      </div>

      <!-- Spacer to push buttons down -->
      <div class="min-h-6 flex-1"></div>

      <!-- Action Buttons -->
      <div class="mt-auto flex items-stretch gap-3 border-t border-(--marble-200) pt-6">
        <button
          v-if="!isInPlan"
          @click="emit('addToPlan', opportunity)"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--aegean-600) px-4 py-3 font-semibold text-white transition-colors hover:bg-(--aegean-700)"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Προσθήκη στο Πλάνο
        </button>
        <button
          v-else
          class="flex flex-1 cursor-default items-center justify-center gap-2 rounded-xl bg-(--success-100) px-4 py-3 font-semibold text-(--success-700)"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Στο Πλάνο
        </button>
        <button
          @click="emit('shareAsImage', opportunity)"
          :disabled="isGeneratingImage"
          class="flex items-center justify-center rounded-xl border-2 border-(--marble-200) px-4 font-semibold text-(--marble-600) transition-colors hover:border-(--aegean-300) hover:text-(--aegean-600) disabled:opacity-50"
        >
          <svg
            v-if="!isGeneratingImage"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
