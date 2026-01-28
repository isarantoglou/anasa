<script setup lang="ts">
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { SavedOpportunity, DateRange } from '../../types'

defineProps<{
  annualPlan: SavedOpportunity[]
  currentYear: number
  annualPlanTotalDays: number
  remainingLeaveDays: number
  totalAnnualLeaveDays: number
}>()

// Format date range for display
function formatDateRangeShort(range: DateRange): string {
  const start = format(range.startDate, 'd MMM', { locale: el })
  const end = format(range.endDate, 'd MMM', { locale: el })
  return `${start} - ${end}`
}
</script>

<template>
  <!-- Hidden Share Card for Annual Plan Image Generation -->
  <div
    v-if="annualPlan.length > 0"
    style="position: fixed; left: -9999px; top: 0"
    aria-hidden="true"
  >
    <div
      id="annual-plan-share-card"
      style="
        width: 450px;
        background-color: #ffffff;
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        color: #1f2937;
        border-radius: 16px;
        overflow: hidden;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      "
    >
      <!-- Card Header with Aegean Blue Gradient -->
      <div
        style="padding: 20px 24px; background: linear-gradient(135deg, #1976d2 0%, #0d4f8b 100%)"
      >
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div>
            <span
              style="
                color: rgba(255, 255, 255, 0.85);
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.05em;
              "
            >
              ΕΤΗΣΙΟ ΠΛΑΝΟ ΑΔΕΙΩΝ
            </span>
            <p style="font-size: 24px; font-weight: 700; margin: 4px 0 0 0; color: #ffffff">
              {{ currentYear }}
            </p>
          </div>
          <!-- Summary Badge -->
          <div style="text-align: right">
            <div
              style="
                padding: 8px 16px;
                border-radius: 12px;
                background-color: rgba(255, 255, 255, 0.2);
              "
            >
              <div style="font-size: 20px; font-weight: 700; color: #ffffff">
                {{ annualPlanTotalDays }}
              </div>
              <div style="font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.85)">
                ΗΜΕΡΕΣ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div style="padding: 24px">
        <!-- Stats Row -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px">
          <!-- Total Leave Days -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 12px 8px;
              border-radius: 12px;
              background-color: #e3f2fd;
              border: 1px solid #bbdefb;
            "
          >
            <div style="font-size: 24px; font-weight: 700; color: #1565c0; line-height: 1">
              {{ totalAnnualLeaveDays }}
            </div>
            <div
              style="
                font-size: 9px;
                font-weight: 600;
                color: #1565c0;
                text-transform: uppercase;
                margin-top: 4px;
              "
            >
              ΣΥΝΟΛΟ
            </div>
          </div>
          <!-- Used Days -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 12px 8px;
              border-radius: 12px;
              background-color: #fef3c7;
              border: 1px solid #fde68a;
            "
          >
            <div style="font-size: 24px; font-weight: 700; color: #b45309; line-height: 1">
              {{ annualPlanTotalDays }}
            </div>
            <div
              style="
                font-size: 9px;
                font-weight: 600;
                color: #b45309;
                text-transform: uppercase;
                margin-top: 4px;
              "
            >
              ΧΡΗΣΙΜ.
            </div>
          </div>
          <!-- Remaining Days -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 12px 8px;
              border-radius: 12px;
              background-color: #dcfce7;
              border: 1px solid #bbf7d0;
            "
          >
            <div style="font-size: 24px; font-weight: 700; color: #15803d; line-height: 1">
              {{ remainingLeaveDays }}
            </div>
            <div
              style="
                font-size: 9px;
                font-weight: 600;
                color: #15803d;
                text-transform: uppercase;
                margin-top: 4px;
              "
            >
              ΥΠΟΛΟΙΠΟ
            </div>
          </div>
        </div>

        <!-- Plan Items -->
        <div style="margin-bottom: 16px">
          <div
            style="
              font-size: 10px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
            "
          >
            Προγραμματισμένες Άδειες ({{ annualPlan.length }})
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <div
              v-for="(opp, index) in annualPlan"
              :key="opp.id"
              style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 10px;
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
              "
            >
              <!-- Number Badge -->
              <div
                style="
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  background-color: #1976d2;
                  color: #ffffff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: 700;
                  flex-shrink: 0;
                "
              >
                {{ index + 1 }}
              </div>
              <!-- Period Info -->
              <div style="flex: 1; min-width: 0">
                <div style="display: flex; align-items: center; gap: 8px">
                  <span style="font-size: 13px; font-weight: 600; color: #374151">
                    {{ formatDateRangeShort(opp.range) }}
                  </span>
                  <span
                    v-if="opp.isCustom"
                    style="
                      padding: 2px 6px;
                      border-radius: 4px;
                      background-color: #fdf0ed;
                      color: #d66853;
                      font-size: 9px;
                      font-weight: 600;
                    "
                  >
                    CUSTOM
                  </span>
                </div>
                <div v-if="opp.label" style="font-size: 11px; color: #d66853; margin-top: 2px">
                  {{ opp.label }}
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px">
                  {{ opp.leaveDaysRequired }} ημέρες άδειας → {{ opp.totalDays }} ημέρες ελεύθερες
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          style="
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <p style="font-size: 12px; color: #9ca3af; margin: 0">
            Δημιουργήθηκε με το <span style="font-weight: 600; color: #1e3a5f">Ανάσα</span> •
            anasa.oxygen.gr
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
