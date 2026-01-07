import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShareCard from './ShareCard.vue'
import type { OptimizationResult, DayInfo } from '../../types'

// Helper to create mock days
function createMockDays(count: number): DayInfo[] {
  const days: DayInfo[] = []
  for (let i = 0; i < count; i++) {
    const dayOfWeek = (i + 1) % 7
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = i === 0 // First day is holiday
    days.push({
      date: new Date(2026, 0, 5 + i),
      isWeekend,
      isHoliday,
      holidayName: isHoliday ? 'Test Holiday' : undefined,
      cost: isWeekend || isHoliday ? 0 : 1
    })
  }
  return days
}

// Helper to create mock opportunity
function createMockOpportunity(overrides: Partial<OptimizationResult> = {}): OptimizationResult {
  return {
    range: {
      startDate: new Date(2026, 0, 5),
      endDate: new Date(2026, 0, 11)
    },
    totalDays: 7,
    leaveDaysRequired: 4,
    freeDays: 3,
    efficiency: 1.75,
    efficiencyLabel: '3 ημέρες δωρεάν',
    days: createMockDays(7),
    ...overrides
  }
}

// Mock formatDateRange function
function formatDateRange(range: { startDate: Date; endDate: Date }) {
  return `${range.startDate.getDate()}/${range.startDate.getMonth() + 1} - ${range.endDate.getDate()}/${range.endDate.getMonth() + 1}`
}

describe('ShareCard', () => {
  const defaultProps = {
    opportunity: createMockOpportunity(),
    currentYear: 2026,
    formatDateRange
  }

  it('should not render when opportunity is null', () => {
    const wrapper = mount(ShareCard, {
      props: { ...defaultProps, opportunity: null }
    })

    expect(wrapper.find('#share-card').exists()).toBe(false)
  })

  it('should render when opportunity is provided', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.find('#share-card').exists()).toBe(true)
  })

  it('should be positioned off-screen (hidden)', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    const hiddenDiv = wrapper.find('[style*="left: -9999px"]')
    expect(hiddenDiv.exists()).toBe(true)
  })

  it('should have aria-hidden attribute', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    const hiddenDiv = wrapper.find('[aria-hidden="true"]')
    expect(hiddenDiv.exists()).toBe(true)
  })

  it('should display app name in footer', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Ανάσα')
  })

  it('should display header label', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('ΚΑΛYΤΕΡΗ ΕΠΙΛΟΓH')
  })

  it('should display anasa.oxygen.gr in footer', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('anasa.oxygen.gr')
  })

  it('should display efficiency multiplier', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('1.8x')
  })

  it('should display date range in Greek format', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    // Uses formatDateRangeShort which outputs Greek month abbreviations
    expect(wrapper.text()).toContain('5 Ιαν - 11 Ιαν')
  })

  it('should display leave days required', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('ΑΔΕΙΑ')
  })

  it('should display total days', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('7')
    expect(wrapper.text()).toContain('ΣΥΝΟΛΟ')
  })

  it('should display free days', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('ΔΩΡΕΑΝ')
  })

  it('should display efficiency label', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('3 ημέρες δωρεάν')
  })

  it('should render day timeline', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    // Check for day analysis section
    expect(wrapper.text()).toContain('Ανάλυση Ημερών')
    // The day squares are rendered with inline styles
    const shareCard = wrapper.find('#share-card')
    expect(shareCard.exists()).toBe(true)
  })

  it('should show legend', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Εργάσιμη')
    expect(wrapper.text()).toContain('Σ/Κ')
    expect(wrapper.text()).toContain('Αργία')
  })

  it('should show footer with app info', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Δημιουργήθηκε με το')
    expect(wrapper.text()).toContain('Ανάσα')
  })

  it('should use inline styles for colors (html2canvas compatibility)', () => {
    const wrapper = mount(ShareCard, { props: defaultProps })

    // Share card uses inline hex colors, not CSS variables
    const cardElement = wrapper.find('#share-card')
    const style = cardElement.attributes('style')

    expect(style).toContain('background-color')
  })

  it('should format efficiency to one decimal place', () => {
    const wrapper = mount(ShareCard, {
      props: {
        ...defaultProps,
        opportunity: createMockOpportunity({ efficiency: 2.333 })
      }
    })

    expect(wrapper.text()).toContain('2.3x')
  })
})
