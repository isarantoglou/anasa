import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LeaveRequestModal from './LeaveRequestModal.vue'
import type { SavedOpportunity } from '../../types'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}
Object.assign(navigator, { clipboard: mockClipboard })

// Mock URL API
const mockCreateObjectURL = vi.fn(() => 'mock-url')
const mockRevokeObjectURL = vi.fn()
Object.assign(URL, { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL })

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

describe('LeaveRequestModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    show: true,
    annualPlan: [
      createMockOpportunity({
        id: '1',
        range: { startDate: new Date(2026, 0, 5), endDate: new Date(2026, 0, 11) },
        leaveDaysRequired: 5,
      }),
      createMockOpportunity({
        id: '2',
        range: { startDate: new Date(2026, 3, 6), endDate: new Date(2026, 3, 12) },
        leaveDaysRequired: 4,
      }),
    ],
    annualPlanTotalDays: 9,
    currentYear: 2026,
  }

  it('should not render when show is false', () => {
    const wrapper = mount(LeaveRequestModal, {
      props: { ...defaultProps, show: false },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should render when show is true', () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('should display modal title', () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Αίτηση Κανονικής Άδειας')
  })

  it('should have reason input field with default value', () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('Προσωπικοί λόγοι')
  })

  it('should generate leave request text with all periods', () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    const textarea = wrapper.find('textarea')
    const text = (textarea.element as HTMLTextAreaElement).value

    expect(text).toContain('ΑΙΤΗΣΗ ΚΑΝΟΝΙΚΗΣ ΑΔΕΙΑΣ')
    expect(text).toContain('Τμήμα Ανθρώπινου Δυναμικού')
    expect(text).toContain('5 εργάσιμες ημέρες')
    expect(text).toContain('4 εργάσιμες ημέρες')
    expect(text).toContain('Συνολικές ημέρες άδειας: 9')
    expect(text).toContain('Προσωπικοί λόγοι')
  })

  it('should update leave request text when reason changes', async () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Οικογενειακοί λόγοι')

    const textarea = wrapper.find('textarea')
    const text = (textarea.element as HTMLTextAreaElement).value

    expect(text).toContain('Οικογενειακοί λόγοι')
  })

  it('should emit close when close button is clicked', async () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    const closeButton = wrapper.find('button[class*="rounded-lg"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should emit close when clicking backdrop', async () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    await wrapper.find('.fixed.inset-0').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should copy text to clipboard when copy button is clicked', async () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    const copyButton = wrapper.findAll('button').find((b) => b.text().includes('Αντιγραφή'))
    await copyButton?.trigger('click')

    expect(mockClipboard.writeText).toHaveBeenCalled()
  })

  it('should show copy and download buttons', () => {
    const wrapper = mount(LeaveRequestModal, { props: defaultProps })

    expect(wrapper.text()).toContain('Αντιγραφή')
    expect(wrapper.text()).toContain('Λήψη')
  })

  it('should return empty text when no annual plan', () => {
    const wrapper = mount(LeaveRequestModal, {
      props: { ...defaultProps, annualPlan: [] },
    })

    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('should sort periods by date in leave request', () => {
    const wrapper = mount(LeaveRequestModal, {
      props: {
        ...defaultProps,
        annualPlan: [
          createMockOpportunity({
            id: '2',
            range: { startDate: new Date(2026, 6, 1), endDate: new Date(2026, 6, 7) },
          }),
          createMockOpportunity({
            id: '1',
            range: { startDate: new Date(2026, 0, 5), endDate: new Date(2026, 0, 11) },
          }),
        ],
      },
    })

    const textarea = wrapper.find('textarea')
    const text = (textarea.element as HTMLTextAreaElement).value
    const janIndex = text.indexOf('Ιανουαρίου')
    const julIndex = text.indexOf('Ιουλίου')

    expect(janIndex).toBeLessThan(julIndex)
  })
})
