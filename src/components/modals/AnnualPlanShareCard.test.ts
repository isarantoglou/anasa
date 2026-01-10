import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnualPlanShareCard from './AnnualPlanShareCard.vue'
import type { SavedOpportunity } from '../../types'

// Helper to create mock opportunity
function createMockOpportunity(overrides: Partial<SavedOpportunity> = {}): SavedOpportunity {
  return {
    id: 'test-id-1',
    range: {
      startDate: new Date(2026, 0, 5),
      endDate: new Date(2026, 0, 11)
    },
    totalDays: 7,
    leaveDaysRequired: 4,
    freeDays: 3,
    efficiency: 1.75,
    efficiencyLabel: 'Κάντε 4 ημέρες 7',
    days: [],
    addedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('AnnualPlanShareCard', () => {
  const defaultProps = {
    annualPlan: [] as SavedOpportunity[],
    currentYear: 2026,
    annualPlanTotalDays: 0,
    remainingLeaveDays: 25,
    totalAnnualLeaveDays: 25
  }

  describe('Rendering conditions', () => {
    it('should not render when annualPlan is empty', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: defaultProps })

      expect(wrapper.find('#annual-plan-share-card').exists()).toBe(false)
    })

    it('should render when annualPlan has items', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity()]
        }
      })

      expect(wrapper.find('#annual-plan-share-card').exists()).toBe(true)
    })
  })

  describe('Hidden positioning (for html2canvas)', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()],
      annualPlanTotalDays: 4
    }

    it('should be positioned off-screen', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const hiddenDiv = wrapper.find('[style*="left: -9999px"]')
      expect(hiddenDiv.exists()).toBe(true)
    })

    it('should have position: fixed', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const hiddenDiv = wrapper.find('[style*="position: fixed"]')
      expect(hiddenDiv.exists()).toBe(true)
    })

    it('should have aria-hidden attribute', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const hiddenDiv = wrapper.find('[aria-hidden="true"]')
      expect(hiddenDiv.exists()).toBe(true)
    })
  })

  describe('Header display', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()],
      annualPlanTotalDays: 4
    }

    it('should display header label in Greek', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      expect(wrapper.text()).toContain('ΕΤΗΣΙΟ ΠΛΑΝΟ ΑΔΕΙΩΝ')
    })

    it('should display the current year', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      expect(wrapper.text()).toContain('2026')
    })

    it('should display different year when changed', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: { ...propsWithPlan, currentYear: 2027 }
      })

      expect(wrapper.text()).toContain('2027')
    })

    it('should display total days in header badge', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: { ...propsWithPlan, annualPlanTotalDays: 12 }
      })

      expect(wrapper.text()).toContain('12')
      expect(wrapper.text()).toContain('ΗΜΕΡΕΣ')
    })
  })

  describe('Statistics display', () => {
    const propsWithStats = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()],
      totalAnnualLeaveDays: 25,
      annualPlanTotalDays: 10,
      remainingLeaveDays: 15
    }

    it('should display total annual leave days', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithStats })

      expect(wrapper.text()).toContain('25')
      expect(wrapper.text()).toContain('ΣΥΝΟΛΟ')
    })

    it('should display used days', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithStats })

      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('ΧΡΗΣΙΜ.')
    })

    it('should display remaining days', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithStats })

      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('ΥΠΟΛΟΙΠΟ')
    })

    it('should handle zero remaining days', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...propsWithStats,
          annualPlanTotalDays: 25,
          remainingLeaveDays: 0
        }
      })

      expect(wrapper.text()).toContain('0')
    })

    it('should handle negative remaining days', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...propsWithStats,
          annualPlanTotalDays: 30,
          remainingLeaveDays: -5
        }
      })

      expect(wrapper.text()).toContain('-5')
    })
  })

  describe('Plan items display', () => {
    it('should display plan items count', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({ id: '1' }),
            createMockOpportunity({ id: '2' })
          ]
        }
      })

      expect(wrapper.text()).toContain('Προγραμματισμένες Άδειες (2)')
    })

    it('should display single plan item count correctly', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity()]
        }
      })

      expect(wrapper.text()).toContain('Προγραμματισμένες Άδειες (1)')
    })

    it('should display numbered badges for each item', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({ id: '1' }),
            createMockOpportunity({
              id: '2',
              range: { startDate: new Date(2026, 3, 5), endDate: new Date(2026, 3, 10) }
            }),
            createMockOpportunity({
              id: '3',
              range: { startDate: new Date(2026, 6, 1), endDate: new Date(2026, 6, 7) }
            })
          ]
        }
      })

      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('3')
    })

    it('should display leave days info for each item', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({ leaveDaysRequired: 5, totalDays: 9 })
          ]
        }
      })

      expect(wrapper.text()).toContain('5 ημέρες άδειας')
      expect(wrapper.text()).toContain('9 ημέρες ελεύθερες')
    })
  })

  describe('Date formatting', () => {
    it('should format dates in Greek locale', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              range: { startDate: new Date(2026, 0, 5), endDate: new Date(2026, 0, 11) }
            })
          ]
        }
      })

      // Greek month abbreviation for January
      expect(wrapper.text()).toContain('5 Ιαν')
      expect(wrapper.text()).toContain('11 Ιαν')
    })

    it('should format different months correctly', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              range: { startDate: new Date(2026, 7, 10), endDate: new Date(2026, 7, 20) }
            })
          ]
        }
      })

      // Greek month abbreviation for August
      expect(wrapper.text()).toContain('Αυγ')
    })

    it('should handle date range spanning months', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              range: { startDate: new Date(2026, 3, 28), endDate: new Date(2026, 4, 5) }
            })
          ]
        }
      })

      // Should show both April and May abbreviations in Greek
      expect(wrapper.text()).toContain('Απρ')
      expect(wrapper.text()).toContain('Μαΐ')
    })
  })

  describe('Custom period badge', () => {
    it('should display CUSTOM badge for custom periods', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity({ isCustom: true })]
        }
      })

      expect(wrapper.text()).toContain('CUSTOM')
    })

    it('should not display CUSTOM badge for regular periods', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity({ isCustom: false })]
        }
      })

      expect(wrapper.text()).not.toContain('CUSTOM')
    })

    it('should show badge only for custom items in mixed list', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({ id: '1', isCustom: false }),
            createMockOpportunity({
              id: '2',
              isCustom: true,
              range: { startDate: new Date(2026, 3, 5), endDate: new Date(2026, 3, 10) }
            }),
            createMockOpportunity({
              id: '3',
              isCustom: false,
              range: { startDate: new Date(2026, 6, 1), endDate: new Date(2026, 6, 7) }
            })
          ]
        }
      })

      // Count occurrences of CUSTOM
      const text = wrapper.text()
      const matches = text.match(/CUSTOM/g)
      expect(matches).toHaveLength(1)
    })
  })

  describe('Custom period label', () => {
    it('should display label for periods with label', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              isCustom: true,
              label: 'Ταξίδι στην Αμερική'
            })
          ]
        }
      })

      expect(wrapper.text()).toContain('Ταξίδι στην Αμερική')
    })

    it('should not display label element when no label provided', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [createMockOpportunity({ isCustom: true })]
        }
      })

      // Should not contain the label div (check structure)
      expect(wrapper.text()).not.toContain('Ταξίδι')
    })

    it('should handle special characters in label', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              label: 'Διακοπές & Χαλάρωση!'
            })
          ]
        }
      })

      expect(wrapper.text()).toContain('Διακοπές & Χαλάρωση!')
    })

    it('should display label for regular periods with label', () => {
      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: [
            createMockOpportunity({
              isCustom: false,
              label: 'Πάσχα'
            })
          ]
        }
      })

      expect(wrapper.text()).toContain('Πάσχα')
    })
  })

  describe('Footer display', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()]
    }

    it('should display app name in footer', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      expect(wrapper.text()).toContain('Ανάσα')
    })

    it('should display website in footer', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      expect(wrapper.text()).toContain('anasa.oxygen.gr')
    })

    it('should display creation text', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      expect(wrapper.text()).toContain('Δημιουργήθηκε με το')
    })
  })

  describe('Inline styles (html2canvas compatibility)', () => {
    const propsWithPlan = {
      ...defaultProps,
      annualPlan: [createMockOpportunity()]
    }

    it('should use inline styles for card background', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const cardElement = wrapper.find('#annual-plan-share-card')
      const style = cardElement.attributes('style')

      expect(style).toContain('background-color')
    })

    it('should have fixed width for consistent image generation', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const cardElement = wrapper.find('#annual-plan-share-card')
      const style = cardElement.attributes('style')

      expect(style).toContain('width: 450px')
    })

    it('should use explicit colors instead of CSS variables', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const cardElement = wrapper.find('#annual-plan-share-card')
      const style = cardElement.attributes('style')

      // Browser converts hex to rgb, so check for either format
      // Should use explicit colors, not var(--something)
      expect(style).toMatch(/background-color:\s*(#ffffff|rgb\(255,\s*255,\s*255\))/)
      expect(style).not.toContain('var(--')
    })

    it('should have border-radius for rounded corners', () => {
      const wrapper = mount(AnnualPlanShareCard, { props: propsWithPlan })

      const cardElement = wrapper.find('#annual-plan-share-card')
      const style = cardElement.attributes('style')

      expect(style).toContain('border-radius')
    })
  })

  describe('Multiple plan items', () => {
    it('should render all items correctly', () => {
      const plans = [
        createMockOpportunity({
          id: '1',
          range: { startDate: new Date(2026, 0, 5), endDate: new Date(2026, 0, 9) },
          leaveDaysRequired: 3,
          totalDays: 5
        }),
        createMockOpportunity({
          id: '2',
          range: { startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 19) },
          leaveDaysRequired: 4,
          totalDays: 7,
          isCustom: true,
          label: 'Πάσχα'
        }),
        createMockOpportunity({
          id: '3',
          range: { startDate: new Date(2026, 7, 10), endDate: new Date(2026, 7, 21) },
          leaveDaysRequired: 8,
          totalDays: 12
        })
      ]

      const wrapper = mount(AnnualPlanShareCard, {
        props: {
          ...defaultProps,
          annualPlan: plans,
          annualPlanTotalDays: 15,
          remainingLeaveDays: 10
        }
      })

      // Check all items are rendered
      expect(wrapper.text()).toContain('5 Ιαν')
      expect(wrapper.text()).toContain('13 Απρ')
      expect(wrapper.text()).toContain('10 Αυγ')

      // Check count
      expect(wrapper.text()).toContain('Προγραμματισμένες Άδειες (3)')

      // Check custom badge appears
      expect(wrapper.text()).toContain('CUSTOM')

      // Check label appears
      expect(wrapper.text()).toContain('Πάσχα')
    })
  })
})
