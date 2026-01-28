<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { format, addDays } from 'date-fns'
import { el } from 'date-fns/locale'
import { searchTown, type PatronSaint } from '../data/patronSaints'
import { calculateOrthodoxEaster } from '../composables/useGreekHolidays'
import type { CustomHoliday } from '../types'

const props = defineProps<{
  customHolidays: CustomHoliday[]
  currentYear: number
}>()

const emit = defineEmits<{
  'add-holiday': [holiday: CustomHoliday]
  'remove-holiday': [id: string]
}>()

// Calculate Easter for current year (needed for movable feasts)
const easterDate = computed(() => calculateOrthodoxEaster(props.currentYear))

/**
 * Get the display date for a holiday, recalculated for the current year
 */
function getDisplayDate(holiday: CustomHoliday): Date {
  if (holiday.isMovable && holiday.easterOffset !== undefined) {
    // Movable feast: calculate from Easter
    return addDays(easterDate.value, holiday.easterOffset)
  } else if (holiday.movesIfBeforeEaster && holiday.recurringDate) {
    // Conditionally movable feast (e.g., Saint George):
    // If fixed date falls on/before Easter, move to Bright Monday
    const parts = holiday.recurringDate.split('-')
    const month = parts[0] ?? '01'
    const day = parts[1] ?? '01'
    const fixedDate = new Date(props.currentYear, parseInt(month) - 1, parseInt(day))

    if (fixedDate <= easterDate.value) {
      return addDays(easterDate.value, 1) // Bright Monday
    }
    return fixedDate
  } else if (holiday.isRecurring && holiday.recurringDate) {
    // Recurring holiday: use recurringDate with current year
    const parts = holiday.recurringDate.split('-')
    const month = parts[0] ?? '01'
    const day = parts[1] ?? '01'
    return new Date(props.currentYear, parseInt(month) - 1, parseInt(day))
  }
  // One-time holiday: use stored date
  return new Date(holiday.date)
}

/**
 * Format the date for display - without year for recurring holidays
 */
function formatDisplayDate(holiday: CustomHoliday): string {
  const date = getDisplayDate(holiday)
  if (holiday.isRecurring) {
    // Recurring holidays don't show year
    return format(date, 'd MMM', { locale: el })
  }
  return format(date, 'd MMM yyyy', { locale: el })
}

/**
 * Get the display date for a patron saint in the search dropdown
 * Calculates the correct date for movable feasts based on Easter
 */
function getPatronSaintDisplayDate(town: PatronSaint): string {
  let date: Date

  if (town.isMovable && town.easterOffset !== undefined) {
    // Movable feast: calculate from Easter
    date = addDays(easterDate.value, town.easterOffset)
  } else if (town.movesIfBeforeEaster) {
    // Conditionally movable feast (e.g., Saint George):
    // If fixed date falls on/before Easter, move to Bright Monday
    const parts = town.date.split('-')
    const month = parts[0] ?? '01'
    const day = parts[1] ?? '01'
    const fixedDate = new Date(props.currentYear, parseInt(month) - 1, parseInt(day))

    if (fixedDate <= easterDate.value) {
      date = addDays(easterDate.value, 1) // Bright Monday
    } else {
      date = fixedDate
    }
  } else {
    // Fixed feast: use the date field with current year
    const parts = town.date.split('-')
    const month = parts[0] ?? '01'
    const day = parts[1] ?? '01'
    date = new Date(props.currentYear, parseInt(month) - 1, parseInt(day))
  }

  return format(date, 'dd/MM', { locale: el })
}

// New custom holiday form
const newHolidayName = ref('')
const newHolidayDate = ref('')

// Town search for patron saints
const townSearch = ref('')
const townResults = ref<PatronSaint[]>([])
const showTownDropdown = ref(false)
const selectedTown = ref<PatronSaint | null>(null)

// Watch town search input
watch(townSearch, (query) => {
  // Don't reopen dropdown if user just selected a town
  if (query === selectedTown.value?.townGreek) {
    showTownDropdown.value = false
    return
  }

  if (query.length >= 2) {
    townResults.value = searchTown(query)
    showTownDropdown.value = townResults.value.length > 0
  } else {
    townResults.value = []
    showTownDropdown.value = false
  }
})

// Select a town from search results
function selectTown(town: PatronSaint) {
  selectedTown.value = town
  townSearch.value = town.townGreek
  showTownDropdown.value = false

  // Check if already added (check both Greek and English names for backwards compatibility)
  const exists = props.customHolidays.some(
    (h) =>
      h.name === `${town.saintGreek} (${town.townGreek})` ||
      h.name === `${town.saint} (${town.town})`
  )

  if (!exists) {
    // Add patron saint as recurring holiday
    const [month, day] = town.date.split('-')
    const holidayDate = `${props.currentYear}-${month}-${day}`

    emit('add-holiday', {
      id: crypto.randomUUID(),
      name: `${town.saintGreek} (${town.townGreek})`,
      date: holidayDate, // Display date for current year (will be recalculated)
      isRecurring: true,
      recurringDate: town.date, // MM-DD format
      isMovable: town.isMovable,
      easterOffset: town.easterOffset,
      movesIfBeforeEaster: town.movesIfBeforeEaster,
    })
  }
}

// Clear town selection
function clearTownSelection() {
  selectedTown.value = null
  townSearch.value = ''
}

// Add custom holiday
function addCustomHoliday() {
  if (newHolidayName.value && newHolidayDate.value) {
    emit('add-holiday', {
      id: crypto.randomUUID(),
      name: newHolidayName.value,
      date: newHolidayDate.value,
    })
    newHolidayName.value = ''
    newHolidayDate.value = ''
  }
}
</script>

<template>
  <div class="card-elevated p-6">
    <div class="mb-6 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-(--terracotta-500)">
        <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 class="heading-card">Προσαρμοσμένες Αργίες</h2>
    </div>

    <!-- Town Search -->
    <div class="mb-6 border-b border-(--marble-200) pb-6">
      <label class="mb-3 block text-sm font-semibold text-(--marble-600)">
        Βρείτε τον Πολιούχο της Πόλης σας
      </label>
      <div class="relative">
        <div class="absolute top-1/2 left-3 -translate-y-1/2">
          <svg
            class="h-5 w-5 text-(--marble-400)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          v-model="townSearch"
          type="text"
          placeholder="Αναζήτηση πόλης..."
          class="input-elegant"
          style="padding-left: 2.75rem"
          @focus="showTownDropdown = townResults.length > 0"
        />
        <button
          v-if="townSearch"
          @click="clearTownSelection"
          class="absolute top-1/2 right-4 -translate-y-1/2 text-(--marble-400) transition-colors hover:text-(--terracotta-500)"
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

        <!-- Dropdown -->
        <div
          v-if="showTownDropdown"
          class="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-(--marble-200) bg-(--marble-white) shadow-xl"
        >
          <button
            v-for="town in townResults"
            :key="town.town"
            @click="selectTown(town)"
            class="w-full border-b border-(--marble-100) px-4 py-3 text-left transition-colors last:border-0 hover:bg-(--aegean-50)"
          >
            <span class="block font-semibold text-(--marble-700)">{{ town.townGreek }}</span>
            <span class="mt-1 flex items-center gap-2">
              <span class="badge badge-terracotta text-[10px]">{{
                getPatronSaintDisplayDate(town)
              }}</span>
              <span class="text-xs text-(--aegean-600)">{{ town.saintGreek }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Add -->
    <div class="space-y-4">
      <div>
        <label for="holidayName" class="mb-2 block text-sm font-semibold text-(--marble-600)">
          Όνομα Αργίας
        </label>
        <input
          id="holidayName"
          v-model="newHolidayName"
          type="text"
          placeholder="π.χ., Τοπικό Πανηγύρι"
          class="input-elegant"
        />
      </div>

      <div>
        <label for="holidayDate" class="mb-2 block text-sm font-semibold text-(--marble-600)">
          Ημερομηνία
        </label>
        <input
          id="holidayDate"
          v-model="newHolidayDate"
          type="date"
          :min="`${currentYear}-01-01`"
          :max="`${currentYear}-12-31`"
          class="input-elegant"
        />
      </div>

      <button
        @click="addCustomHoliday"
        :disabled="!newHolidayName || !newHolidayDate"
        class="btn-primary w-full"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Προσθήκη Αργίας
      </button>
    </div>

    <!-- Custom Holidays List -->
    <div v-if="customHolidays.length > 0" class="mt-6 border-t border-(--marble-200) pt-6">
      <h3 class="mb-3 text-sm font-semibold tracking-wider text-(--marble-500) uppercase">
        Προστιθέμενες Αργίες
      </h3>
      <ul class="max-h-64 space-y-2 overflow-y-auto">
        <li
          v-for="holiday in customHolidays"
          :key="holiday.id"
          class="flex items-center justify-between rounded-lg border border-(--marble-200) bg-(--marble-100) px-4 py-3"
        >
          <div class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-(--marble-700)">{{
              holiday.name
            }}</span>
            <span class="text-xs text-(--marble-500)">
              {{ formatDisplayDate(holiday) }}
            </span>
            <span v-if="holiday.isMovable" class="text-[10px] font-medium text-(--terracotta-500)">
              Κινητή εορτή
            </span>
          </div>
          <button
            @click="emit('remove-holiday', holiday.id)"
            class="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-(--marble-400) transition-all hover:bg-(--terracotta-100) hover:text-(--terracotta-500)"
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
        </li>
      </ul>
    </div>
  </div>
</template>
