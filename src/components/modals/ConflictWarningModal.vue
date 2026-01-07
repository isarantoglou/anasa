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
    <div class="relative bg-(--marble-white) rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-(--warning-100) flex items-center justify-center">
          <svg class="w-6 h-6 text-(--warning-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Σύγκρουση Περιόδων</h3>
          <p class="text-sm text-(--marble-500)">Η περίοδος επικαλύπτεται με υπάρχουσα</p>
        </div>
      </div>

      <div v-if="conflictWith" class="mb-6 p-4 rounded-xl bg-(--warning-100) border border-(--warning-200)">
        <p class="text-sm text-(--warning-700) font-medium">
          Υπάρχει ήδη άδεια στο πλάνο:
        </p>
        <p class="text-sm text-(--warning-800) font-semibold mt-1">
          {{ formatDateRange(conflictWith.range) }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="emit('dismiss')"
          class="flex-1 px-4 py-3 rounded-xl border-2 border-(--marble-200) text-(--marble-600) font-semibold hover:bg-(--marble-100) transition-colors"
        >
          Ακύρωση
        </button>
        <button
          @click="emit('force-add')"
          class="flex-1 px-4 py-3 rounded-xl bg-(--warning-500) text-white font-semibold hover:bg-(--warning-600) transition-colors"
        >
          Προσθήκη Ούτως ή Άλλως
        </button>
      </div>
    </div>
  </div>
</template>
