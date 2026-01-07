import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import YearComparisonModal from './YearComparisonModal.vue'

describe('YearComparisonModal', () => {
  const defaultProps = {
    show: true,
    currentYear: 2026,
    includeHolySpirit: true
  }

  it('should not render when show is false', () => {
    const wrapper = mount(YearComparisonModal, {
      props: { ...defaultProps, show: false }
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should render when show is true', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('should display modal title', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Σύγκριση Ετών')
  })

  it('should show year selection buttons', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    // Should show 4 year buttons (currentYear - 1, currentYear, currentYear + 1, currentYear + 2)
    expect(wrapper.text()).toContain('2025')
    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).toContain('2027')
    expect(wrapper.text()).toContain('2028')
  })

  it('should display all fixed holidays', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Πρωτοχρονιά')
    expect(wrapper.text()).toContain('Θεοφάνεια')
    expect(wrapper.text()).toContain('Ευαγγελισμός')
    expect(wrapper.text()).toContain('Πρωτομαγιά')
    expect(wrapper.text()).toContain('Δεκαπενταύγουστος')
    expect(wrapper.text()).toContain('Ημέρα του Όχι')
    expect(wrapper.text()).toContain('Χριστούγεννα')
    expect(wrapper.text()).toContain('2η Χριστουγέννων')
  })

  it('should display movable holidays', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Ορθόδοξο Πάσχα')
    expect(wrapper.text()).toContain('Καθαρά Δευτέρα')
    expect(wrapper.text()).toContain('Μεγάλη Παρασκευή')
    expect(wrapper.text()).toContain('Δευτέρα του Πάσχα')
  })

  it('should show Holy Spirit row when includeHolySpirit is true', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Αγίου Πνεύματος')
  })

  it('should hide Holy Spirit row when includeHolySpirit is false', () => {
    const wrapper = mount(YearComparisonModal, {
      props: { ...defaultProps, includeHolySpirit: false }
    })

    expect(wrapper.text()).not.toContain('Αγίου Πνεύματος')
  })

  it('should emit close when close button is clicked', async () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    const closeButton = wrapper.find('button[class*="rounded-lg"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should emit close when clicking backdrop', async () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    await wrapper.find('.fixed.inset-0').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should show max 3 years note', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('μέγ. 3 έτη')
  })

  it('should toggle year selection when clicking year buttons', async () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    // Click on 2025 to add it
    const yearButton2025 = wrapper.findAll('button').find(b => b.text() === '2025')
    await yearButton2025?.trigger('click')

    // Should now have 3 years
    const updatedButtons = wrapper.findAll('button.bg-\\(--aegean-600\\)')
    expect(updatedButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('should show empty state when no years selected', async () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    // Remove all years
    const selectedYearButtons = wrapper.findAll('button.bg-\\(--aegean-600\\)').filter(b =>
      ['2025', '2026', '2027', '2028'].includes(b.text())
    )

    for (const btn of selectedYearButtons) {
      await btn.trigger('click')
    }

    // Should show empty state message
    expect(wrapper.text()).toContain('Επιλέξτε τουλάχιστον ένα έτος για σύγκριση')
  })

  it('should display table headers', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Αργία')
  })

  it('should render comparison table with correct structure', () => {
    const wrapper = mount(YearComparisonModal, { props: defaultProps })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })
})
