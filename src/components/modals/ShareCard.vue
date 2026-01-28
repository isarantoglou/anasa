<script setup lang="ts">
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import type { OptimizationResult, DateRange } from '../../types'

defineProps<{
  opportunity: OptimizationResult | null
  currentYear: number // kept for API compatibility
  formatDateRange: (range: DateRange) => string
}>()

// Format date range without year (to match the actual card)
function formatDateRangeShort(range: DateRange): string {
  const start = format(range.startDate, 'd MMM', { locale: el })
  const end = format(range.endDate, 'd MMM', { locale: el })
  return `${start} - ${end}`
}
</script>

<template>
  <!-- Hidden Share Card for Image Generation (uses only inline styles to avoid oklch) -->
  <div v-if="opportunity" style="position: fixed; left: -9999px; top: 0" aria-hidden="true">
    <div
      id="share-card"
      style="
        width: 400px;
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
      <!-- Card Header with Gold Gradient -->
      <div
        style="padding: 20px 24px; background: linear-gradient(135deg, #d4a84b 0%, #b8942a 100%)"
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
              ΚΑΛYΤΕΡΗ ΕΠΙΛΟΓH
            </span>
            <p style="font-size: 20px; font-weight: 600; margin: 4px 0 0 0; color: #ffffff">
              {{ formatDateRangeShort(opportunity.range) }}
            </p>
          </div>
          <!-- Efficiency Badge -->
          <div
            style="
              padding: 8px 16px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 700;
              background-color: rgba(255, 255, 255, 0.2);
              color: #ffffff;
            "
          >
            {{ opportunity.efficiency.toFixed(1) }}x
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div style="padding: 24px">
        <!-- Key Stats (3 columns with flexbox for proper centering) -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px">
          <!-- Leave Days - Yellow -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 14px 8px;
              border-radius: 12px;
              background-color: #fef3c7;
              border: 1px solid #fde68a;
            "
          >
            <div
              style="
                font-size: 28px;
                font-weight: 700;
                color: #b45309;
                line-height: 1;
                width: 100%;
                text-align: center;
              "
            >
              {{ opportunity.leaveDaysRequired }}
            </div>
            <div
              style="
                font-size: 10px;
                font-weight: 600;
                color: #b45309;
                text-transform: uppercase;
                margin-top: 6px;
                letter-spacing: 0.02em;
              "
            >
              ΑΔΕΙΑ
            </div>
          </div>
          <!-- Total Days - Green -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 14px 8px;
              border-radius: 12px;
              background-color: #dcfce7;
              border: 1px solid #bbf7d0;
            "
          >
            <div
              style="
                font-size: 28px;
                font-weight: 700;
                color: #15803d;
                line-height: 1;
                width: 100%;
                text-align: center;
              "
            >
              {{ opportunity.totalDays }}
            </div>
            <div
              style="
                font-size: 10px;
                font-weight: 600;
                color: #15803d;
                text-transform: uppercase;
                margin-top: 6px;
                letter-spacing: 0.02em;
              "
            >
              ΣΥΝΟΛΟ
            </div>
          </div>
          <!-- Free Days - Light Blue (Aegean) -->
          <div
            style="
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 14px 8px;
              border-radius: 12px;
              background-color: #e3f2fd;
              border: 1px solid #bbdefb;
            "
          >
            <div
              style="
                font-size: 28px;
                font-weight: 700;
                color: #1565c0;
                line-height: 1;
                width: 100%;
                text-align: center;
              "
            >
              {{ opportunity.freeDays }}
            </div>
            <div
              style="
                font-size: 10px;
                font-weight: 600;
                color: #1565c0;
                text-transform: uppercase;
                margin-top: 6px;
                letter-spacing: 0.02em;
              "
            >
              ΔΩΡΕΑΝ
            </div>
          </div>
        </div>

        <!-- Efficiency Label -->
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 16px;
            border-radius: 12px;
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            margin-bottom: 20px;
          "
        >
          <span style="font-size: 16px; font-weight: 600; color: #1e3a5f">
            {{ opportunity.efficiencyLabel }}
          </span>
        </div>

        <!-- Day Timeline -->
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
            Ανάλυση Ημερών
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <div
              v-for="(day, dayIndex) in opportunity.days"
              :key="dayIndex"
              :style="{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: day.isHoliday ? '#FDF0ED' : day.isWeekend ? '#E3F2FD' : '#FEF3C7',
                color: day.isHoliday ? '#D66853' : day.isWeekend ? '#1565C0' : '#78350F',
                border: day.isHoliday
                  ? '1px solid #F7DDD6'
                  : day.isWeekend
                    ? '1px solid #BBDEFB'
                    : '1px solid #E5D4A1',
              }"
            >
              {{ format(day.date, 'd') }}
            </div>
          </div>
          <!-- Legend -->
          <div style="display: flex; gap: 20px; margin-top: 14px; font-size: 11px">
            <div style="display: flex; align-items: center; gap: 6px">
              <div
                style="
                  width: 14px;
                  height: 14px;
                  border-radius: 4px;
                  background-color: #fef3c7;
                  border: 1px solid #e5d4a1;
                "
              ></div>
              <span style="color: #6b7280">Εργάσιμη</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px">
              <div
                style="
                  width: 14px;
                  height: 14px;
                  border-radius: 4px;
                  background-color: #e3f2fd;
                  border: 1px solid #bbdefb;
                "
              ></div>
              <span style="color: #6b7280">Σ/Κ</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px">
              <div
                style="
                  width: 14px;
                  height: 14px;
                  border-radius: 4px;
                  background-color: #fdf0ed;
                  border: 1px solid #f7ddd6;
                "
              ></div>
              <span style="color: #6b7280">Αργία</span>
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
