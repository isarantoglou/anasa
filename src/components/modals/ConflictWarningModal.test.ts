import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConflictWarningModal from './ConflictWarningModal.vue'
import type { SavedOpportunity } from '../../types'

// Helper to create mock opportunity
function createMockOpportunity(overrides: Partial<SavedOpportunity> = {}): SavedOpportunity {
  return {
    id: 'test-id',
    range: {
      startDate: new Date(2026, 0, 5),
      endDate: new Date(2026, 0, 11)
    },
    totalDays: 7,
    leaveDaysRequired: 5,
    freeDays: 2,
    efficiency: 1.4,
    efficiencyLabel: '2 ημέρες δωρεάν',
    days: [],
    addedAt: new Date().toISOString(),
    ...overrides
  }
}

// Mock formatDateRange function
function formatDateRange(range: { startDate: Date; endDate: Date }) {
  return `${range.startDate.getDate()}/${range.startDate.getMonth() + 1} - ${range.endDate.getDate()}/${range.endDate.getMonth() + 1}`
}

describe('ConflictWarningModal', () => {
  const defaultProps = {
    show: true,
    conflictWith: createMockOpportunity(),
    formatDateRange
  }

  it('should not render when show is false', () => {
    const wrapper = mount(ConflictWarningModal, {
      props: { ...defaultProps, show: false }
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should render when show is true', () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('should display conflict warning title', () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Σύγκρουση Περιόδων')
    expect(wrapper.text()).toContain('Η περίοδος επικαλύπτεται με υπάρχουσα')
  })

  it('should display conflicting period date range', () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Υπάρχει ήδη άδεια στο πλάνο')
    expect(wrapper.text()).toContain('5/1 - 11/1')
  })

  it('should emit dismiss when cancel button is clicked', async () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Ακύρωση')
    await cancelButton?.trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('should emit dismiss when clicking backdrop', async () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    await wrapper.find('.fixed.inset-0').trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('should emit force-add when force add button is clicked', async () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    const forceButton = wrapper.findAll('button').find(b => b.text() === 'Προσθήκη Ούτως ή Άλλως')
    await forceButton?.trigger('click')

    expect(wrapper.emitted('force-add')).toHaveLength(1)
  })

  it('should not show conflict details when conflictWith is null', () => {
    const wrapper = mount(ConflictWarningModal, {
      props: { ...defaultProps, conflictWith: null }
    })

    expect(wrapper.text()).not.toContain('Υπάρχει ήδη άδεια στο πλάνο')
  })

  it('should have two action buttons', () => {
    const wrapper = mount(ConflictWarningModal, { props: defaultProps })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
  })
})
