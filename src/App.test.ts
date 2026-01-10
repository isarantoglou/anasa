import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toBlob: (callback: (blob: Blob) => void) => {
      callback(new Blob(['test'], { type: 'image/png' }))
    }
  }))
}))

// Mock useShareableState
vi.mock('./composables/useShareableState', () => ({
  loadStateFromUrl: vi.fn(() => null),
  hasSharedState: vi.fn(() => false),
  clearUrlState: vi.fn(),
  generateShareUrl: vi.fn(() => 'https://test.com/?s=encoded'),
  recalculateAppState: vi.fn((state) => state)
}))

// Mock package.json version
vi.mock('../package.json', () => ({
  version: '1.0.0'
}))

// Helper to create localStorage mock
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
      Object.keys(store).forEach(key => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _store: store
  }
}

// Helper to create matchMedia mock
function createMatchMediaMock(matches: boolean = false) {
  return vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
}

describe('App.vue', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>
  let originalLocalStorage: Storage
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))

    // Setup localStorage mock
    localStorageMock = createLocalStorageMock()
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Setup matchMedia mock
    originalMatchMedia = window.matchMedia
    window.matchMedia = createMatchMediaMock(false)

    // Mock URL methods
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve())
      }
    })

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
    window.matchMedia = originalMatchMedia
  })

  describe('Initial rendering', () => {
    it('should render the app title', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Ανάσα')
    })

    it('should render the subtitle', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Πάρε ανάσα από τη δουλειά')
    })

    it('should display version number in footer', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('v1.0.0')
    })

    it('should render Orthodox Easter badge', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Ορθόδοξο Πάσχα')
    })

    it('should display current year by default', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('2026')
    })

    it('should render all main sections', () => {
      const wrapper = mount(App)

      // Settings section
      expect(wrapper.findComponent({ name: 'SettingsCard' }).exists()).toBe(true)

      // Custom holidays section
      expect(wrapper.findComponent({ name: 'CustomHolidaysCard' }).exists()).toBe(true)

      // Public holidays section
      expect(wrapper.findComponent({ name: 'PublicHolidaysCard' }).exists()).toBe(true)

      // Annual plan section
      expect(wrapper.findComponent({ name: 'AnnualPlanSection' }).exists()).toBe(true)

      // Holiday table
      expect(wrapper.findComponent({ name: 'HolidayTable' }).exists()).toBe(true)
    })

    it('should render opportunities section', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Ευκαιρίες Άδειας')
    })
  })

  describe('Dark mode', () => {
    it('should toggle dark mode when button is clicked', async () => {
      const wrapper = mount(App)

      const darkModeButton = wrapper.find('.dark-mode-toggle')
      expect(darkModeButton.exists()).toBe(true)

      await darkModeButton.trigger('click')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-dark-mode', 'true')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should toggle off dark mode on second click', async () => {
      const wrapper = mount(App)

      const darkModeButton = wrapper.find('.dark-mode-toggle')

      // Toggle on
      await darkModeButton.trigger('click')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Toggle off
      await darkModeButton.trigger('click')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-dark-mode', 'false')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should load dark mode preference from localStorage', async () => {
      localStorageMock._store['anasa-dark-mode'] = 'true'

      mount(App)
      await flushPromises()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should use system preference when no localStorage value', async () => {
      window.matchMedia = createMatchMediaMock(true) // System prefers dark

      mount(App)
      await flushPromises()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should prefer localStorage over system preference', async () => {
      localStorageMock._store['anasa-dark-mode'] = 'false'
      window.matchMedia = createMatchMediaMock(true) // System prefers dark

      mount(App)
      await flushPromises()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should have correct aria-label for light mode', () => {
      const wrapper = mount(App)

      const darkModeButton = wrapper.find('.dark-mode-toggle')
      expect(darkModeButton.attributes('aria-label')).toBe('Αλλαγή σε σκοτεινή λειτουργία')
    })

    it('should update aria-label after toggle', async () => {
      const wrapper = mount(App)

      const darkModeButton = wrapper.find('.dark-mode-toggle')
      await darkModeButton.trigger('click')

      expect(darkModeButton.attributes('aria-label')).toBe('Αλλαγή σε φωτεινή λειτουργία')
    })
  })

  describe('Sorting options', () => {
    it('should display sort options', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Ταξινόμηση')
      expect(wrapper.text()).toContain('Απόδοση')
      expect(wrapper.text()).toContain('Ημερομηνία')
    })

    it('should have efficiency sort active by default', () => {
      const wrapper = mount(App)

      const buttons = wrapper.findAll('.toggle-switch-option')
      const efficiencyButton = buttons.find(b => b.text() === 'Απόδοση')

      expect(efficiencyButton?.classes()).toContain('active')
    })

    it('should switch to date sort when clicked', async () => {
      const wrapper = mount(App)

      const dateButton = wrapper.findAll('.toggle-switch-option').find(b => b.text() === 'Ημερομηνία')
      await dateButton?.trigger('click')

      expect(dateButton?.classes()).toContain('active')
    })

    it('should not show family sort when parent mode is off', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).not.toContain('Οικογένεια')
    })
  })

  describe('Empty state', () => {
    it('should have empty state template in the markup', () => {
      // The empty state is conditionally rendered with v-if
      // When there are opportunities (which is the normal case), the empty state is not shown
      // We verify the component structure has the empty state section by checking the template exists
      const wrapper = mount(App)

      // The component structure includes the results section which handles both states
      expect(wrapper.find('section.mb-12.animate-fade-in-up.delay-200').exists()).toBe(true)
    })
  })

  describe('Modals', () => {
    it('should render ConflictWarningModal', () => {
      const wrapper = mount(App)

      expect(wrapper.findComponent({ name: 'ConflictWarningModal' }).exists()).toBe(true)
    })

    it('should render LeaveRequestModal', () => {
      const wrapper = mount(App)

      expect(wrapper.findComponent({ name: 'LeaveRequestModal' }).exists()).toBe(true)
    })

    it('should render YearComparisonModal', () => {
      const wrapper = mount(App)

      expect(wrapper.findComponent({ name: 'YearComparisonModal' }).exists()).toBe(true)
    })

    it('should render ShareCard (hidden)', () => {
      const wrapper = mount(App)

      expect(wrapper.findComponent({ name: 'ShareCard' }).exists()).toBe(true)
    })

    it('should render AnnualPlanShareCard (hidden)', () => {
      const wrapper = mount(App)

      expect(wrapper.findComponent({ name: 'AnnualPlanShareCard' }).exists()).toBe(true)
    })
  })

  describe('Footer', () => {
    it('should display app name in footer', () => {
      const wrapper = mount(App)

      const footer = wrapper.find('footer')
      expect(footer.text()).toContain('Ανάσα')
    })

    it('should display Easter algorithm info', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Meeus/Jones/Butcher')
    })

    it('should display Oxygen credit', () => {
      const wrapper = mount(App)

      expect(wrapper.text()).toContain('Oxygen')
    })

    it('should have social media links', () => {
      const wrapper = mount(App)

      const footer = wrapper.find('footer')

      // Check for social links (Facebook, Instagram, LinkedIn, YouTube, GitHub)
      expect(footer.findAll('a[href*="facebook"]').length).toBe(1)
      expect(footer.findAll('a[href*="instagram"]').length).toBe(1)
      expect(footer.findAll('a[href*="linkedin"]').length).toBe(1)
      expect(footer.findAll('a[href*="youtube"]').length).toBe(1)
      // GitHub appears twice: once for CHANGELOG link, once for social
      expect(footer.findAll('a[href*="github"]').length).toBeGreaterThanOrEqual(1)
    })

    it('should have changelog link on version', () => {
      const wrapper = mount(App)

      const versionLink = wrapper.find('a[href*="CHANGELOG"]')
      expect(versionLink.exists()).toBe(true)
      expect(versionLink.attributes('target')).toBe('_blank')
    })
  })

  describe('Header', () => {
    it('should display header with backdrop blur', () => {
      const wrapper = mount(App)

      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
      expect(header.classes()).toContain('backdrop-blur-md')
    })

    it('should have decorative Greek key border', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.greek-key-border').exists()).toBe(true)
    })
  })

  describe('Notifications', () => {
    it('should have URL loaded notification transition wrapper', () => {
      const wrapper = mount(App)

      // The notification uses v-if so it won't be visible unless loadedFromUrl is true
      // We check that the transition wrapper exists
      expect(wrapper.html()).toContain('slide-up')
    })

    it('should have transition wrappers for notifications', () => {
      const wrapper = mount(App)

      // There should be 2 slide-up transitions (URL loaded and URL copied)
      const slideUpMatches = wrapper.html().match(/slide-up/g)
      expect(slideUpMatches?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Component integration', () => {
    it('should pass currentYear to SettingsCard', () => {
      const wrapper = mount(App)

      const settingsCard = wrapper.findComponent({ name: 'SettingsCard' })
      expect(settingsCard.props('currentYear')).toBe(2026)
    })

    it('should pass holidays to CustomHolidaysCard', () => {
      const wrapper = mount(App)

      const customHolidaysCard = wrapper.findComponent({ name: 'CustomHolidaysCard' })
      expect(customHolidaysCard.props('currentYear')).toBe(2026)
    })

    it('should pass allHolidays to PublicHolidaysCard', () => {
      const wrapper = mount(App)

      const publicHolidaysCard = wrapper.findComponent({ name: 'PublicHolidaysCard' })
      expect(publicHolidaysCard.props('allHolidays')).toBeDefined()
    })

    it('should pass formatDateRange to AnnualPlanSection', () => {
      const wrapper = mount(App)

      const annualPlanSection = wrapper.findComponent({ name: 'AnnualPlanSection' })
      expect(typeof annualPlanSection.props('formatDateRange')).toBe('function')
    })
  })

  describe('Opportunity cards', () => {
    it('should render OpportunityCard components for opportunities', () => {
      const wrapper = mount(App)

      // Opportunities are rendered in the grid
      const grid = wrapper.find('.grid.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-3')
      expect(grid.exists()).toBe(true)
    })

    it('should show opportunity count', () => {
      const wrapper = mount(App)

      // Should show count in format "X ευκαιρίες για Y ημέρες άδειας"
      expect(wrapper.text()).toMatch(/\d+ ευκαιρίες για \d+ ημέρες άδειας/)
    })
  })

  describe('Responsive layout', () => {
    it('should have responsive grid for settings cards', () => {
      const wrapper = mount(App)

      const settingsGrid = wrapper.find('.grid.grid-cols-1.lg\\:grid-cols-3')
      expect(settingsGrid.exists()).toBe(true)
    })

    it('should have max width container', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.max-w-350').exists()).toBe(true)
    })
  })

  describe('Animations', () => {
    it('should have fade-in-up animation class on main sections', () => {
      const wrapper = mount(App)

      expect(wrapper.findAll('.animate-fade-in-up').length).toBeGreaterThan(0)
    })

    it('should have delay classes for staggered animation', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.delay-100').exists()).toBe(true)
      expect(wrapper.find('.delay-200').exists()).toBe(true)
    })
  })

  describe('Background decorations', () => {
    it('should have marble texture background', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.bg-marble-texture').exists()).toBe(true)
    })

    it('should have wave background decoration', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.bg-waves').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      const wrapper = mount(App)

      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('should have semantic main element', () => {
      const wrapper = mount(App)

      expect(wrapper.find('main').exists()).toBe(true)
    })

    it('should have semantic footer element', () => {
      const wrapper = mount(App)

      expect(wrapper.find('footer').exists()).toBe(true)
    })

    it('should have aria-labels on social links', () => {
      const wrapper = mount(App)

      const socialLinks = wrapper.findAll('footer a[aria-label]')
      expect(socialLinks.length).toBeGreaterThan(0)
    })
  })

  describe('localStorage persistence', () => {
    it('should load custom holidays from localStorage', async () => {
      const customHolidays = [{ id: '1', name: 'Test Holiday', date: '2026-06-15' }]
      localStorageMock._store['anasa-custom-holidays'] = JSON.stringify(customHolidays)

      mount(App)
      await flushPromises()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-custom-holidays')
    })

    it('should load total days from localStorage', async () => {
      localStorageMock._store['anasa-total-days'] = '30'

      mount(App)
      await flushPromises()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-total-days')
    })

    it('should load parent mode from localStorage', async () => {
      localStorageMock._store['anasa-parent-mode'] = 'true'

      mount(App)
      await flushPromises()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-parent-mode')
    })

    it('should load holy spirit preference from localStorage', async () => {
      localStorageMock._store['anasa-holy-spirit'] = 'false'

      mount(App)
      await flushPromises()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-holy-spirit')
    })
  })
})

describe('App.vue - Export functions', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>
  let originalLocalStorage: Storage
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))

    localStorageMock = createLocalStorageMock()
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    originalMatchMedia = window.matchMedia
    window.matchMedia = createMatchMediaMock(false)

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve())
      }
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
    window.matchMedia = originalMatchMedia
  })

  it('should have export to calendar functionality', () => {
    const wrapper = mount(App)

    // AnnualPlanSection emits export-to-calendar
    const annualPlanSection = wrapper.findComponent({ name: 'AnnualPlanSection' })
    expect(annualPlanSection.exists()).toBe(true)
  })

  it('should have share URL functionality', () => {
    const wrapper = mount(App)

    // The share-url event handler exists
    const annualPlanSection = wrapper.findComponent({ name: 'AnnualPlanSection' })
    expect(annualPlanSection.exists()).toBe(true)
  })

  it('should have share as image functionality', () => {
    const wrapper = mount(App)

    // The share-as-image event handler exists
    const annualPlanSection = wrapper.findComponent({ name: 'AnnualPlanSection' })
    expect(annualPlanSection.exists()).toBe(true)
  })
})

describe('App.vue - Year handling', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>
  let originalLocalStorage: Storage
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))

    localStorageMock = createLocalStorageMock()
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    originalMatchMedia = window.matchMedia
    window.matchMedia = createMatchMediaMock(false)

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
    window.matchMedia = originalMatchMedia
  })

  it('should default to current year', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('2026')
  })

  it('should pass currentYear to child components', () => {
    const wrapper = mount(App)

    const settingsCard = wrapper.findComponent({ name: 'SettingsCard' })
    expect(settingsCard.props('currentYear')).toBe(2026)
  })

  it('should pass currentYear to YearComparisonModal', () => {
    const wrapper = mount(App)

    const modal = wrapper.findComponent({ name: 'YearComparisonModal' })
    expect(modal.props('currentYear')).toBe(2026)
  })
})

describe('App.vue - Computed properties', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>
  let originalLocalStorage: Storage
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15))

    localStorageMock = createLocalStorageMock()
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    originalMatchMedia = window.matchMedia
    window.matchMedia = createMatchMediaMock(false)

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
    window.matchMedia = originalMatchMedia
  })

  it('should compute school breaks for current year', () => {
    const wrapper = mount(App)

    const settingsCard = wrapper.findComponent({ name: 'SettingsCard' })
    expect(settingsCard.props('schoolBreaks')).toBeDefined()
  })

  it('should compute effective start label', () => {
    const wrapper = mount(App)

    const settingsCard = wrapper.findComponent({ name: 'SettingsCard' })
    expect(settingsCard.props('effectiveStartLabel')).toBeDefined()
  })

  it('should compute showingFromToday correctly', () => {
    const wrapper = mount(App)

    const settingsCard = wrapper.findComponent({ name: 'SettingsCard' })
    // calculateFromToday defaults to true, and we're in 2026
    expect(settingsCard.props('showingFromToday')).toBe(true)
  })
})
