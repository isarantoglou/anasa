<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { SchoolBreak } from '../data/schoolHolidays'

const props = defineProps<{
  currentYear: number
  calculateFromToday: boolean
  includeHolySpirit: boolean
  parentMode: boolean
  totalAnnualLeaveDays: number
  searchLeaveDays: number
  remainingLeaveDays: number
  annualPlanLength: number
  showingFromToday: boolean
  effectiveStartLabel: string
  schoolBreaks: SchoolBreak[]
  stats: {
    workdays: number
    weekendDays: number
    holidayDays: number
    freeDays: number
  }
}>()

const emit = defineEmits<{
  'update:currentYear': [value: number]
  'update:calculateFromToday': [value: boolean]
  'update:includeHolySpirit': [value: boolean]
  'update:parentMode': [value: boolean]
  'update:totalAnnualLeaveDays': [value: number]
  'update:searchLeaveDays': [value: number]
  'toggle-year-comparison': []
}>()

// Extended year range for carousel effect (7 years for smooth scrolling)
const yearRange = computed(() => {
  const years: number[] = []
  for (let y = props.currentYear - 3; y <= props.currentYear + 3; y++) {
    years.push(y)
  }
  return years
})

// Simple year selection
const selectYear = (year: number) => {
  if (year !== props.currentYear) {
    emit('update:currentYear', year)
  }
}

// Navigate using arrow buttons
const navigateYear = (direction: 'prev' | 'next') => {
  emit('update:currentYear', props.currentYear + (direction === 'prev' ? -1 : 1))
}

// Sliding indicator animation
const indicatorTransform = ref('')
const indicatorTransition = ref('none')

watch(() => props.currentYear, (newYear, oldYear) => {
  if (newYear === oldYear) return

  // Calculate direction: positive = moved right (clicked a year to the right)
  const diff = newYear - oldYear
  // Start offset in opposite direction (e.g., if moved right, start from left)
  const offsetPx = diff * -44 // Approximate button width + gap

  // Disable transition, jump to offset position
  indicatorTransition.value = 'none'
  indicatorTransform.value = `translateX(${offsetPx}px)`

  // After a frame, enable transition and animate to center
  nextTick(() => {
    requestAnimationFrame(() => {
      indicatorTransition.value = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      indicatorTransform.value = 'translateX(0)'
    })
  })
})

// Computed: warning when search days exceed remaining
const searchExceedsRemaining = computed(() => {
  return props.searchLeaveDays > props.remainingLeaveDays && props.annualPlanLength > 0
})
</script>

<template>
  <div class="card-elevated p-4 sm:p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-(--aegean-600) flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 class="heading-card">Ρυθμίσεις</h2>
    </div>

    <div class="space-y-6">
      <!-- Year Picker - Centered Selection -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-semibold text-(--marble-600)">
            Επιλογή Έτους
          </label>
          <button
            @click="emit('toggle-year-comparison')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--aegean-200) bg-(--aegean-50) text-xs font-semibold text-(--aegean-700) hover:bg-(--aegean-100) hover:border-(--aegean-300) transition-all shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Σύγκριση
          </button>
        </div>
        <!-- Year Carousel -->
        <div class="flex items-center gap-2">
          <!-- Previous button -->
          <button
            @click="navigateYear('prev')"
            class="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-(--aegean-50) border border-(--aegean-200) flex items-center justify-center hover:bg-(--aegean-100) hover:border-(--aegean-300) transition-all active:scale-95"
            aria-label="Προηγούμενο έτος"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-(--aegean-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Year strip with fade edges -->
          <div class="relative flex-1 overflow-hidden">
            <!-- Gradient fade on left -->
            <div class="absolute left-0 top-0 bottom-0 w-6 sm:w-8 year-carousel-fade-left z-20 pointer-events-none"></div>
            <!-- Gradient fade on right -->
            <div class="absolute right-0 top-0 bottom-0 w-6 sm:w-8 year-carousel-fade-right z-20 pointer-events-none"></div>

            <!-- Year buttons container -->
            <div class="relative flex items-center justify-center gap-1 py-1.5">
              <!-- Sliding indicator (behind buttons) -->
              <div
                class="year-indicator"
                :style="{
                  transform: `translateX(-50%) translateY(-50%) ${indicatorTransform}`,
                  transition: indicatorTransition
                }"
              ></div>
              <!-- Year buttons -->
              <button
                v-for="(year, index) in yearRange"
                :key="year"
                @click="selectYear(year)"
                class="px-2 sm:px-3 py-1.5 text-sm font-semibold rounded-lg stat-number whitespace-nowrap shrink-0 transition-colors duration-200"
                :class="index === 3
                  ? 'text-white z-10'
                  : 'text-(--marble-400) hover:text-(--marble-600)'"
              >
                {{ year }}
              </button>
            </div>
          </div>

          <!-- Next button -->
          <button
            @click="navigateYear('next')"
            class="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-(--aegean-50) border border-(--aegean-200) flex items-center justify-center hover:bg-(--aegean-100) hover:border-(--aegean-300) transition-all active:scale-95"
            aria-label="Επόμενο έτος"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-(--aegean-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Calculate From Toggle -->
      <div>
        <label class="block text-sm font-semibold text-(--marble-600) mb-3">
          Υπολογισμός Από
        </label>
        <div class="toggle-switch-container">
          <button
            @click="emit('update:calculateFromToday', true)"
            class="toggle-switch-option"
            :class="{ active: calculateFromToday }"
          >
            Σήμερα
          </button>
          <button
            @click="emit('update:calculateFromToday', false)"
            class="toggle-switch-option"
            :class="{ active: !calculateFromToday }"
          >
            1 Ιανουαρίου
          </button>
        </div>
        <p v-if="showingFromToday" class="text-xs text-(--marble-500) mt-2">
          Εμφάνιση ευκαιριών από {{ effectiveStartLabel }}
        </p>
      </div>

      <!-- Holy Spirit Holiday Toggle -->
      <div>
        <div class="flex items-center justify-between">
          <label class="block text-sm font-semibold text-(--marble-600)">
            Αγίου Πνεύματος
          </label>
          <button
            @click="emit('update:includeHolySpirit', !includeHolySpirit)"
            class="relative inline-flex h-7 w-12 sm:h-6 sm:w-11 items-center rounded-full transition-colors"
            :class="includeHolySpirit ? 'bg-(--aegean-600)' : 'bg-(--marble-300)'"
          >
            <span
              class="inline-block h-5 w-5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform"
              :class="includeHolySpirit ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        <p class="text-xs text-(--marble-500) mt-2">
          {{ includeHolySpirit ? 'Η εταιρεία σας δίνει αργία' : 'Η εταιρεία σας ΔΕΝ δίνει αργία' }}
        </p>
      </div>

      <!-- Parent Mode Toggle -->
      <div>
        <div class="flex items-center justify-between">
          <label class="block text-sm font-semibold text-(--marble-600)">
            Λειτουργία Γονέα
          </label>
          <button
            @click="emit('update:parentMode', !parentMode)"
            class="relative inline-flex h-7 w-12 sm:h-6 sm:w-11 items-center rounded-full transition-colors"
            :class="parentMode ? 'bg-(--aegean-600)' : 'bg-(--marble-300)'"
          >
            <span
              class="inline-block h-5 w-5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform"
              :class="parentMode ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        <p class="text-xs text-(--marble-500) mt-2">
          {{ parentMode ? 'Εμφάνιση ευκαιριών κατά τις σχολικές διακοπές' : 'Ενεργοποιήστε για οικογενειακό προγραμματισμό' }}
        </p>
        <!-- School Breaks Info (when parent mode enabled) -->
        <div v-if="parentMode" class="mt-3 space-y-2">
          <div
            v-for="schoolBreak in schoolBreaks"
            :key="schoolBreak.id"
            class="flex items-center justify-between p-2 rounded-lg bg-(--marble-100) border border-(--marble-200)"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ schoolBreak.icon }}</span>
              <span class="text-sm font-medium text-(--marble-700)">{{ schoolBreak.nameGreek }}</span>
            </div>
            <span class="text-xs text-(--marble-500)">
              {{ format(schoolBreak.startDate, 'd MMM', { locale: el }) }} - {{ format(schoolBreak.endDate, 'd MMM', { locale: el }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Total Annual Leave Days -->
      <div>
        <label for="totalLeaveDays" class="block text-sm font-semibold text-(--marble-600) mb-2">
          Συνολικές Ημέρες Άδειας
        </label>
        <p class="text-xs text-(--marble-500) mb-3">Οι ημέρες άδειας που δικαιούστε ετησίως</p>
        <div class="flex items-center gap-3">
          <input
            id="totalLeaveDays"
            :value="totalAnnualLeaveDays"
            @input="emit('update:totalAnnualLeaveDays', Number(($event.target as HTMLInputElement).value))"
            type="number"
            min="1"
            max="50"
            class="input-elegant text-center stat-number text-xl font-semibold text-(--aegean-700) flex-1"
          />
          <div class="flex gap-1">
            <button
              v-for="days in [20, 25, 30]"
              :key="days"
              @click="emit('update:totalAnnualLeaveDays', days)"
              class="px-3 py-2 text-sm font-semibold rounded-lg transition-all"
              :class="totalAnnualLeaveDays === days
                ? 'bg-(--aegean-600) text-white shadow-md'
                : 'bg-(--marble-100) text-(--marble-600) hover:bg-(--marble-200)'"
            >
              {{ days }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search Leave Days -->
      <div>
        <label for="searchDays" class="block text-sm font-semibold text-(--marble-600) mb-2">
          Αναζήτηση με Ημέρες
        </label>
        <p class="text-xs text-(--marble-500) mb-3">Πόσες ημέρες θέλετε να χρησιμοποιήσετε;</p>
        <input
          id="searchDays"
          :value="searchLeaveDays"
          @input="emit('update:searchLeaveDays', Number(($event.target as HTMLInputElement).value))"
          type="number"
          min="1"
          max="30"
          class="input-elegant text-center stat-number text-2xl font-semibold text-(--aegean-700)"
        />
        <div class="flex gap-2 mt-3">
          <button
            v-for="days in [3, 5, 10, 15]"
            :key="days"
            @click="emit('update:searchLeaveDays', days)"
            class="flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="searchLeaveDays === days
              ? 'bg-(--aegean-600) text-white shadow-md'
              : 'bg-(--marble-100) text-(--marble-600) hover:bg-(--marble-200)'"
          >
            {{ days }}
          </button>
        </div>
        <!-- Warning when search exceeds remaining -->
        <div v-if="searchExceedsRemaining" class="mt-3 p-3 rounded-lg bg-(--warning-100) border border-(--warning-300)">
          <div class="flex items-center gap-2 text-(--warning-700)">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm font-medium">Αναζητάτε {{ searchLeaveDays }} ημέρες αλλά έχετε μόνο {{ remainingLeaveDays }} διαθέσιμες</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Year Stats -->
    <div class="mt-8 pt-6 border-t border-(--marble-200)">
      <h3 class="text-sm font-semibold text-(--marble-500) uppercase tracking-wider mb-4">
        {{ showingFromToday ? 'Υπόλοιπο ' + currentYear : 'Επισκόπηση Έτους' }}
      </h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div class="p-3 sm:p-4 rounded-xl bg-(--marble-100) border border-(--marble-200)">
          <div class="text-[10px] sm:text-xs font-semibold text-(--marble-500) uppercase tracking-tight">Εργάσιμες</div>
          <div class="stat-number text-2xl sm:text-3xl font-semibold text-(--marble-700) mt-1">{{ stats.workdays }}</div>
        </div>
        <div class="p-3 sm:p-4 rounded-xl bg-(--aegean-50) border border-(--aegean-200)">
          <div class="text-[10px] sm:text-xs font-semibold text-(--aegean-700) uppercase tracking-tight">Σ/Κ</div>
          <div class="stat-number text-2xl sm:text-3xl font-semibold text-(--aegean-700) mt-1">{{ stats.weekendDays }}</div>
        </div>
        <div class="p-3 sm:p-4 rounded-xl bg-(--terracotta-100) border border-(--terracotta-200)">
          <div class="text-[10px] sm:text-xs font-semibold text-(--terracotta-600) uppercase tracking-tight">Αργίες</div>
          <div class="stat-number text-2xl sm:text-3xl font-semibold text-(--terracotta-700) mt-1">{{ stats.holidayDays }}</div>
        </div>
        <div class="p-3 sm:p-4 rounded-xl bg-(--success-50) border border-(--success-200)">
          <div class="text-[10px] sm:text-xs font-semibold text-(--success-700) uppercase tracking-tight">Ελεύθερες</div>
          <div class="stat-number text-2xl sm:text-3xl font-semibold text-(--success-700) mt-1">{{ stats.freeDays }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
