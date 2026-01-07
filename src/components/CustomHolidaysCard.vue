<script setup lang="ts">
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import { searchTown, type PatronSaint } from '../data/patronSaints'
import type { CustomHoliday } from '../types'

const props = defineProps<{
  customHolidays: CustomHoliday[]
  currentYear: number
}>()

const emit = defineEmits<{
  'add-holiday': [holiday: CustomHoliday]
  'remove-holiday': [id: string]
}>()

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
  if (selectedTown.value && query === selectedTown.value.town) {
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
  townSearch.value = town.town
  showTownDropdown.value = false

  // Add patron saint as custom holiday
  const [month, day] = town.date.split('-')
  const holidayDate = `${props.currentYear}-${month}-${day}`

  // Check if already added
  const exists = props.customHolidays.some(
    h => h.name === `${town.saint} (${town.town})`
  )

  if (!exists) {
    emit('add-holiday', {
      id: crypto.randomUUID(),
      name: `${town.saint} (${town.town})`,
      date: holidayDate
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
      date: newHolidayDate.value
    })
    newHolidayName.value = ''
    newHolidayDate.value = ''
  }
}
</script>

<template>
  <div class="card-elevated p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-(--terracotta-500) flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h2 class="heading-card">Προσαρμοσμένες Αργίες</h2>
    </div>

    <!-- Town Search -->
    <div class="mb-6 pb-6 border-b border-(--marble-200)">
      <label class="block text-sm font-semibold text-(--marble-600) mb-3">
        Βρείτε τον Πολιούχο της Πόλης σας
      </label>
      <div class="relative">
        <div class="absolute left-3 top-1/2 -translate-y-1/2">
          <svg class="w-5 h-5 text-(--marble-400)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="townSearch"
          type="text"
          placeholder="Αναζήτηση πόλης..."
          class="input-elegant pl-11 pr-10"
          @focus="showTownDropdown = townResults.length > 0"
        />
        <button
          v-if="townSearch"
          @click="clearTownSelection"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-(--marble-400) hover:text-(--terracotta-500) transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="showTownDropdown"
          class="absolute z-20 w-full mt-2 bg-(--marble-white) border border-(--marble-200) rounded-xl shadow-xl max-h-60 overflow-y-auto"
        >
          <button
            v-for="town in townResults"
            :key="town.town"
            @click="selectTown(town)"
            class="w-full px-4 py-3 text-left hover:bg-(--aegean-50) border-b border-(--marble-100) last:border-0 transition-colors"
          >
            <span class="block font-semibold text-(--marble-700)">{{ town.town }}</span>
            <span class="block text-xs text-(--marble-500)">{{ town.townGreek }}</span>
            <span class="flex items-center gap-2 mt-1">
              <span class="badge badge-terracotta text-[10px]">{{ town.date.split('-').reverse().join('/') }}</span>
              <span class="text-xs text-(--aegean-600)">{{ town.saint }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Add -->
    <div class="space-y-4">
      <div>
        <label for="holidayName" class="block text-sm font-semibold text-(--marble-600) mb-2">
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
        <label for="holidayDate" class="block text-sm font-semibold text-(--marble-600) mb-2">
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
        class="w-full btn-primary"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Προσθήκη Αργίας
      </button>
    </div>

    <!-- Custom Holidays List -->
    <div v-if="customHolidays.length > 0" class="mt-6 pt-6 border-t border-(--marble-200)">
      <h3 class="text-sm font-semibold text-(--marble-500) uppercase tracking-wider mb-3">Προστιθέμενες Αργίες</h3>
      <ul class="space-y-2 max-h-32 overflow-y-auto">
        <li
          v-for="holiday in customHolidays"
          :key="holiday.id"
          class="flex items-center justify-between bg-(--marble-100) rounded-lg px-4 py-3 border border-(--marble-200)"
        >
          <div class="flex-1 min-w-0">
            <span class="font-semibold text-(--marble-700) text-sm truncate block">{{ holiday.name }}</span>
            <span class="text-xs text-(--marble-500)">
              {{ format(new Date(holiday.date), 'd MMM yyyy', { locale: el }) }}
            </span>
          </div>
          <button
            @click="emit('remove-holiday', holiday.id)"
            class="ml-3 w-8 h-8 rounded-lg flex items-center justify-center text-(--marble-400) hover:text-(--terracotta-500) hover:bg-(--terracotta-100) transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
