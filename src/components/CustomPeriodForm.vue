<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseISO, format } from 'date-fns'
import { el } from 'date-fns/locale'
import { useCustomPeriod } from '../composables/useCustomPeriod'
import type { Holiday, OptimizationResult } from '../types'

const props = defineProps<{
  currentYear: number
  holidays: Holiday[]
  remainingLeaveDays: number
}>()

const emit = defineEmits<{
  'add-custom-period': [period: OptimizationResult, label: string]
}>()

// Convert holidays array to ref for composable
const holidaysRef = computed(() => props.holidays)
const { createCustomPeriod, validateDateRange } = useCustomPeriod(holidaysRef)

// State
const isExpanded = ref(false)
const startDate = ref('')
const endDate = ref('')
const label = ref('')

// Compute today's date in ISO format for min attribute
const todayISO = computed(() => {
  const today = new Date()
  return format(today, 'yyyy-MM-dd')
})

// Validation
const validation = computed(() => {
  if (!startDate.value || !endDate.value) {
    return { valid: false, error: '' }
  }
  return validateDateRange(startDate.value, endDate.value, props.currentYear)
})

// Preview
const preview = computed(() => {
  if (!validation.value.valid || !startDate.value || !endDate.value) {
    return null
  }

  const start = parseISO(startDate.value)
  const end = parseISO(endDate.value)

  return createCustomPeriod(start, end)
})

// Warnings
const exceedsRemaining = computed(() => {
  return preview.value && preview.value.leaveDaysRequired > props.remainingLeaveDays
})

const isZeroLeave = computed(() => {
  return preview.value && preview.value.leaveDaysRequired === 0
})

// Actions
const canAdd = computed(() => {
  return validation.value.valid && preview.value !== null
})

function addPeriod() {
  if (!canAdd.value || !preview.value) return

  emit('add-custom-period', preview.value, label.value.trim())

  // Reset form
  startDate.value = ''
  endDate.value = ''
  label.value = ''
  isExpanded.value = false
}

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    return format(date, 'd MMM yyyy', { locale: el })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="border border-(--marble-200) rounded-xl bg-(--marble-50) overflow-hidden">
    <!-- Collapsible Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full px-4 py-3 flex items-center justify-between hover:bg-(--marble-100) transition-colors"
      data-testid="custom-period-toggle"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-(--terracotta-500) flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span class="text-sm font-semibold text-(--marble-700)">
          Προσθήκη Προσαρμοσμένης Περιόδου
        </span>
      </div>
      <svg
        class="w-5 h-5 text-(--marble-400) transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Expandable Content -->
    <div v-if="isExpanded" class="px-4 pb-4 space-y-4" data-testid="custom-period-form">
      <!-- Date Inputs -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="custom-start" class="block text-xs font-semibold text-(--marble-600) mb-2">
            Από Ημερομηνία
          </label>
          <input
            id="custom-start"
            v-model="startDate"
            type="date"
            :min="todayISO"
            :max="`${currentYear}-12-31`"
            class="input-elegant text-sm"
            data-testid="start-date-input"
          />
        </div>
        <div>
          <label for="custom-end" class="block text-xs font-semibold text-(--marble-600) mb-2">
            Έως Ημερομηνία
          </label>
          <input
            id="custom-end"
            v-model="endDate"
            type="date"
            :min="startDate || todayISO"
            :max="`${currentYear}-12-31`"
            class="input-elegant text-sm"
            data-testid="end-date-input"
          />
        </div>
      </div>

      <!-- Label Input -->
      <div>
        <label for="custom-label" class="block text-xs font-semibold text-(--marble-600) mb-2">
          Περιγραφή <span class="font-normal text-(--marble-400)">(προαιρετικό)</span>
        </label>
        <input
          id="custom-label"
          v-model="label"
          type="text"
          placeholder="π.χ. Ταξίδι στην Αμερική"
          maxlength="50"
          class="input-elegant text-sm"
          data-testid="label-input"
        />
      </div>

      <!-- Validation Error -->
      <div
        v-if="validation.error"
        class="p-3 rounded-lg bg-(--error-100) border border-(--error-200)"
        data-testid="validation-error"
      >
        <div class="flex items-center gap-2 text-(--error-600)">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">{{ validation.error }}</span>
        </div>
      </div>

      <!-- Preview Stats -->
      <div
        v-if="preview"
        class="p-4 rounded-xl bg-white border border-(--marble-200)"
        data-testid="preview-stats"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs font-semibold text-(--marble-500) uppercase tracking-wider">
            Προεπισκόπηση
          </div>
          <div class="text-sm font-medium text-(--marble-600)">
            {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
          </div>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div class="text-center">
            <div class="stat-number text-xl font-bold text-(--aegean-600)">
              {{ preview.totalDays }}
            </div>
            <div class="text-[10px] font-semibold text-(--marble-500) uppercase mt-1">Σύνολο</div>
          </div>
          <div class="text-center">
            <div class="stat-number text-xl font-bold text-(--warning-600)">
              {{ preview.leaveDaysRequired }}
            </div>
            <div class="text-[10px] font-semibold text-(--marble-500) uppercase mt-1">Άδεια</div>
          </div>
          <div class="text-center">
            <div class="stat-number text-xl font-bold text-(--success-600)">
              {{ preview.freeDays }}
            </div>
            <div class="text-[10px] font-semibold text-(--marble-500) uppercase mt-1">Δωρεάν</div>
          </div>
          <div class="text-center">
            <div class="stat-number text-xl font-bold text-(--terracotta-600)">
              {{ preview.efficiency.toFixed(1) }}x
            </div>
            <div class="text-[10px] font-semibold text-(--marble-500) uppercase mt-1">Απόδοση</div>
          </div>
        </div>

        <!-- Zero Leave Warning -->
        <div
          v-if="isZeroLeave"
          class="mt-3 p-2 rounded-lg bg-(--warning-100) border border-(--warning-200)"
          data-testid="zero-leave-warning"
        >
          <div class="flex items-center gap-2 text-(--warning-700)">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-medium">Η περίοδος δεν απαιτεί ημέρες άδειας (μόνο Σ/Κ και αργίες)</span>
          </div>
        </div>

        <!-- Exceeds Remaining Warning -->
        <div
          v-if="exceedsRemaining"
          class="mt-3 p-2 rounded-lg bg-(--warning-100) border border-(--warning-200)"
          data-testid="exceeds-warning"
        >
          <div class="flex items-center gap-2 text-(--warning-700)">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-xs font-medium">
              Η περίοδος χρειάζεται {{ preview.leaveDaysRequired }} ημέρες αλλά έχετε μόνο {{ remainingLeaveDays }} διαθέσιμες
            </span>
          </div>
        </div>
      </div>

      <!-- Add Button -->
      <button
        @click="addPeriod"
        :disabled="!canAdd"
        class="w-full btn-primary"
        data-testid="add-period-button"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Προσθήκη στο Πλάνο
      </button>
    </div>
  </div>
</template>
