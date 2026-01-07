import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HolidayTable from './HolidayTable.vue'
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

describe('HolidayTable', () => {
  const defaultProps = {
    currentYear: 2026,
    allHolidays: [
      createMockHoliday({ date: new Date(2026, 0, 1), nameGreek: 'Πρωτοχρονιά' }),
      createMockHoliday({ date: new Date(2026, 0, 6), nameGreek: 'Θεοφάνεια' }),
      createMockHoliday({ date: new Date(2026, 3, 10), nameGreek: 'Μεγάλη Παρασκευή', isMovable: true }),
      createMockHoliday({ date: new Date(2026, 6, 15), nameGreek: 'Τοπική Αργία', isCustom: true })
    ]
  }

  it('should render table with current year in title', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    expect(wrapper.text()).toContain('Πλήρες Ημερολόγιο Αργιών 2026')
  })

  it('should render table headers', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    expect(wrapper.text()).toContain('Αργία')
    expect(wrapper.text()).toContain('Ημερομηνία')
    expect(wrapper.text()).toContain('Ημέρα')
    expect(wrapper.text()).toContain('Τύπος')
    expect(wrapper.text()).toContain('Αξία')
  })

  it('should display all holiday names', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    expect(wrapper.text()).toContain('Πρωτοχρονιά')
    expect(wrapper.text()).toContain('Θεοφάνεια')
    expect(wrapper.text()).toContain('Μεγάλη Παρασκευή')
    expect(wrapper.text()).toContain('Τοπική Αργία')
  })

  it('should show correct type badges', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    const badges = wrapper.findAll('.badge')
    const badgeTexts = badges.map(b => b.text())

    expect(badgeTexts).toContain('Σταθερή')
    expect(badgeTexts).toContain('Κινητή')
    expect(badgeTexts).toContain('Προσαρμ.')
  })

  it('should show weekend vs workday value', () => {
    // Create holidays on different days
    const propsWithWeekend = {
      currentYear: 2026,
      allHolidays: [
        // Thursday (workday)
        createMockHoliday({ date: new Date(2026, 0, 1), nameGreek: 'Πρωτοχρονιά' }),
        // Saturday (weekend) - Aug 15, 2026 is Saturday
        createMockHoliday({ date: new Date(2026, 7, 15), nameGreek: 'Δεκαπενταύγουστος' })
      ]
    }

    const wrapper = mount(HolidayTable, { props: propsWithWeekend })

    const badges = wrapper.findAll('.badge')
    const badgeTexts = badges.map(b => b.text())

    expect(badgeTexts).toContain('Ρεπό') // Workday holiday
    expect(badgeTexts).toContain('Σ/Κ') // Weekend holiday
  })

  it('should format dates in Greek locale', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    // Check for Greek date format (e.g., "1 Ιανουαρίου 2026")
    expect(wrapper.text()).toContain('Ιανουαρίου 2026')
  })

  it('should show day of week in Greek', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    // Greek day names
    const greekDays = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
    const hasGreekDay = greekDays.some(day => wrapper.text().includes(day))

    expect(hasGreekDay).toBe(true)
  })

  it('should render correct number of table rows', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(4)
  })

  it('should apply correct badge class for movable holidays', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    const movableBadge = wrapper.findAll('.badge').find(b => b.text() === 'Κινητή')
    expect(movableBadge?.classes()).toContain('badge-aegean')
  })

  it('should apply correct badge class for custom holidays', () => {
    const wrapper = mount(HolidayTable, { props: defaultProps })

    const customBadge = wrapper.findAll('.badge').find(b => b.text() === 'Προσαρμ.')
    expect(customBadge?.classes()).toContain('badge-terracotta')
  })
})
