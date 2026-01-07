<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { SavedOpportunity } from '../../types'

const props = defineProps<{
  show: boolean
  annualPlan: SavedOpportunity[]
  annualPlanTotalDays: number
  currentYear: number
}>()

const emit = defineEmits<{
  close: []
}>()

const leaveRequestReason = ref('Προσωπικοί λόγοι')

const leaveRequestText = computed(() => {
  if (props.annualPlan.length === 0) return ''

  const today = format(new Date(), 'd MMMM yyyy', { locale: el })
  const periods = props.annualPlan
    .sort((a, b) => a.range.startDate.getTime() - b.range.startDate.getTime())
    .map(opp => {
      const start = format(opp.range.startDate, 'd MMMM yyyy', { locale: el })
      const end = format(opp.range.endDate, 'd MMMM yyyy', { locale: el })
      return `• Από ${start} έως ${end} (${opp.leaveDaysRequired} εργάσιμες ημέρες)`
    })
    .join('\n')

  return `ΑΙΤΗΣΗ ΚΑΝΟΝΙΚΗΣ ΑΔΕΙΑΣ

Ημερομηνία: ${today}

Προς: Τμήμα Ανθρώπινου Δυναμικού

Θέμα: Αίτηση χορήγησης κανονικής άδειας

Παρακαλώ όπως μου χορηγηθεί κανονική άδεια για τις παρακάτω περιόδους:

${periods}

Συνολικές ημέρες άδειας: ${props.annualPlanTotalDays}

Λόγος: ${leaveRequestReason.value}

Παραμένω στη διάθεσή σας για οποιαδήποτε διευκρίνιση.

Με εκτίμηση,
[Ονοματεπώνυμο]
[Τμήμα/Θέση]`
})

function copyLeaveRequest() {
  navigator.clipboard.writeText(leaveRequestText.value)
}

function downloadLeaveRequest() {
  const blob = new Blob([leaveRequestText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `aitisi-adeias-${props.currentYear}.txt`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-(--marble-white) rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-(--marble-200) bg-(--marble-50) flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-(--terracotta-500) flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Αίτηση Κανονικής Άδειας</h3>
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

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <!-- Reason Input -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-(--marble-600) mb-2">Λόγος Άδειας</label>
          <input
            v-model="leaveRequestReason"
            type="text"
            placeholder="π.χ., Προσωπικοί λόγοι, Οικογενειακές υποχρεώσεις..."
            class="input-elegant"
          />
        </div>

        <!-- Generated Text -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-(--marble-600) mb-2">Κείμενο Αίτησης</label>
          <textarea
            :value="leaveRequestText"
            readonly
            class="w-full h-64 px-4 py-3 rounded-xl border border-(--marble-200) bg-(--marble-50) text-(--marble-700) font-mono text-sm resize-none focus:outline-none"
          ></textarea>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-(--marble-200) bg-(--marble-50) flex gap-3">
        <button
          @click="copyLeaveRequest"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-(--aegean-600) text-white font-semibold hover:bg-(--aegean-700) transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Αντιγραφή
        </button>
        <button
          @click="downloadLeaveRequest"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-(--terracotta-500) text-white font-semibold hover:bg-(--terracotta-600) transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Λήψη
        </button>
      </div>
    </div>
  </div>
</template>
