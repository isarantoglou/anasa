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
  getFixedHolidayDay,
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
  comparisonYears.value = comparisonYears.value.filter((y) => y !== year)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div
      class="animate-fade-in-up relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-(--marble-white) shadow-2xl"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between border-b border-(--marble-200) bg-(--marble-50) px-6 py-4"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-(--aegean-600)">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Σύγκριση Ετών</h3>
        </div>
        <button
          @click="emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-(--marble-400) transition-all hover:bg-(--marble-100) hover:text-(--marble-600)"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Year Selection -->
      <div class="border-b border-(--marble-200) px-6 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-(--marble-600)">Επιλέξτε έτη:</span>
          <div class="flex gap-2">
            <button
              v-for="year in [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]"
              :key="year"
              @click="
                comparisonYears.includes(year)
                  ? removeComparisonYear(year)
                  : addComparisonYear(year)
              "
              class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
              :class="
                comparisonYears.includes(year)
                  ? 'bg-(--aegean-600) text-white'
                  : 'bg-(--marble-100) text-(--marble-600) hover:bg-(--marble-200)'
              "
            >
              {{ year }}
            </button>
          </div>
          <span class="text-xs text-(--marble-500)">(μέγ. 3 έτη)</span>
        </div>
      </div>

      <!-- Comparison Content -->
      <div class="max-h-[60vh] overflow-y-auto p-6">
        <div v-if="comparisonYears.length === 0" class="py-8 text-center text-(--marble-500)">
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
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded px-2 py-1 text-xs font-semibold"
                    :class="
                      getFixedHolidayDay(holiday, year).isWeekend
                        ? 'bg-(--warning-100) text-(--warning-700)'
                        : 'bg-(--success-100) text-(--success-700)'
                    "
                  >
                    {{ getFixedHolidayDay(holiday, year).label }}
                  </span>
                </td>
              </tr>
              <!-- Easter Row -->
              <tr class="bg-(--terracotta-50)">
                <td class="px-4 py-3 font-semibold text-(--terracotta-700)">Ορθόδοξο Πάσχα</td>
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded bg-(--terracotta-200) px-2 py-1 text-xs font-semibold text-(--terracotta-800)"
                  >
                    {{ getEasterForYear(year) }}
                  </span>
                </td>
              </tr>
              <!-- Holy Spirit Row (only if enabled) -->
              <tr v-if="includeHolySpirit" class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Αγίου Πνεύματος</td>
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded px-2 py-1 text-xs font-semibold"
                    :class="
                      getHolySpiritForYear(year).isWeekend
                        ? 'bg-(--warning-100) text-(--warning-700)'
                        : 'bg-(--success-100) text-(--success-700)'
                    "
                  >
                    {{ getHolySpiritForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Clean Monday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Καθαρά Δευτέρα</td>
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded px-2 py-1 text-xs font-semibold"
                    :class="
                      getCleanMondayForYear(year).isWeekend
                        ? 'bg-(--warning-100) text-(--warning-700)'
                        : 'bg-(--success-100) text-(--success-700)'
                    "
                  >
                    {{ getCleanMondayForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Good Friday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Μεγάλη Παρασκευή</td>
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded px-2 py-1 text-xs font-semibold"
                    :class="
                      getGoodFridayForYear(year).isWeekend
                        ? 'bg-(--warning-100) text-(--warning-700)'
                        : 'bg-(--success-100) text-(--success-700)'
                    "
                  >
                    {{ getGoodFridayForYear(year).label }}
                  </span>
                </td>
              </tr>
              <!-- Easter Monday Row -->
              <tr class="bg-(--aegean-50)">
                <td class="px-4 py-3 font-semibold text-(--aegean-700)">Δευτέρα του Πάσχα</td>
                <td v-for="year in comparisonYears" :key="year" class="px-4 py-3 text-center">
                  <span
                    class="inline-block rounded px-2 py-1 text-xs font-semibold"
                    :class="
                      getEasterMondayForYear(year).isWeekend
                        ? 'bg-(--warning-100) text-(--warning-700)'
                        : 'bg-(--success-100) text-(--success-700)'
                    "
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
