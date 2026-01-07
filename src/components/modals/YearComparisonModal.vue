<script setup lang="ts">
import { ref } from 'vue'
import { useYearComparison } from '../../composables/useYearComparison'

const props = defineProps<{
  show: boolean
  currentYear: number
  includeHolySpirit: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Use composable for all year comparison logic
const {
  fixedHolidays,
  getEasterForYear,
  getCleanMondayForYear,
  getGoodFridayForYear,
  getEasterMondayForYear,
  getHolySpiritForYear,
  getFixedHolidayDay
} = useYearComparison()

const comparisonYears = ref<number[]>([])

// Initialize comparison years when modal opens
if (props.show && comparisonYears.value.length === 0) {
  comparisonYears.value = [props.currentYear, props.currentYear + 1]
}

function addComparisonYear(year: number) {
  if (!comparisonYears.value.includes(year) && comparisonYears.value.length < 3) {
    comparisonYears.value.push(year)
    comparisonYears.value.sort((a, b) => a - b)
  }
}

function removeComparisonYear(year: number) {
  comparisonYears.value = comparisonYears.value.filter(y => y !== year)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-(--marble-white) rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-(--marble-200) bg-(--marble-50) flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-(--aegean-600) flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Σύγκριση Ετών</h3>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-(--marble-400) hover:text-(--marble-600) hover:bg-(--marble-100) transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Year Selection -->
      <div class="px-6 py-4 border-b border-(--marble-200)">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-(--marble-600)">Επιλέξτε έτη:</span>
          <div class="flex gap-2">
            <button
              v-for="year in [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]"
              :key="year"
              @click="comparisonYears.includes(year) ? removeComparisonYear(year) : addComparisonYear(year)"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              :class="comparisonYears.includes(year)
                ? 'bg-(--aegean-600) text-white'
                : 'bg-(--marble-100) text-(--marble-600) hover:bg-(--marble-200)'"
            >
              {{ year }}
            </button>
          </div>
          <span class="text-xs text-(--marble-500)">(μέγ. 3 έτη)</span>
        </div>
      </div>

      <!-- Comparison Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div v-if="comparisonYears.length === 0" class="text-center py-8 text-(--marble-500)">
          Επιλέξτε τουλάχιστον ένα έτος για σύγκριση
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-(--marble-200)">
                <th class="px-4 py-3 text-left font-semibold text-(--marble-600)">Αργία</th>
                <th
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center font-semibold text-(--aegean-700)"
                >
                  {{ year }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-(--marble-100)">
              <!-- Fixed Holidays -->
              <tr v-for="holiday in fixedHolidays" :key="holiday">
                <td class="px-4 py-3 font-medium text-(--marble-700)">{{ holiday }}</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold"
                    :class="getFixedHolidayDay(holiday, year).isWeekend
                      ? 'bg-(--warning-100) text-(--warning-700)'
                      : 'bg-(--success-100) text-(--success-700)'"
                  >
                    {{ getFixedHolidayDay(holiday, year).label }}
                  </span>
                </td>
              </tr>
              <!-- Easter Row -->
              <tr class="bg-(--terracotta-50)">
                <td class="px-4 py-3 font-semibold text-(--terracotta-700)">Ορθόδοξο Πάσχα</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span class="inline-block px-2 py-1 rounded text-xs font-semibold bg-(--terracotta-200) text-(--terracotta-800)">
                    {{ getEasterForYear(year) }}
                  </span>
                </td>
              </tr>
              <!-- Holy Spirit Row (only if enabled) -->
              <tr v-if="includeHolySpirit" class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Αγίου Πνεύματος</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold"
                    :class="getHolySpiritForYear(year).isWeekend
                      ? 'bg-(--warning-100) text-(--warning-700)'
                      : 'bg-(--success-100) text-(--success-700)'"
                  >
                    {{ getHolySpiritForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Clean Monday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Καθαρά Δευτέρα</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold"
                    :class="getCleanMondayForYear(year).isWeekend
                      ? 'bg-(--warning-100) text-(--warning-700)'
                      : 'bg-(--success-100) text-(--success-700)'"
                  >
                    {{ getCleanMondayForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Good Friday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Μεγάλη Παρασκευή</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold"
                    :class="getGoodFridayForYear(year).isWeekend
                      ? 'bg-(--warning-100) text-(--warning-700)'
                      : 'bg-(--success-100) text-(--success-700)'"
                  >
                    {{ getGoodFridayForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Easter Monday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Δευτέρα του Πάσχα</td>
                <td
                  v-for="year in comparisonYears"
                  :key="year"
                  class="px-4 py-3 text-center"
                >
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold"
                    :class="getEasterMondayForYear(year).isWeekend
                      ? 'bg-(--warning-100) text-(--warning-700)'
                      : 'bg-(--success-100) text-(--success-700)'"
                  >
                    {{ getEasterMondayForYear(year).label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
