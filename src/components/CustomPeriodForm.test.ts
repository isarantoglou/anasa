import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CustomPeriodForm from './CustomPeriodForm.vue'
import type { Holiday } from '../types'

// Mock holidays
const mockHolidays: Holiday[] = [
  {
    date: new Date(2026, 0, 1),
    name: "New Year's Day",
    nameGreek: 'Πρωτοχρονιά',
    isMovable: false,
    isCustom: false,
  },
  {
    date: new Date(2026, 0, 6),
    name: 'Epiphany',
    nameGreek: 'Θεοφάνια',
    isMovable: false,
    isCustom: false,
  },
]

describe('CustomPeriodForm', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 8)) // Jan 8, 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps = {
    currentYear: 2026,
    holidays: mockHolidays,
    remainingLeaveDays: 20,
  }

  it('should render collapsed by default', () => {
    const wrapper = mount(CustomPeriodForm, { props: defaultProps })

    expect(wrapper.text()).toContain('Προσθήκη Προσαρμοσμένης Περιόδου')
    expect(wrapper.find('[data-testid="custom-period-form"]').exists()).toBe(false)
  })

  it('should expand when toggle is clicked', async () => {
    const wrapper = mount(CustomPeriodForm, { props: defaultProps })

    await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

    expect(wrapper.find('[data-testid="custom-period-form"]').exists()).toBe(true)
  })

  it('should collapse when toggle is clicked again', async () => {
    const wrapper = mount(CustomPeriodForm, { props: defaultProps })

    await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')
    expect(wrapper.find('[data-testid="custom-period-form"]').exists()).toBe(true)

    await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')
    expect(wrapper.find('[data-testid="custom-period-form"]').exists()).toBe(false)
  })

  describe('Date Inputs', () => {
    it('should display both date inputs when expanded', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      expect(wrapper.find('[data-testid="start-date-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="end-date-input"]').exists()).toBe(true)
    })

    it('should have correct min/max attributes on date inputs', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.attributes('min')).toBe('2026-01-08') // Today
      expect(startInput.attributes('max')).toBe('2026-12-31')
      expect(endInput.attributes('max')).toBe('2026-12-31')
    })

    it('should update end date min when start date is selected', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      await startInput.setValue('2026-03-15')
      await flushPromises()

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      expect(endInput.attributes('min')).toBe('2026-03-15')
    })
  })

  describe('Validation', () => {
    it('should show error when start date is after end date', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-20')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-15')
      await flushPromises()

      expect(wrapper.find('[data-testid="validation-error"]').exists()).toBe(true)
      expect(wrapper.text()).toContain(
        'Η ημερομηνία έναρξης πρέπει να είναι πριν την ημερομηνία λήξης'
      )
    })

    it('should not show error when dates are empty', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      expect(wrapper.find('[data-testid="validation-error"]').exists()).toBe(false)
    })
  })

  describe('Preview', () => {
    it('should show preview when valid dates are selected', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      expect(wrapper.find('[data-testid="preview-stats"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Προεπισκόπηση')
    })

    it('should show correct stats in preview', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      // March 9-13, 2026 = Mon-Fri, 5 total days, 5 work days (no holidays)
      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      const preview = wrapper.find('[data-testid="preview-stats"]')
      expect(preview.text()).toContain('5') // Total days
      expect(preview.text()).toContain('Σύνολο')
      expect(preview.text()).toContain('Άδεια')
      expect(preview.text()).toContain('Δωρεάν')
      expect(preview.text()).toContain('Απόδοση')
    })

    it('should not show preview when dates are invalid', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-20')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-15')
      await flushPromises()

      expect(wrapper.find('[data-testid="preview-stats"]').exists()).toBe(false)
    })
  })

  describe('Warnings', () => {
    it('should show zero leave warning when period has no workdays', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      // March 14-15, 2026 = Saturday-Sunday
      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-14')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-15')
      await flushPromises()

      expect(wrapper.find('[data-testid="zero-leave-warning"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Η περίοδος δεν απαιτεί ημέρες άδειας')
    })

    it('should show exceeds remaining warning when period needs more days than available', async () => {
      const wrapper = mount(CustomPeriodForm, {
        props: {
          ...defaultProps,
          remainingLeaveDays: 2,
        },
      })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      // March 9-13, 2026 = 5 workdays, but only 2 remaining
      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      expect(wrapper.find('[data-testid="exceeds-warning"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Η περίοδος χρειάζεται')
      expect(wrapper.text()).toContain('αλλά έχετε μόνο 2 διαθέσιμες')
    })
  })

  describe('Add Button', () => {
    it('should be disabled when form is empty', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      const addButton = wrapper.find('[data-testid="add-period-button"]')
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('should be disabled when dates are invalid', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-20')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-15')
      await flushPromises()

      const addButton = wrapper.find('[data-testid="add-period-button"]')
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('should be enabled when dates are valid', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      const addButton = wrapper.find('[data-testid="add-period-button"]')
      expect(addButton.attributes('disabled')).toBeUndefined()
    })

    it('should emit add-custom-period event when clicked', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      expect(wrapper.emitted('add-custom-period')).toBeTruthy()
      expect(wrapper.emitted('add-custom-period')![0]).toBeDefined()
    })

    it('should reset form after adding period', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')
      await flushPromises()

      // Form should collapse
      expect(wrapper.find('[data-testid="custom-period-form"]').exists()).toBe(false)
    })

    it('should have correct button text', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      expect(wrapper.find('[data-testid="add-period-button"]').text()).toContain(
        'Προσθήκη στο Πλάνο'
      )
    })
  })

  describe('Emitted Event Data', () => {
    it('should emit OptimizationResult with correct structure', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      const emitted = wrapper.emitted('add-custom-period')![0]![0] as any
      expect(emitted).toHaveProperty('range')
      expect(emitted).toHaveProperty('totalDays')
      expect(emitted).toHaveProperty('leaveDaysRequired')
      expect(emitted).toHaveProperty('freeDays')
      expect(emitted).toHaveProperty('efficiency')
      expect(emitted).toHaveProperty('efficiencyLabel')
      expect(emitted).toHaveProperty('days')
    })
  })

  describe('Label Input', () => {
    it('should display label input when expanded', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      expect(wrapper.find('[data-testid="label-input"]').exists()).toBe(true)
    })

    it('should emit label with custom period', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await wrapper.find('[data-testid="label-input"]').setValue('Ταξίδι στην Αμερική')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      const emitted = wrapper.emitted('add-custom-period')![0]
      expect(emitted![1]).toBe('Ταξίδι στην Αμερική')
    })

    it('should emit empty label when not provided', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      const emitted = wrapper.emitted('add-custom-period')![0]
      expect(emitted![1]).toBe('')
    })

    it('should reset label after adding period', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await wrapper.find('[data-testid="label-input"]').setValue('Test Label')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')
      await flushPromises()

      // Expand again
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      const labelInput = wrapper.find('[data-testid="label-input"]')
      expect((labelInput.element as HTMLInputElement).value).toBe('')
    })

    it('should trim label whitespace', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await wrapper.find('[data-testid="label-input"]').setValue('  Ταξίδι  ')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      const emitted = wrapper.emitted('add-custom-period')![0]
      expect(emitted![1]).toBe('Ταξίδι')
    })

    it('should emit empty string for whitespace-only label', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      await wrapper.find('[data-testid="start-date-input"]').setValue('2026-03-09')
      await wrapper.find('[data-testid="end-date-input"]').setValue('2026-03-13')
      await wrapper.find('[data-testid="label-input"]').setValue('   ')
      await flushPromises()

      await wrapper.find('[data-testid="add-period-button"]').trigger('click')

      const emitted = wrapper.emitted('add-custom-period')![0]
      expect(emitted![1]).toBe('')
    })

    it('should have maxlength attribute on label input', async () => {
      const wrapper = mount(CustomPeriodForm, { props: defaultProps })
      await wrapper.find('[data-testid="custom-period-toggle"]').trigger('click')

      const labelInput = wrapper.find('[data-testid="label-input"]')
      expect(labelInput.attributes('maxlength')).toBe('50')
    })
  })
})
