import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PublicHolidaysCard from './PublicHolidaysCard.vue'
import type { Holiday } from '../types'

// Helper to create mock holidays
function createMockHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    date: new Date(2026, 0, 1),
    name: 'Test Holiday',
    nameGreek: 'Δοκιμαστική Αργία',
    isMovable: false,
    isCustom: false,
    ...overrides
  }
}

describe('PublicHolidaysCard', () => {
  const defaultProps = {
    currentYear: 2026,
    allHolidays: [
      createMockHoliday({ date: new Date(2026, 0, 1), nameGreek: 'Πρωτοχρονιά' }),
      createMockHoliday({ date: new Date(2026, 0, 6), nameGreek: 'Θεοφάνεια' }),
      createMockHoliday({ date: new Date(2026, 3, 12), nameGreek: 'Κυριακή του Πάσχα', isMovable: true })
    ],
    weekendHolidays: [] as Holiday[]
  }

  it('should render the card title with current year', () => {
    const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Επίσημες Αργίες 2026')
  })

  it('should display all holidays', () => {
    const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Πρωτοχρονιά')
    expect(wrapper.text()).toContain('Θεοφάνεια')
    expect(wrapper.text()).toContain('Κυριακή του Πάσχα')
  })

  it('should show badge for fixed holidays', () => {
    const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

    const badges = wrapper.findAll('.badge')
    expect(badges.some(b => b.text() === 'Σταθερή')).toBe(true)
  })

  it('should show badge for movable holidays', () => {
    const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

    const badges = wrapper.findAll('.badge')
    expect(badges.some(b => b.text() === 'Κινητή')).toBe(true)
  })

  it('should show badge for custom holidays', () => {
    const propsWithCustom = {
      ...defaultProps,
      allHolidays: [
        ...defaultProps.allHolidays,
        createMockHoliday({ nameGreek: 'Τοπική Αργία', isCustom: true })
      ]
    }

    const wrapper = mount(PublicHolidaysCard, { props: propsWithCustom })

    const badges = wrapper.findAll('.badge')
    expect(badges.some(b => b.text() === 'Προσαρμ.')).toBe(true)
  })

  describe('weekend holidays section', () => {
    it('should not show weekend holidays section when empty', () => {
      const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

      expect(wrapper.text()).not.toContain('πέφτουν Σαββατοκύριακο')
    })

    it('should show weekend holidays warning when present', () => {
      const propsWithWeekend = {
        ...defaultProps,
        weekendHolidays: [
          createMockHoliday({ date: new Date(2026, 7, 15), nameGreek: 'Δεκαπενταύγουστος' })
        ]
      }

      const wrapper = mount(PublicHolidaysCard, { props: propsWithWeekend })

      expect(wrapper.text()).toContain('1 αργία πέφτει Σαββατοκύριακο')
    })

    it('should show plural form for multiple weekend holidays', () => {
      const propsWithWeekend = {
        ...defaultProps,
        weekendHolidays: [
          createMockHoliday({ date: new Date(2026, 7, 15), nameGreek: 'Δεκαπενταύγουστος' }),
          createMockHoliday({ date: new Date(2026, 11, 25), nameGreek: 'Χριστούγεννα' })
        ]
      }

      const wrapper = mount(PublicHolidaysCard, { props: propsWithWeekend })

      expect(wrapper.text()).toContain('2 αργίες πέφτουν Σαββατοκύριακο')
    })

    it('should toggle expandable weekend holidays section', async () => {
      const propsWithWeekend = {
        ...defaultProps,
        weekendHolidays: [
          createMockHoliday({ date: new Date(2026, 7, 15), nameGreek: 'Δεκαπενταύγουστος' })
        ]
      }

      const wrapper = mount(PublicHolidaysCard, { props: propsWithWeekend })

      // Initially collapsed
      const expandableContent = wrapper.find('.expandable-content')
      expect(expandableContent.classes()).not.toContain('expanded')

      // Click to expand
      const trigger = wrapper.find('.expandable-trigger')
      await trigger.trigger('click')

      expect(wrapper.find('.expandable-content').classes()).toContain('expanded')
    })
  })

  describe('date formatting', () => {
    it('should format dates in Greek locale', () => {
      const wrapper = mount(PublicHolidaysCard, { props: defaultProps })

      // Check that dates are formatted (Greek month abbreviations)
      expect(wrapper.text()).toMatch(/\d+\s+(Ιαν|Φεβ|Μαρ|Απρ|Μαΐ|Ιουν|Ιουλ|Αυγ|Σεπ|Οκτ|Νοε|Δεκ)/)
    })
  })
})
