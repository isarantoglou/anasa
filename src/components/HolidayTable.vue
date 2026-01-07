<script setup lang="ts">
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { Holiday } from '../types'

defineProps<{
  currentYear: number
  allHolidays: Holiday[]
}>()
</script>

<template>
  <section class="animate-fade-in-up delay-300">
    <div class="card-elevated overflow-hidden">
      <div class="px-6 py-5 border-b border-(--marble-200) bg-(--marble-50)">
        <h2 class="heading-section">Πλήρες Ημερολόγιο Αργιών {{ currentYear }}</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-(--marble-50)">
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
  </section>
</template>
