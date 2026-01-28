<script setup lang="ts">
import type { SavedOpportunity, DateRange, Holiday, OptimizationResult } from '../types'
import CustomPeriodForm from './CustomPeriodForm.vue'

const props = defineProps<{
  currentYear: number
  annualPlan: SavedOpportunity[]
  annualPlanTotalDays: number
  remainingLeaveDays: number
  formatDateRange: (range: DateRange) => string
  holidays: Holiday[]
}>()

const emit = defineEmits<{
  'remove-from-plan': [id: string]
  'clear-plan': []
  'export-to-calendar': []
  'show-leave-request': []
  'add-custom-period': [period: OptimizationResult, label: string]
  'share-url': []
  'share-as-image': []
}>()
</script>

<template>
  <section class="animate-fade-in-up mb-12 delay-150">
    <div class="card-elevated overflow-hidden">
      <!-- Header -->
      <div
        class="border-b border-(--marble-200) bg-gradient-to-r from-(--aegean-600) to-(--aegean-700) px-4 py-4 sm:px-6 sm:py-5"
      >
        <div class="flex items-start justify-between gap-3 sm:items-center">
          <!-- Title -->
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 sm:h-10 sm:w-10"
            >
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="truncate text-lg font-semibold text-white sm:text-xl">
                Ετήσιο Πλάνο Αδειών {{ currentYear }}
              </h2>
              <p class="hidden text-xs text-white/70 sm:block sm:text-sm">
                Οι επιλεγμένες περίοδοι άδειας
              </p>
            </div>
          </div>
          <!-- Stats & Clear - responsive layout -->
          <div class="flex shrink-0 items-center gap-2 sm:gap-4">
            <div
              class="rounded-lg bg-white/10 px-2 py-1.5 text-center sm:rounded-xl sm:px-4 sm:py-2"
            >
              <div class="stat-number text-lg font-bold text-white sm:text-2xl">
                {{ annualPlanTotalDays }}
              </div>
              <div class="text-[9px] font-semibold text-white/70 uppercase sm:text-[10px]">
                Χρησιμ.
              </div>
            </div>
            <div
              class="rounded-lg bg-white/10 px-2 py-1.5 text-center sm:rounded-xl sm:px-4 sm:py-2"
            >
              <div
                class="stat-number text-lg font-bold sm:text-2xl"
                :class="remainingLeaveDays >= 0 ? 'text-white' : 'text-red-300'"
              >
                {{ remainingLeaveDays }}
              </div>
              <div class="text-[9px] font-semibold text-white/70 uppercase sm:text-[10px]">
                Υπόλοιπο
              </div>
            </div>
            <!-- Clear button: icon on mobile, text on desktop -->
            <button
              v-if="annualPlan.length > 0"
              @click="emit('clear-plan')"
              class="rounded-lg bg-white/10 p-2 text-sm font-medium text-white transition-colors hover:bg-white/20 sm:px-3 sm:py-2"
              title="Καθαρισμός"
            >
              <svg class="h-4 w-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span class="hidden sm:inline">Καθαρισμός</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Plan Items -->
      <div class="p-6">
        <div v-if="annualPlan.length === 0" class="py-8 text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--marble-100)"
          >
            <svg
              class="h-8 w-8 text-(--marble-400)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p class="text-(--marble-500)">
            Προσθέστε ευκαιρίες από την παρακάτω λίστα για να δημιουργήσετε το πλάνο σας
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(opp, index) in annualPlan"
            :key="opp.id"
            class="flex flex-col justify-between gap-4 rounded-xl border border-(--marble-200) bg-(--marble-50) p-4 sm:flex-row sm:items-center"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-(--aegean-600) text-sm font-bold text-white"
              >
                {{ index + 1 }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-(--marble-700)">
                    {{ formatDateRange(opp.range) }}
                  </span>
                  <span
                    v-if="opp.isCustom"
                    class="rounded-full bg-(--terracotta-100) px-2 py-0.5 text-xs font-semibold text-(--terracotta-700)"
                    data-testid="custom-badge"
                  >
                    Προσαρμοσμένο
                  </span>
                </div>
                <div
                  v-if="opp.label"
                  class="text-sm font-medium text-(--terracotta-600)"
                  data-testid="custom-label"
                >
                  {{ opp.label }}
                </div>
                <div class="text-sm text-(--marble-500)">
                  {{ opp.efficiencyLabel }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex gap-3 text-sm">
                <span
                  class="rounded bg-(--warning-100) px-2 py-1 font-semibold text-(--warning-700)"
                  >{{ opp.leaveDaysRequired }} ημέρες άδειας</span
                >
                <span
                  class="rounded bg-(--success-100) px-2 py-1 font-semibold text-(--success-700)"
                  >{{ opp.totalDays }} ημέρες ελεύθερες</span
                >
              </div>
              <button
                @click="emit('remove-from-plan', opp.id)"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-(--marble-400) transition-all hover:bg-(--terracotta-100) hover:text-(--terracotta-500)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Period Form -->
        <div class="mt-6">
          <CustomPeriodForm
            :current-year="props.currentYear"
            :holidays="props.holidays"
            :remaining-leave-days="props.remainingLeaveDays"
            @add-custom-period="(period, label) => emit('add-custom-period', period, label)"
          />
        </div>

        <!-- Action Buttons - 2x2 grid on mobile, row on desktop -->
        <div v-if="annualPlan.length > 0" class="mt-6 border-t border-(--marble-200) pt-6">
          <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <!-- Export to Calendar -->
            <button
              @click="emit('export-to-calendar')"
              class="flex flex-col items-center justify-center gap-1 rounded-xl bg-(--aegean-600) px-3 py-3 font-medium text-white transition-colors hover:bg-(--aegean-700) sm:flex-row sm:justify-start sm:gap-2 sm:rounded-lg sm:py-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-xs sm:text-sm">Ημερολόγιο</span>
            </button>
            <!-- Leave Request -->
            <button
              @click="emit('show-leave-request')"
              class="flex flex-col items-center justify-center gap-1 rounded-xl bg-(--terracotta-500) px-3 py-3 font-medium text-white transition-colors hover:bg-(--terracotta-600) sm:flex-row sm:justify-start sm:gap-2 sm:rounded-lg sm:py-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span class="text-xs sm:text-sm">Αίτηση</span>
            </button>
            <!-- Share URL -->
            <button
              @click="emit('share-url')"
              class="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-(--marble-300) px-3 py-3 font-medium text-(--marble-600) transition-colors hover:border-(--aegean-400) hover:text-(--aegean-600) sm:flex-row sm:justify-start sm:gap-2 sm:rounded-lg sm:py-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span class="text-xs sm:text-sm">Κοινοποίηση</span>
            </button>
            <!-- Download as Image -->
            <button
              @click="emit('share-as-image')"
              class="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-(--marble-300) px-3 py-3 font-medium text-(--marble-600) transition-colors hover:border-(--aegean-400) hover:text-(--aegean-600) sm:flex-row sm:justify-start sm:gap-2 sm:rounded-lg sm:py-2"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-xs sm:text-sm">Εικόνα</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
