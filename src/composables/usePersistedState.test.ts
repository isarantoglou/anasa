import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  usePersistedState,
  usePersistedBoolean,
  usePersistedNumber,
  usePersistedJson,
} from './usePersistedState'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
}

vi.stubGlobal('localStorage', localStorageMock)

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('usePersistedBoolean', () => {
    it('should return default value when localStorage is empty', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('test-bool', false)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('false')
    })

    it('should load true from localStorage', async () => {
      localStorageMock.store['anasa-test-bool'] = 'true'

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('test-bool', false)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('true')
    })

    it('should load false from localStorage', async () => {
      localStorageMock.store['anasa-test-bool'] = 'false'

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('test-bool', true)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('false')
    })

    it('should persist changes to localStorage', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('test-bool', false)
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state = true
      await nextTick()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-test-bool', 'true')
    })

    it('should use anasa- prefix', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('dark-mode', false)
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state = true
      await nextTick()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-dark-mode', 'true')
    })
  })

  describe('usePersistedNumber', () => {
    it('should return default value when localStorage is empty', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedNumber('test-num', 25)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('25')
    })

    it('should load number from localStorage', async () => {
      localStorageMock.store['anasa-test-num'] = '30'

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedNumber('test-num', 25)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('30')
    })

    it('should handle invalid number in localStorage', async () => {
      localStorageMock.store['anasa-test-num'] = 'not-a-number'

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedNumber('test-num', 25)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      // Should return 0 for NaN (as per serializer logic)
      expect(wrapper.find('[data-testid="value"]').text()).toBe('0')
    })

    it('should persist number changes', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedNumber('test-num', 25)
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state = 30
      await nextTick()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-test-num', '30')
    })
  })

  describe('usePersistedJson', () => {
    interface TestItem {
      id: string
      name: string
    }

    it('should return default value when localStorage is empty', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<TestItem[]>('test-json', [])
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, JSON.stringify(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('[]')
    })

    it('should load JSON array from localStorage', async () => {
      const data = [{ id: '1', name: 'Test' }]
      localStorageMock.store['anasa-test-json'] = JSON.stringify(data)

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<TestItem[]>('test-json', [])
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, JSON.stringify(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(JSON.parse(wrapper.find('[data-testid="value"]').text())).toEqual(data)
    })

    it('should load JSON object from localStorage', async () => {
      const data = { setting: 'value', count: 5 }
      localStorageMock.store['anasa-test-obj'] = JSON.stringify(data)

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<typeof data>('test-obj', { setting: '', count: 0 })
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, JSON.stringify(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(JSON.parse(wrapper.find('[data-testid="value"]').text())).toEqual(data)
    })

    it('should persist JSON changes', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<TestItem[]>('test-json', [])
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state = [{ id: '1', name: 'New Item' }]
      await nextTick()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'anasa-test-json',
        JSON.stringify([{ id: '1', name: 'New Item' }])
      )
    })

    it('should handle deep changes with arrays', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<TestItem[]>('test-json', [{ id: '1', name: 'Original' }])
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state.push({ id: '2', name: 'Added' })
      await nextTick()

      // Deep watching should trigger save
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should handle invalid JSON in localStorage gracefully', async () => {
      localStorageMock.store['anasa-test-json'] = 'not valid json'
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedJson<TestItem[]>('test-json', [])
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, JSON.stringify(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      // Should keep default value on parse error
      expect(wrapper.find('[data-testid="value"]').text()).toBe('[]')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('usePersistedState with custom serializer', () => {
    it('should use string serializer', async () => {
      localStorageMock.store['anasa-test-str'] = 'hello world'

      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedState('test-str', '', { serializer: 'string' })
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, this.state)
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('hello world')
    })

    it('should persist string changes', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedState('test-str', '', { serializer: 'string' })
          return { state }
        },
        render() {
          return h('div')
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      wrapper.vm.state = 'updated value'
      await nextTick()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anasa-test-str', 'updated value')
    })
  })

  describe('storage key prefixing', () => {
    it('should prefix all keys with anasa-', async () => {
      const TestComponent = defineComponent({
        setup() {
          const boolState = usePersistedBoolean('my-setting', false)
          const numState = usePersistedNumber('my-number', 0)
          const jsonState = usePersistedJson('my-data', {})
          return { boolState, numState, jsonState }
        },
        render() {
          return h('div')
        },
      })

      mount(TestComponent)
      await flushPromises()

      // When mounted, localStorage.getItem should be called with prefixed keys
      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-my-setting')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-my-number')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('anasa-my-data')
    })
  })

  describe('reactivity', () => {
    it('should be reactive', async () => {
      const TestComponent = defineComponent({
        setup() {
          const state = usePersistedBoolean('reactive-test', false)
          return { state }
        },
        render() {
          return h('div', { 'data-testid': 'value' }, String(this.state))
        },
      })

      const wrapper = mount(TestComponent)
      await flushPromises()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('false')

      wrapper.vm.state = true
      await nextTick()

      expect(wrapper.find('[data-testid="value"]').text()).toBe('true')
    })
  })
})
