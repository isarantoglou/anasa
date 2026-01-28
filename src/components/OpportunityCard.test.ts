import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OpportunityCard from './OpportunityCard.vue'
import type { OptimizationResult, DayInfo } from '../types'

// Helper to create a mock opportunity
function createMockOpportunity(overrides: Partial<OptimizationResult> = {}): OptimizationResult {
  const startDate = new Date(2026, 3, 10) // April 10, 2026
  const endDate = new Date(2026, 3, 14) // April 14, 2026

  const days: DayInfo[] = [
    {
      date: new Date(2026, 3, 10),
      cost: 1,
      isHoliday: true,
      isWeekend: false,
      holidayName: 'Μεγάλη Παρασκευή',
    },
    { date: new Date(2026, 3, 11), cost: 0, isHoliday: false, isWeekend: true },
    {
      date: new Date(2026, 3, 12),
      cost: 0,
      isHoliday: true,
      isWeekend: true,
      holidayName: 'Πάσχα',
    },
    {
      date: new Date(2026, 3, 13),
      cost: 0,
      isHoliday: true,
      isWeekend: false,
      holidayName: 'Δευτέρα Πάσχα',
    },
    { date: new Date(2026, 3, 14), cost: 1, isHoliday: false, isWeekend: false },
  ]

  return {
    range: { startDate, endDate },
    totalDays: 5,
    leaveDaysRequired: 2,
    freeDays: 3,
    efficiency: 2.5,
    efficiencyLabel: 'Κάντε 2 ημέρες 5',
    days,
    ...overrides,
  }
}

describe('OpportunityCard', () => {
  const defaultProps = {
    opportunity: createMockOpportunity(),
    index: 0,
    sortByDate: false,
    parentMode: false,
    isInPlan: false,
    isGeneratingImage: false,
    currentYear: 2026,
  }

  describe('rendering', () => {
    it('should render the opportunity card', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.exists()).toBe(true)
    })

    it('should display the date range', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.text()).toContain('10 Απρ')
      expect(wrapper.text()).toContain('14 Απρ')
    })

    it('should display efficiency badge', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.text()).toContain('2.5x')
    })

    it('should display stats (leave days, total days, free days)', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.text()).toContain('2') // leave days
      expect(wrapper.text()).toContain('5') // total days
      expect(wrapper.text()).toContain('3') // free days
    })

    it('should display efficiency label', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.text()).toContain('Κάντε 2 ημέρες 5')
    })

    it('should display day indicators', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const dayIndicators = wrapper.findAll('.day-indicator')
      expect(dayIndicators.length).toBe(5)
    })
  })

  describe('rank display', () => {
    it('should show "Καλύτερη Επιλογή" for index 0 when not sorted by date', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 0 } })
      expect(wrapper.text()).toContain('Καλύτερη Επιλογή')
    })

    it('should show "#2" for index 1 when not sorted by date', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 1 } })
      expect(wrapper.text()).toContain('#2')
    })

    it('should show "#3" for index 2 when not sorted by date', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 2 } })
      expect(wrapper.text()).toContain('#3')
    })

    it('should show month name when sorted by date', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, sortByDate: true } })
      // Greek locale uses genitive case "Απριλίου" for month names in this format
      expect(wrapper.text()).toContain('Απριλίου')
    })
  })

  describe('rank styling', () => {
    it('should have gold styling for index 0', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 0 } })
      const header = wrapper.find('.rank-gold')
      expect(header.exists()).toBe(true)
    })

    it('should have silver styling for index 1', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 1 } })
      const header = wrapper.find('.rank-silver')
      expect(header.exists()).toBe(true)
    })

    it('should have bronze styling for index 2', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 2 } })
      const header = wrapper.find('.rank-bronze')
      expect(header.exists()).toBe(true)
    })

    it('should have default styling for index > 2', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, index: 5 } })
      const header = wrapper.find('.rank-default')
      expect(header.exists()).toBe(true)
    })

    it('should have default styling when sorted by date', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, sortByDate: true } })
      const header = wrapper.find('.rank-default')
      expect(header.exists()).toBe(true)
    })
  })

  describe('day styling', () => {
    it('should apply holiday class to holiday days', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const holidayDays = wrapper.findAll('.day-holiday')
      expect(holidayDays.length).toBeGreaterThan(0)
    })

    it('should apply weekend class to weekend days', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const weekendDays = wrapper.findAll('.day-weekend')
      expect(weekendDays.length).toBeGreaterThan(0)
    })

    it('should apply workday class to workdays', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const workdays = wrapper.findAll('.day-workday')
      expect(workdays.length).toBeGreaterThan(0)
    })
  })

  describe('button states', () => {
    it('should show "Προσθήκη στο Πλάνο" button when not in plan', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, isInPlan: false } })
      expect(wrapper.text()).toContain('Προσθήκη στο Πλάνο')
    })

    it('should show "Στο Πλάνο" button when in plan', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, isInPlan: true } })
      expect(wrapper.text()).toContain('Στο Πλάνο')
    })

    it('should disable share button when generating image', () => {
      const wrapper = mount(OpportunityCard, {
        props: { ...defaultProps, isGeneratingImage: true },
      })
      const shareButton = wrapper
        .findAll('button')
        .find((b) => b.attributes('disabled') !== undefined)
      expect(shareButton).toBeDefined()
    })
  })

  describe('events', () => {
    it('should emit addToPlan when add button is clicked', async () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const addButton = wrapper.findAll('button').find((b) => b.text().includes('Προσθήκη'))
      await addButton!.trigger('click')
      expect(wrapper.emitted('addToPlan')).toBeTruthy()
      expect(wrapper.emitted('addToPlan')![0]).toEqual([defaultProps.opportunity])
    })

    it('should emit shareAsImage when share button is clicked', async () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const buttons = wrapper.findAll('button')
      const shareButton = buttons[buttons.length - 1]! // Last button is share
      await shareButton.trigger('click')
      expect(wrapper.emitted('shareAsImage')).toBeTruthy()
      expect(wrapper.emitted('shareAsImage')![0]).toEqual([defaultProps.opportunity])
    })

    it('should not emit addToPlan when already in plan', async () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, isInPlan: true } })
      const buttons = wrapper.findAll('button')
      // The first button should be the "Στο Πλάνο" button which doesn't have click handler for adding
      await buttons[0]!.trigger('click')
      expect(wrapper.emitted('addToPlan')).toBeFalsy()
    })
  })

  describe('parent mode', () => {
    it('should not show school break badge when parent mode is off', () => {
      const wrapper = mount(OpportunityCard, { props: { ...defaultProps, parentMode: false } })
      expect(wrapper.text()).not.toContain('ημέρες με τα παιδιά')
    })

    it('should show school break badge when parent mode is on and there is overlap', () => {
      // Create opportunity during Easter break (Palm Sunday to week after Easter)
      const easterOpportunity = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 5), // During Easter break
          endDate: new Date(2026, 3, 19),
        },
      })
      const wrapper = mount(OpportunityCard, {
        props: { ...defaultProps, opportunity: easterOpportunity, parentMode: true },
      })
      expect(wrapper.text()).toContain('ημέρες με τα παιδιά')
    })

    it('should show school break name when there is overlap', () => {
      const easterOpportunity = createMockOpportunity({
        range: {
          startDate: new Date(2026, 3, 5),
          endDate: new Date(2026, 3, 19),
        },
      })
      const wrapper = mount(OpportunityCard, {
        props: { ...defaultProps, opportunity: easterOpportunity, parentMode: true },
      })
      expect(wrapper.text()).toContain('Διακοπές Πάσχα')
    })
  })

  describe('tooltip', () => {
    it('should have efficiency tooltip with correct information', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      const tooltip = wrapper.find('.tooltip')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('2.5x απόδοση')
      expect(tooltip.text()).toContain('2 ημέρες άδειας')
      expect(tooltip.text()).toContain('5 συνολικές ημέρες')
    })
  })

  describe('legend', () => {
    it('should display day type legend', () => {
      const wrapper = mount(OpportunityCard, { props: defaultProps })
      expect(wrapper.text()).toContain('Εργάσιμη')
      expect(wrapper.text()).toContain('Σ/Κ')
      expect(wrapper.text()).toContain('Αργία')
    })
  })
})
