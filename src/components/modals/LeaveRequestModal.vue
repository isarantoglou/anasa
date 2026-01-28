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
const showCopiedAlert = ref(false)

const leaveRequestText = computed(() => {
  if (props.annualPlan.length === 0) return ''

  const today = format(new Date(), 'd MMMM yyyy', { locale: el })
  const periods = [...props.annualPlan]
    .sort((a, b) => a.range.startDate.getTime() - b.range.startDate.getTime())
    .map((opp) => {
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
  showCopiedAlert.value = true
  setTimeout(() => {
    showCopiedAlert.value = false
  }, 2000)
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
    <div
      class="animate-fade-in-up relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-(--marble-white) shadow-2xl"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between border-b border-(--marble-200) bg-(--marble-50) px-6 py-4"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-(--terracotta-500)">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-(--marble-800)">Αίτηση Κανονικής Άδειας</h3>
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

      <!-- Modal Body -->
      <div class="max-h-[60vh] overflow-y-auto p-6">
        <!-- Reason Input -->
        <div class="mb-4">
          <label class="mb-2 block text-sm font-semibold text-(--marble-600)">Λόγος Άδειας</label>
          <input
            v-model="leaveRequestReason"
            type="text"
            placeholder="π.χ., Προσωπικοί λόγοι, Οικογενειακές υποχρεώσεις..."
            class="input-elegant"
          />
        </div>

        <!-- Generated Text -->
        <div class="mb-4">
          <label class="mb-2 block text-sm font-semibold text-(--marble-600)"
            >Κείμενο Αίτησης</label
          >
          <textarea
            :value="leaveRequestText"
            readonly
            class="h-64 w-full resize-none rounded-xl border border-(--marble-200) bg-(--marble-50) px-4 py-3 font-mono text-sm text-(--marble-700) focus:outline-none"
          ></textarea>
        </div>
      </div>

      <!-- Copy Success Alert -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="showCopiedAlert"
          class="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-(--success-600) px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Αντιγράφηκε!
        </div>
      </Transition>

      <!-- Modal Footer -->
      <div class="flex gap-3 border-t border-(--marble-200) bg-(--marble-50) px-6 py-4">
        <button
          @click="copyLeaveRequest"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--aegean-600) px-4 py-3 font-semibold text-white transition-colors hover:bg-(--aegean-700)"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Αντιγραφή
        </button>
        <button
          @click="downloadLeaveRequest"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--terracotta-500) px-4 py-3 font-semibold text-white transition-colors hover:bg-(--terracotta-600)"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Λήψη
        </button>
      </div>
    </div>
  </div>
</template>
