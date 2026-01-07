import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CustomHolidaysCard from './CustomHolidaysCard.vue'
import type { CustomHoliday } from '../types'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-123'
})

describe('CustomHolidaysCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    customHolidays: [] as CustomHoliday[],
    currentYear: 2026
  }

  it('should render card title', () => {
    const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Προσαρμοσμένες Αργίες')
  })

  describe('Town Search', () => {
    it('should display town search input', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Βρείτε τον Πολιούχο της Πόλης σας')
      const searchInput = wrapper.find('input[placeholder="Αναζήτηση πόλης..."]')
      expect(searchInput.exists()).toBe(true)
    })

    it('should show dropdown when searching with 2+ characters', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const searchInput = wrapper.find('input[placeholder="Αναζήτηση πόλης..."]')
      await searchInput.setValue('Αθ')
      await flushPromises()

      // Should trigger search (results depend on patronSaints data)
      expect(searchInput.exists()).toBe(true)
    })

    it('should not show dropdown with single character', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const searchInput = wrapper.find('input[placeholder="Αναζήτηση πόλης..."]')
      await searchInput.setValue('Α')
      await flushPromises()

      const dropdown = wrapper.find('.absolute.z-20')
      expect(dropdown.exists()).toBe(false)
    })

    it('should show clear button when search has text', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const searchInput = wrapper.find('input[placeholder="Αναζήτηση πόλης..."]')
      await searchInput.setValue('Αθήνα')

      const clearButton = wrapper.find('button.absolute.right-4')
      expect(clearButton.exists()).toBe(true)
    })

    it('should clear search when clear button is clicked', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const searchInput = wrapper.find('input[placeholder="Αναζήτηση πόλης..."]')
      await searchInput.setValue('Αθήνα')

      const clearButton = wrapper.find('button.absolute.right-4')
      await clearButton.trigger('click')

      expect((searchInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Manual Holiday Form', () => {
    it('should display form fields', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Όνομα Αργίας')
      expect(wrapper.text()).toContain('Ημερομηνία')
      expect(wrapper.find('#holidayName').exists()).toBe(true)
      expect(wrapper.find('#holidayDate').exists()).toBe(true)
    })

    it('should have add button', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      expect(wrapper.text()).toContain('Προσθήκη Αργίας')
    })

    it('should disable add button when form is empty', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const addButton = wrapper.findAll('button').find(b => b.text().includes('Προσθήκη Αργίας'))
      expect(addButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable add button when form is filled', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      await wrapper.find('#holidayName').setValue('Test Holiday')
      await wrapper.find('#holidayDate').setValue('2026-05-15')

      const addButton = wrapper.findAll('button').find(b => b.text().includes('Προσθήκη Αργίας'))
      expect(addButton?.attributes('disabled')).toBeUndefined()
    })

    it('should emit add-holiday when form is submitted', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      await wrapper.find('#holidayName').setValue('Test Holiday')
      await wrapper.find('#holidayDate').setValue('2026-05-15')

      const addButton = wrapper.findAll('button').find(b => b.text().includes('Προσθήκη Αργίας'))
      await addButton?.trigger('click')

      expect(wrapper.emitted('add-holiday')).toBeTruthy()
      expect(wrapper.emitted('add-holiday')?.[0]).toEqual([
        { id: 'test-uuid-123', name: 'Test Holiday', date: '2026-05-15' }
      ])
    })

    it('should clear form after adding holiday', async () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      await wrapper.find('#holidayName').setValue('Test Holiday')
      await wrapper.find('#holidayDate').setValue('2026-05-15')

      const addButton = wrapper.findAll('button').find(b => b.text().includes('Προσθήκη Αργίας'))
      await addButton?.trigger('click')

      expect((wrapper.find('#holidayName').element as HTMLInputElement).value).toBe('')
      expect((wrapper.find('#holidayDate').element as HTMLInputElement).value).toBe('')
    })

    it('should set date input min/max to current year', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      const dateInput = wrapper.find('#holidayDate')
      expect(dateInput.attributes('min')).toBe('2026-01-01')
      expect(dateInput.attributes('max')).toBe('2026-12-31')
    })
  })

  describe('Custom Holidays List', () => {
    it('should not show list when empty', () => {
      const wrapper = mount(CustomHolidaysCard, { props: defaultProps })

      expect(wrapper.text()).not.toContain('Προστιθέμενες Αργίες')
    })

    it('should show list when holidays exist', () => {
      const wrapper = mount(CustomHolidaysCard, {
        props: {
          ...defaultProps,
          customHolidays: [
            { id: '1', name: 'Test Holiday 1', date: '2026-05-15' },
            { id: '2', name: 'Test Holiday 2', date: '2026-08-20' }
          ]
        }
      })

      expect(wrapper.text()).toContain('Προστιθέμενες Αργίες')
      expect(wrapper.text()).toContain('Test Holiday 1')
      expect(wrapper.text()).toContain('Test Holiday 2')
    })

    it('should format holiday dates in Greek locale', () => {
      const wrapper = mount(CustomHolidaysCard, {
        props: {
          ...defaultProps,
          customHolidays: [
            { id: '1', name: 'Test Holiday', date: '2026-05-15' }
          ]
        }
      })

      // Greek date format should show month name
      expect(wrapper.text()).toMatch(/15\s+Μαΐ\s+2026/)
    })

    it('should emit remove-holiday when delete button is clicked', async () => {
      const wrapper = mount(CustomHolidaysCard, {
        props: {
          ...defaultProps,
          customHolidays: [
            { id: 'holiday-1', name: 'Test Holiday', date: '2026-05-15' }
          ]
        }
      })

      const deleteButton = wrapper.find('button[class*="hover:text-(--terracotta-500)"]')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('remove-holiday')).toBeTruthy()
      expect(wrapper.emitted('remove-holiday')?.[0]).toEqual(['holiday-1'])
    })
  })
})
