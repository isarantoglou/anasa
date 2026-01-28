import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnualPlanSection from './AnnualPlanSection.vue'
import type { SavedOpportunity, DateRange, Holiday } from '../types'

// Mock holidays for CustomPeriodForm
const mockHolidays: Holiday[] = [
  {
    date: new Date(2026, 0, 1),
    name: "New Year's Day",
    nameGreek: 'Πρωτοχρονιά',
    isMovable: false,
    isCustom: false,
  },
]

// Helper to create mock opportunity
function createMockOpportunity(overrides: Partial<SavedOpportunity> = {}): SavedOpportunity {
  return {
    id: 'test-id',
    range: {
      startDate: new Date(2026, 0, 5),
      endDate: new Date(2026, 0, 11),
    },
    totalDays: 7,
    leaveDaysRequired: 5,
    freeDays: 2,
    efficiency: 1.4,
    efficiencyLabel: '2 ημέρες δωρεάν',
    days: [],
    addedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Mock formatDateRange function
function formatDateRange(range: DateRange) {
  return `${range.startDate.getDate()}/${range.startDate.getMonth() + 1} - ${range.endDate.getDate()}/${range.endDate.getMonth() + 1}`
}

describe('AnnualPlanSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 8))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    currentYear: 2026,
    annualPlan: [] as SavedOpportunity[],
    annualPlanTotalDays: 0,
    remainingLeaveDays: 25,
    formatDateRange,
    holidays: mockHolidays,
  }

  it('should render section title', () => {
    const wrapper = mount(AnnualPlanSection, { props: defaultProps })

    expect(wrapper.text()).toContain('Ετήσιο Πλάνο Αδειών 2026')
  })

  it('should show subtitle', () => {
    const wrapper = mount(AnnualPlanSection, { props: defaultProps })

    expect(wrapper.text()).toContain('Οι επιλεγμένες περίοδοι άδειας')
  })

  describe('Stats Display', () => {
    it('should show used days', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: { ...defaultProps, annualPlanTotalDays: 10 },
      })

      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('Χρησιμ.')
    })

    it('should show remaining days', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: { ...defaultProps, remainingLeaveDays: 15 },
      })

      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('Υπόλοιπο')
    })

    it('should show negative remaining days in red', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: { ...defaultProps, remainingLeaveDays: -5 },
      })

      const remainingDiv = wrapper.findAll('.stat-number').find((d) => d.text() === '-5')
      expect(remainingDiv?.classes()).toContain('text-red-300')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when plan is empty', () => {
      const wrapper = mount(AnnualPlanSection, { props: defaultProps })

      expect(wrapper.text()).toContain('Προσθέστε ευκαιρίες από την παρακάτω λίστα')
    })

    it('should not show clear button when empty', () => {
      const wrapper = mount(AnnualPlanSection, { props: defaultProps })

      expect(wrapper.text()).not.toContain('Καθαρισμός')
    })
  })

  describe('Plan Items', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [
        createMockOpportunity({ id: '1', leaveDaysRequired: 5, totalDays: 7 }),
        createMockOpportunity({
          id: '2',
          range: { startDate: new Date(2026, 3, 6), endDate: new Date(2026, 3, 12) },
          leaveDaysRequired: 4,
          totalDays: 7,
        }),
      ],
      annualPlanTotalDays: 9,
      remainingLeaveDays: 16,
    }

    it('should display all plan items', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('5/1 - 11/1')
      expect(wrapper.text()).toContain('6/4 - 12/4')
    })

    it('should show item numbers', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      const numberBadges = wrapper.findAll('.rounded-full.bg-\\(--aegean-600\\)')
      expect(numberBadges.length).toBe(2)
      expect(numberBadges[0]?.text()).toBe('1')
      expect(numberBadges[1]?.text()).toBe('2')
    })

    it('should show leave days and total days for each item', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('5 ημέρες άδειας')
      expect(wrapper.text()).toContain('4 ημέρες άδειας')
      expect(wrapper.text()).toContain('7 ημέρες ελεύθερες')
    })

    it('should show efficiency label', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('2 ημέρες δωρεάν')
    })

    it('should show clear button when plan has items', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('Καθαρισμός')
    })

    it('should emit clear-plan when clear button is clicked', async () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      const clearButton = wrapper.findAll('button').find((b) => b.text() === 'Καθαρισμός')
      await clearButton?.trigger('click')

      expect(wrapper.emitted('clear-plan')).toHaveLength(1)
    })

    it('should emit remove-from-plan when delete button is clicked', async () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      const deleteButtons = wrapper.findAll('button[class*="hover:text-(--terracotta-500)"]')
      await deleteButtons[0]?.trigger('click')

      expect(wrapper.emitted('remove-from-plan')).toBeTruthy()
      expect(wrapper.emitted('remove-from-plan')?.[0]).toEqual(['1'])
    })
  })

  describe('Action Buttons', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()],
      annualPlanTotalDays: 5,
    }

    it('should show export button when plan has items', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('Ημερολόγιο')
    })

    it('should show leave request button when plan has items', () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      expect(wrapper.text()).toContain('Αίτηση')
    })

    it('should not show action buttons when plan is empty', () => {
      const wrapper = mount(AnnualPlanSection, { props: defaultProps })

      expect(wrapper.text()).not.toContain('Ημερολόγιο')
      expect(wrapper.text()).not.toContain('Αίτηση')
    })

    it('should emit export-to-calendar when export is clicked', async () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      const exportButton = wrapper.findAll('button').find((b) => b.text().includes('Ημερολόγιο'))
      await exportButton?.trigger('click')

      expect(wrapper.emitted('export-to-calendar')).toHaveLength(1)
    })

    it('should emit show-leave-request when leave request is clicked', async () => {
      const wrapper = mount(AnnualPlanSection, { props: propsWithPlan })

      const requestButton = wrapper.findAll('button').find((b) => b.text().includes('Αίτηση'))
      await requestButton?.trigger('click')

      expect(wrapper.emitted('show-leave-request')).toHaveLength(1)
    })
  })

  describe('Custom Period Badge', () => {
    it('should show custom badge for custom periods', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity({ id: '1', isCustom: true })],
        },
      })

      expect(wrapper.find('[data-testid="custom-badge"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Προσαρμοσμένο')
    })

    it('should not show custom badge for regular periods', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity({ id: '1' })],
        },
      })

      expect(wrapper.find('[data-testid="custom-badge"]').exists()).toBe(false)
    })

    it('should show badge only for custom items in mixed list', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({ id: '1' }),
            createMockOpportunity({
              id: '2',
              isCustom: true,
              range: { startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 15) },
            }),
            createMockOpportunity({
              id: '3',
              range: { startDate: new Date(2026, 5, 10), endDate: new Date(2026, 5, 15) },
            }),
          ],
        },
      })

      const badges = wrapper.findAll('[data-testid="custom-badge"]')
      expect(badges).toHaveLength(1)
    })
  })

  describe('Custom Period Form', () => {
    it('should render CustomPeriodForm component', () => {
      const wrapper = mount(AnnualPlanSection, { props: defaultProps })

      expect(wrapper.text()).toContain('Προσθήκη Προσαρμοσμένης Περιόδου')
    })

    it('should show form even when plan is empty', () => {
      const wrapper = mount(AnnualPlanSection, { props: defaultProps })

      expect(wrapper.findComponent({ name: 'CustomPeriodForm' }).exists()).toBe(true)
    })
  })

  describe('Custom Period Label', () => {
    it('should display label for custom periods with label', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              id: '1',
              isCustom: true,
              label: 'Ταξίδι στην Αμερική',
            }),
          ],
        },
      })

      expect(wrapper.find('[data-testid="custom-label"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Ταξίδι στην Αμερική')
    })

    it('should not display label element when no label provided', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              id: '1',
              isCustom: true,
            }),
          ],
        },
      })

      expect(wrapper.find('[data-testid="custom-label"]').exists()).toBe(false)
    })

    it('should display label for regular periods with label', () => {
      const wrapper = mount(AnnualPlanSection, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              id: '1',
              label: 'Σημαντική Περίοδος',
            }),
          ],
        },
      })

      expect(wrapper.find('[data-testid="custom-label"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Σημαντική Περίοδος')
    })
  })
})
