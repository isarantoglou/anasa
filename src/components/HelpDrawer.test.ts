import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpDrawer from './HelpDrawer.vue'

// Create localStorage mock
function createLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
    _store: store,
  }
}

describe('HelpDrawer', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>
  let originalLocalStorage: Storage

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = createLocalStorageMock()
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  describe('floating button', () => {
    it('renders the help FAB button', () => {
      const wrapper = mount(HelpDrawer)
      const fab = wrapper.find('.help-fab')
      expect(fab.exists()).toBe(true)
    })

    it('has correct aria-label for accessibility', () => {
      const wrapper = mount(HelpDrawer)
      const fab = wrapper.find('.help-fab')
      expect(fab.attributes('aria-label')).toBe('Οδηγίες χρήσης')
    })

    it('shows notification dot for first-time visitors', () => {
      const wrapper = mount(HelpDrawer)
      const dot = wrapper.find('.help-fab-dot')
      expect(dot.exists()).toBe(true)
    })

    it('hides notification dot after user has seen help', async () => {
      localStorageMock._store['anasa-help-seen'] = 'true'
      const wrapper = mount(HelpDrawer)
      await wrapper.vm.$nextTick()
      const dot = wrapper.find('.help-fab-dot')
      expect(dot.exists()).toBe(false)
    })

    it('shows pulse animation for first-time visitors after delay', async () => {
      const wrapper = mount(HelpDrawer)

      // Initially no pulse
      expect(wrapper.find('.help-fab').classes()).not.toContain('help-fab-pulse')

      // Advance timer by 2 seconds
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      // Now should have pulse
      expect(wrapper.find('.help-fab').classes()).toContain('help-fab-pulse')
    })

    it('does not show pulse animation if user has seen help before', async () => {
      localStorageMock._store['anasa-help-seen'] = 'true'
      const wrapper = mount(HelpDrawer)

      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.help-fab').classes()).not.toContain('help-fab-pulse')
    })
  })

  describe('drawer opening/closing', () => {
    it('drawer is closed by default', () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })
      expect(wrapper.find('.help-backdrop').exists()).toBe(false)
    })

    it('opens drawer when FAB is clicked', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)
    })

    it('closes drawer when close button is clicked', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)

      // Close drawer
      await wrapper.find('.help-drawer-close').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(false)
    })

    it('closes drawer when "Κατάλαβα!" button is clicked', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')

      // Click the understand button
      const understandButton = wrapper.find('.help-drawer-footer .btn-primary')
      await understandButton.trigger('click')

      expect(wrapper.find('.help-backdrop').exists()).toBe(false)
    })

    it('closes drawer on escape key', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)

      // Press escape
      await wrapper.find('.help-backdrop').trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('.help-backdrop').exists()).toBe(false)
    })

    it('closes drawer when clicking backdrop', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)

      // Click backdrop (simulating click on the backdrop itself)
      const backdrop = wrapper.find('.help-backdrop')
      await backdrop.trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(false)
    })

    it('does not close drawer when clicking inside drawer', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)

      // Click inside drawer content
      await wrapper.find('.help-drawer-content').trigger('click')
      expect(wrapper.find('.help-backdrop').exists()).toBe(true)
    })
  })

  describe('localStorage persistence', () => {
    it('marks help as seen when drawer is opened', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      expect(localStorageMock.getItem('anasa-help-seen')).toBeNull()

      await wrapper.find('.help-fab').trigger('click')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-help-seen', 'true')
    })

    it('removes pulse animation when drawer is opened', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      // Wait for pulse to appear
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.help-fab').classes()).toContain('help-fab-pulse')

      // Open drawer
      await wrapper.find('.help-fab').trigger('click')

      // Pulse should be removed
      expect(wrapper.find('.help-fab').classes()).not.toContain('help-fab-pulse')
    })
  })

  describe('drawer content', () => {
    it('displays the correct title', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const title = wrapper.find('.help-drawer-title')
      expect(title.text()).toContain('Πώς να χρησιμοποιήσετε το Ανάσα')
    })

    it('displays welcome section', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const welcome = wrapper.find('.help-welcome')
      expect(welcome.exists()).toBe(true)
      expect(welcome.text()).toContain('Ανάσα')
    })

    it('displays all three step sections', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const stepNumbers = wrapper.findAll('.help-section-number')
      expect(stepNumbers.length).toBe(3)
      expect(stepNumbers[0]!.text()).toBe('1')
      expect(stepNumbers[1]!.text()).toBe('2')
      expect(stepNumbers[2]!.text()).toBe('3')
    })

    it('displays tips section with parent mode and Holy Spirit info', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const tips = wrapper.find('.help-tips')
      expect(tips.exists()).toBe(true)
      expect(tips.text()).toContain('Λειτουργία Γονέα')
      expect(tips.text()).toContain('Αγίου Πνεύματος')
    })

    it('has proper dialog accessibility attributes', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const drawer = wrapper.find('.help-drawer')
      expect(drawer.attributes('role')).toBe('dialog')
      expect(drawer.attributes('aria-modal')).toBe('true')
      expect(drawer.attributes('aria-labelledby')).toBe('help-title')
    })
  })

  describe('close button', () => {
    it('close button has accessible label', async () => {
      const wrapper = mount(HelpDrawer, {
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      await wrapper.find('.help-fab').trigger('click')

      const closeButton = wrapper.find('.help-drawer-close')
      expect(closeButton.attributes('aria-label')).toBe('Κλείσιμο')
    })
  })
})
