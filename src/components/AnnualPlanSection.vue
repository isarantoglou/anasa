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
  <section class="mb-12 animate-fade-in-up delay-150">
    <div class="card-elevated overflow-hidden">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-(--marble-200) bg-gradient-to-r from-(--aegean-600) to-(--aegean-700)">
        <div class="flex items-start sm:items-center justify-between gap-3">
          <!-- Title -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-lg sm:text-xl font-semibold text-white truncate">Ετήσιο Πλάνο Αδειών {{ currentYear }}</h2>
              <p class="text-white/70 text-xs sm:text-sm hidden sm:block">Οι επιλεγμένες περίοδοι άδειας</p>
            </div>
          </div>
          <!-- Stats & Clear - responsive layout -->
          <div class="flex items-center gap-2 sm:gap-4 shrink-0">
            <div class="text-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10">
              <div class="stat-number text-lg sm:text-2xl font-bold text-white">{{ annualPlanTotalDays }}</div>
              <div class="text-[9px] sm:text-[10px] font-semibold text-white/70 uppercase">Χρησιμ.</div>
            </div>
            <div class="text-center px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10">
              <div class="stat-number text-lg sm:text-2xl font-bold" :class="remainingLeaveDays >= 0 ? 'text-white' : 'text-red-300'">{{ remainingLeaveDays }}</div>
              <div class="text-[9px] sm:text-[10px] font-semibold text-white/70 uppercase">Υπόλοιπο</div>
            </div>
            <!-- Clear button: icon on mobile, text on desktop -->
            <button
              v-if="annualPlan.length > 0"
              @click="emit('clear-plan')"
              class="p-2 sm:px-3 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              title="Καθαρισμός"
            >
              <svg class="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="hidden sm:inline">Καθαρισμός</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Plan Items -->
      <div class="p-6">
        <div v-if="annualPlan.length === 0" class="text-center py-8">
          <div class="w-16 h-16 mx-auto rounded-full bg-(--marble-100) flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-(--marble-400)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="text-(--marble-500)">Προσθέστε ευκαιρίες από την παρακάτω λίστα για να δημιουργήσετε το πλάνο σας</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(opp, index) in annualPlan"
            :key="opp.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-(--marble-50) border border-(--marble-200)"
          >
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-(--aegean-600) text-white flex items-center justify-center font-bold text-sm">
                {{ index + 1 }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-(--marble-700)">
                    {{ formatDateRange(opp.range) }}
                  </span>
                  <span
                    v-if="opp.isCustom"
                    class="px-2 py-0.5 rounded-full bg-(--terracotta-100) text-(--terracotta-700) text-xs font-semibold"
                    data-testid="custom-badge"
                  >
                    Προσαρμοσμένο
                  </span>
                </div>
                <div v-if="opp.label" class="text-sm font-medium text-(--terracotta-600)" data-testid="custom-label">
                  {{ opp.label }}
                </div>
                <div class="text-sm text-(--marble-500)">
                  {{ opp.efficiencyLabel }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex gap-3 text-sm">
                <span class="px-2 py-1 rounded bg-(--warning-100) text-(--warning-700) font-semibold">{{ opp.leaveDaysRequired }} ημέρες άδειας</span>
                <span class="px-2 py-1 rounded bg-(--success-100) text-(--success-700) font-semibold">{{ opp.totalDays }} ημέρες ελεύθερες</span>
              </div>
              <button
                @click="emit('remove-from-plan', opp.id)"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-(--marble-400) hover:text-(--terracotta-500) hover:bg-(--terracotta-100) transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
        <div v-if="annualPlan.length > 0" class="mt-6 pt-6 border-t border-(--marble-200)">
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <!-- Export to Calendar -->
            <button
              @click="emit('export-to-calendar')"
              class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-(--aegean-600) text-white font-medium hover:bg-(--aegean-700) transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs sm:text-sm">Ημερολόγιο</span>
            </button>
            <!-- Leave Request -->
            <button
              @click="emit('show-leave-request')"
              class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-(--terracotta-500) text-white font-medium hover:bg-(--terracotta-600) transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-xs sm:text-sm">Αίτηση</span>
            </button>
            <!-- Share URL -->
            <button
              @click="emit('share-url')"
              class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg border-2 border-(--marble-300) text-(--marble-600) font-medium hover:border-(--aegean-400) hover:text-(--aegean-600) transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span class="text-xs sm:text-sm">Κοινοποίηση</span>
            </button>
            <!-- Download as Image -->
            <button
              @click="emit('share-as-image')"
              class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg border-2 border-(--marble-300) text-(--marble-600) font-medium hover:border-(--aegean-400) hover:text-(--aegean-600) transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs sm:text-sm">Εικόνα</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
