<script setup lang="ts">
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { Holiday } from '../../types'

defineProps<{
  show: boolean
  currentYear: number
  allHolidays: Holiday[]
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative bg-(--marble-white) rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden animate-fade-in-up">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-(--marble-200) bg-(--marble-50)">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-(--aegean-600) flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 class="heading-section">Πλήρες Ημερολόγιο Αργιών {{ currentYear }}</h2>
                <p class="text-sm text-(--marble-500)">{{ allHolidays.length }} αργίες</p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-(--marble-500) hover:text-(--marble-700) hover:bg-(--marble-100) transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Table Content -->
          <div class="overflow-y-auto max-h-[calc(85vh-80px)]">
            <table class="w-full">
              <thead class="sticky top-0 bg-(--marble-50) z-10">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-(--marble-500) uppercase tracking-wider">
                    Αργία
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-(--marble-500) uppercase tracking-wider">
                    Ημερομηνία
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-(--marble-500) uppercase tracking-wider">
                    Ημέρα
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-(--marble-500) uppercase tracking-wider">
                    Τύπος
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-(--marble-500) uppercase tracking-wider">
                    Αξία
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-(--marble-100)">
                <tr
                  v-for="holiday in allHolidays"
                  :key="holiday.date.toISOString()"
                  class="hover:bg-(--aegean-50)/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="font-semibold text-(--marble-700)">{{ holiday.nameGreek }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="stat-number text-(--aegean-700) font-semibold">
                      {{ format(holiday.date, 'd MMMM yyyy', { locale: el }) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-(--marble-600)">
                    {{ format(holiday.date, 'EEEE', { locale: el }) }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="badge"
                      :class="holiday.isCustom ? 'badge-terracotta' : holiday.isMovable ? 'badge-aegean' : 'bg-(--marble-100) text-(--marble-600)'"
                    >
                      {{ holiday.isCustom ? 'Προσαρμ.' : holiday.isMovable ? 'Κινητή' : 'Σταθερή' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="badge"
                      :class="[0, 6].includes(holiday.date.getDay())
                        ? 'badge-warning'
                        : 'badge-success'"
                    >
                      {{ [0, 6].includes(holiday.date.getDay())
                        ? 'Σ/Κ'
                        : 'Ρεπό' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-fade-in-up,
.modal-leave-active .animate-fade-in-up {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .animate-fade-in-up {
  transform: translateY(20px);
  opacity: 0;
}
</style>
