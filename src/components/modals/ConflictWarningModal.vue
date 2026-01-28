<script setup lang="ts">
import type { SavedOpportunity, DateRange } from '../../types'

defineProps<{
  show: boolean
  conflictWith: SavedOpportunity | null
  formatDateRange: (range: DateRange) => string
}>()

const emit = defineEmits<{
  dismiss: []
  'force-add': []
}>()
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('dismiss')"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div
      class="animate-fade-in-up relative w-full max-w-md rounded-2xl bg-(--marble-white) p-6 shadow-2xl"
    >
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-(--warning-100)">
          <svg
            class="h-6 w-6 text-(--warning-600)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Σύγκρουση Περιόδων</h3>
          <p class="text-sm text-(--marble-500)">Η περίοδος επικαλύπτεται με υπάρχουσα</p>
        </div>
      </div>

      <div
        v-if="conflictWith"
        class="mb-6 rounded-xl border border-(--warning-200) bg-(--warning-100) p-4"
      >
        <p class="text-sm font-medium text-(--warning-700)">Υπάρχει ήδη άδεια στο πλάνο:</p>
        <p class="mt-1 text-sm font-semibold text-(--warning-800)">
          {{ formatDateRange(conflictWith.range) }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="emit('dismiss')"
          class="flex-1 rounded-xl border-2 border-(--marble-200) px-4 py-3 font-semibold text-(--marble-600) transition-colors hover:bg-(--marble-100)"
        >
          Ακύρωση
        </button>
        <button
          @click="emit('force-add')"
          class="flex-1 rounded-xl bg-(--warning-500) px-4 py-3 font-semibold text-white transition-colors hover:bg-(--warning-600)"
        >
          Προσθήκη Ούτως ή Άλλως
        </button>
      </div>
    </div>
  </div>
</template>
