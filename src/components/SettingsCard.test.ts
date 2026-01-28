import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsCard from './SettingsCard.vue'
import type { SchoolBreak } from '../data/schoolHolidays'

// Helper to create mock school breaks
function createMockSchoolBreaks(): SchoolBreak[] {
  return [
    {
      id: 'christmas-2026',
      name: 'Christmas Break',
      nameGreek: 'Χριστουγεννιάτικες Διακοπές',
      startDate: new Date(2025, 11, 24),
      endDate: new Date(2026, 0, 7),
      icon: '🎄'
    },
    {
      id: 'easter-2026',
      name: 'Easter Break',
      nameGreek: 'Πασχαλινές Διακοπές',
      startDate: new Date(2026, 3, 6),
      endDate: new Date(2026, 3, 21),
      icon: '🐣'
    }
  ]
}

describe('SettingsCard', () => {
  const defaultProps = {
    currentYear: 2026,
    calculateFromToday: false,
    includeHolySpirit: true,
    parentMode: false,
    totalAnnualLeaveDays: 25,
    searchLeaveDays: 5,
    remainingLeaveDays: 20,
    annualPlanLength: 1,
    showingFromToday: false,
    effectiveStartLabel: '1 Ιανουαρίου 2026',
    schoolBreaks: createMockSchoolBreaks(),
    stats: {
      workdays: 251,
      weekendDays: 104,
      holidayDays: 10,
      freeDays: 114
    }
  }

  it('should render settings card title', () => {
    const wrapper = mount(SettingsCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Ρυθμίσεις')
  })

  describe('Year Picker', () => {
    it('should display current year in the center', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('2026')
    })

    it('should display year range centered on current year', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('2024')
      expect(wrapper.text()).toContain('2025')
      expect(wrapper.text()).toContain('2026')
      expect(wrapper.text()).toContain('2027')
      expect(wrapper.text()).toContain('2028')
    })

    it('should emit update:currentYear when year is changed', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const yearButton = wrapper.findAll('button').find(b => b.text() === '2027')
      await yearButton?.trigger('click')

      expect(wrapper.emitted('update:currentYear')).toBeTruthy()
      expect(wrapper.emitted('update:currentYear')?.[0]).toEqual([2027])
    })

    it('should emit update:currentYear when arrow buttons are clicked', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Προηγούμενο έτος"]')
      await prevButton.trigger('click')

      expect(wrapper.emitted('update:currentYear')?.[0]).toEqual([2025])
    })

    it('should show comparison button', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Σύγκριση')
    })

    it('should emit toggle-year-comparison when comparison is clicked', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const compareLink = wrapper.findAll('button').find(b => b.text().includes('Σύγκριση'))
      await compareLink?.trigger('click')

      expect(wrapper.emitted('toggle-year-comparison')).toHaveLength(1)
    })
  })

  describe('Calculate From Toggle', () => {
    it('should display toggle options', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Υπολογισμός Από')
      expect(wrapper.text()).toContain('Σήμερα')
      expect(wrapper.text()).toContain('1 Ιανουαρίου')
    })

    it('should emit update:calculateFromToday when toggled', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const todayButton = wrapper.findAll('button').find(b => b.text() === 'Σήμερα')
      await todayButton?.trigger('click')

      expect(wrapper.emitted('update:calculateFromToday')?.[0]).toEqual([true])
    })

    it('should show effective start label when calculating from today', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, showingFromToday: true, effectiveStartLabel: '15 Μαρτίου 2026' }
      })

      expect(wrapper.text()).toContain('15 Μαρτίου 2026')
    })
  })

  describe('Holy Spirit Toggle', () => {
    it('should display toggle', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Αγίου Πνεύματος')
    })

    it('should show correct text when enabled', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Η εταιρεία σας δίνει αργία')
    })

    it('should show correct text when disabled', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, includeHolySpirit: false }
      })

      expect(wrapper.text()).toContain('Η εταιρεία σας ΔΕΝ δίνει αργία')
    })

    it('should emit update:includeHolySpirit when toggled', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      // Find the toggle button for Holy Spirit (it's a button with relative class)
      const toggleButtons = wrapper.findAll('button.relative')
      const holySpiritToggle = toggleButtons[0]
      await holySpiritToggle?.trigger('click')

      expect(wrapper.emitted('update:includeHolySpirit')?.[0]).toEqual([false])
    })
  })

  describe('Parent Mode Toggle', () => {
    it('should display toggle', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Λειτουργία Γονέα')
    })

    it('should show school breaks when parent mode is enabled', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, parentMode: true }
      })

      expect(wrapper.text()).toContain('Χριστουγεννιάτικες Διακοπές')
      expect(wrapper.text()).toContain('Πασχαλινές Διακοπές')
    })

    it('should not show school breaks when parent mode is disabled', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).not.toContain('Χριστουγεννιάτικες Διακοπές')
    })

    it('should emit update:parentMode when toggled', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const toggleButtons = wrapper.findAll('button.relative')
      const parentModeToggle = toggleButtons[1]
      await parentModeToggle?.trigger('click')

      expect(wrapper.emitted('update:parentMode')?.[0]).toEqual([true])
    })
  })

  describe('Total Annual Leave Days', () => {
    it('should display input field', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Συνολικές Ημέρες Άδειας')
      const input = wrapper.find('#totalLeaveDays')
      expect(input.exists()).toBe(true)
    })

    it('should show quick select buttons', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('20')
      expect(wrapper.text()).toContain('25')
      expect(wrapper.text()).toContain('30')
    })

    it('should emit update:totalAnnualLeaveDays when quick select clicked', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const quickSelectButtons = wrapper.findAll('button').filter(b => b.text() === '30')
      await quickSelectButtons[0]?.trigger('click')

      expect(wrapper.emitted('update:totalAnnualLeaveDays')?.[0]).toEqual([30])
    })
  })

  describe('Search Leave Days', () => {
    it('should display input field', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Αναζήτηση με Ημέρες')
      const input = wrapper.find('#searchDays')
      expect(input.exists()).toBe(true)
    })

    it('should show quick select buttons', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('15')
    })

    it('should show warning when search exceeds remaining days', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, searchLeaveDays: 25, remainingLeaveDays: 10, annualPlanLength: 1 }
      })

      expect(wrapper.text()).toContain('Αναζητάτε 25 ημέρες αλλά έχετε μόνο 10 διαθέσιμες')
    })

    it('should not show warning when search is within remaining days', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).not.toContain('Αναζητάτε')
    })

    it('should not show warning when annual plan is empty', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, searchLeaveDays: 30, remainingLeaveDays: 25, annualPlanLength: 0 }
      })

      expect(wrapper.text()).not.toContain('Αναζητάτε')
    })
  })

  describe('Year Stats', () => {
    it('should display all stats', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Εργάσιμες')
      expect(wrapper.text()).toContain('251')
      expect(wrapper.text()).toContain('Σ/Κ')
      expect(wrapper.text()).toContain('104')
      expect(wrapper.text()).toContain('Αργίες')
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('Ελεύθερες')
      expect(wrapper.text()).toContain('114')
    })

    it('should show correct header for full year', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Επισκόπηση Έτους')
    })

    it('should show correct header when showing from today', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, showingFromToday: true }
      })

      expect(wrapper.text()).toContain('Υπόλοιπο 2026')
    })
  })

  describe('Input Validation', () => {
    describe('Total Annual Leave Days Input', () => {
      it('should have min attribute set to 1', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#totalLeaveDays')
        expect(input.attributes('min')).toBe('1')
      })

      it('should have max attribute set to 50', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#totalLeaveDays')
        expect(input.attributes('max')).toBe('50')
      })

      it('should emit event when input value changes', async () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#totalLeaveDays')

        await input.setValue('30')

        expect(wrapper.emitted('update:totalAnnualLeaveDays')).toBeTruthy()
      })

      it('should display current value from props', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, totalAnnualLeaveDays: 22 }
        })
        const input = wrapper.find('#totalLeaveDays')
        expect((input.element as HTMLInputElement).value).toBe('22')
      })

      it('should handle value of 1 (minimum)', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, totalAnnualLeaveDays: 1 }
        })
        const input = wrapper.find('#totalLeaveDays')
        expect((input.element as HTMLInputElement).value).toBe('1')
      })

      it('should handle max value (50)', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, totalAnnualLeaveDays: 50 }
        })
        const input = wrapper.find('#totalLeaveDays')
        expect((input.element as HTMLInputElement).value).toBe('50')
      })
    })

    describe('Search Leave Days Input', () => {
      it('should have min attribute set to 1', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#searchDays')
        expect(input.attributes('min')).toBe('1')
      })

      it('should have max attribute set to 30', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#searchDays')
        expect(input.attributes('max')).toBe('30')
      })

      it('should emit event when input value changes', async () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#searchDays')

        await input.setValue('10')

        expect(wrapper.emitted('update:searchLeaveDays')).toBeTruthy()
      })

      it('should display current value from props', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, searchLeaveDays: 7 }
        })
        const input = wrapper.find('#searchDays')
        expect((input.element as HTMLInputElement).value).toBe('7')
      })

      it('should handle value of 1 (minimum)', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, searchLeaveDays: 1 }
        })
        const input = wrapper.find('#searchDays')
        expect((input.element as HTMLInputElement).value).toBe('1')
      })

      it('should handle value of 30 (maximum)', () => {
        const wrapper = mount(SettingsCard, {
          props: { ...defaultProps, searchLeaveDays: 30 }
        })
        const input = wrapper.find('#searchDays')
        expect((input.element as HTMLInputElement).value).toBe('30')
      })
    })

    describe('Input Type Validation', () => {
      it('total leave days input should be type number', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#totalLeaveDays')
        expect(input.attributes('type')).toBe('number')
      })

      it('search leave days input should be type number', () => {
        const wrapper = mount(SettingsCard, { props: defaultProps })
        const input = wrapper.find('#searchDays')
        expect(input.attributes('type')).toBe('number')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero remaining days', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, remainingLeaveDays: 0, annualPlanLength: 5 }
      })
      // Should render without error
      expect(wrapper.text()).toContain('Ρυθμίσεις')
    })

    it('should handle empty school breaks array', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, parentMode: true, schoolBreaks: [] }
      })
      // Should render without error in parent mode with no breaks
      expect(wrapper.text()).toContain('Λειτουργία Γονέα')
    })

    it('should handle stats with zero values', () => {
      const wrapper = mount(SettingsCard, {
        props: {
          ...defaultProps,
          stats: { workdays: 0, weekendDays: 0, holidayDays: 0, freeDays: 0 }
        }
      })
      expect(wrapper.text()).toContain('0')
    })

    it('should not emit year change when clicking current year', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const currentYearButton = wrapper.findAll('button').find(b => b.text() === '2026')
      await currentYearButton?.trigger('click')

      // Should not emit since it's already the current year
      expect(wrapper.emitted('update:currentYear')).toBeFalsy()
    })

    it('should handle very long effective start label', () => {
      const wrapper = mount(SettingsCard, {
        props: {
          ...defaultProps,
          showingFromToday: true,
          effectiveStartLabel: 'Πολύ μεγάλη ημερομηνία που είναι δύσκολο να χωρέσει'
        }
      })
      expect(wrapper.text()).toContain('Πολύ μεγάλη ημερομηνία')
    })
  })

  describe('Year Navigation', () => {
    it('should emit previous year when prev button clicked', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Προηγούμενο έτος"]')
      await prevButton.trigger('click')

      expect(wrapper.emitted('update:currentYear')?.[0]).toEqual([2025])
    })

    it('should emit next year when next button clicked', async () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const nextButton = wrapper.find('button[aria-label="Επόμενο έτος"]')
      await nextButton.trigger('click')

      expect(wrapper.emitted('update:currentYear')?.[0]).toEqual([2027])
    })

    it('should display years in correct range (current ± 3)', () => {
      const wrapper = mount(SettingsCard, {
        props: { ...defaultProps, currentYear: 2030 }
      })

      expect(wrapper.text()).toContain('2027')
      expect(wrapper.text()).toContain('2028')
      expect(wrapper.text()).toContain('2029')
      expect(wrapper.text()).toContain('2030')
      expect(wrapper.text()).toContain('2031')
      expect(wrapper.text()).toContain('2032')
      expect(wrapper.text()).toContain('2033')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible labels for navigation buttons', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Προηγούμενο έτος"]')
      const nextButton = wrapper.find('button[aria-label="Επόμενο έτος"]')

      expect(prevButton.exists()).toBe(true)
      expect(nextButton.exists()).toBe(true)
    })

    it('should have labels for input fields', () => {
      const wrapper = mount(SettingsCard, { props: defaultProps })

      const totalLabel = wrapper.find('label[for="totalLeaveDays"]')
      const searchLabel = wrapper.find('label[for="searchDays"]')

      expect(totalLabel.exists()).toBe(true)
      expect(searchLabel.exists()).toBe(true)
    })
  })
})
