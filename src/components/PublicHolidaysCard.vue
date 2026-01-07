<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { Holiday } from '../types'

defineProps<{
  currentYear: number
  allHolidays: Holiday[]
  weekendHolidays: Holiday[]
}>()

// Weekend holidays expandable state
const weekendHolidaysExpanded = ref(false)
</script>

<template>
  <div class="card-elevated p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-(--aegean-600) flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h2 class="heading-card">Επίσημες Αργίες {{ currentYear }}</h2>
    </div>

    <div class="space-y-1 max-h-100 overflow-y-auto pr-2">
      <div
        v-for="holiday in allHolidays"
        :key="holiday.date.toISOString()"
        class="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-(--marble-100) transition-colors group"
      >
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-(--marble-700) text-sm">{{ holiday.nameGreek }}</div>
        </div>
        <div class="text-right ml-4">
          <div class="stat-number text-sm font-semibold text-(--aegean-600)">
            {{ format(holiday.date, 'd MMM', { locale: el }) }}
          </div>
          <span
            class="badge text-[10px] mt-1"
            :class="holiday.isCustom ? 'badge-terracotta' : holiday.isMovable ? 'badge-aegean' : 'bg-(--marble-100) text-(--marble-500)'"
          >
            {{ holiday.isCustom ? 'Προσαρμ.' : holiday.isMovable ? 'Κινητή' : 'Σταθερή' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Weekend Holidays - Expandable -->
    <div v-if="weekendHolidays.length > 0" class="mt-4 pt-4 border-t border-(--marble-200)">
      <button
        @click="weekendHolidaysExpanded = !weekendHolidaysExpanded"
        class="expandable-trigger w-full"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4 text-(--warning-500)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm text-(--warning-600)">{{ weekendHolidays.length }} αργί{{ weekendHolidays.length > 1 ? 'ες πέφτουν' : 'α πέφτει' }} Σαββατοκύριακο</span>
        </span>
        <svg
          class="w-4 h-4 text-(--marble-400) transition-transform duration-200"
          :class="{ 'rotate-180': weekendHolidaysExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Expandable content -->
      <div
        class="expandable-content"
        :class="{ expanded: weekendHolidaysExpanded }"
      >
        <div class="pt-3 space-y-2">
          <div
            v-for="holiday in weekendHolidays"
            :key="holiday.date.toISOString()"
            class="flex items-center justify-between py-2 px-3 rounded-lg bg-(--warning-100)/50"
          >
            <div>
              <div class="text-sm font-medium text-(--marble-700)">{{ holiday.nameGreek }}</div>
            </div>
            <div class="text-right">
              <div class="stat-number text-sm font-semibold text-(--warning-600)">
                {{ format(holiday.date, 'd MMM', { locale: el }) }}
              </div>
              <div class="text-xs text-(--marble-500)">
                {{ format(holiday.date, 'EEEE', { locale: el }) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
