/**
 * usePersistedState Composable
 *
 * Provides reactive state that automatically persists to localStorage.
 * Reduces boilerplate for loading/saving settings.
 */

import { ref, watch, onMounted, type Ref } from 'vue'

const STORAGE_PREFIX = 'anasa-'

type Serializer<T> = {
  read: (raw: string) => T
  write: (value: T) => string
}

// Built-in serializers
const serializers = {
  boolean: {
    read: (raw: string) => raw === 'true',
    write: (value: boolean) => String(value),
  } as Serializer<boolean>,

  number: {
    read: (raw: string) => {
      const num = parseInt(raw, 10)
      return isNaN(num) ? 0 : num
    },
    write: (value: number) => String(value),
  } as Serializer<number>,

  string: {
    read: (raw: string) => raw,
    write: (value: string) => value,
  } as Serializer<string>,

  json: <T>() =>
    ({
      read: (raw: string) => JSON.parse(raw) as T,
      write: (value: T) => JSON.stringify(value),
    }) as Serializer<T>,
}

export type SerializerType = 'boolean' | 'number' | 'string' | 'json'

interface UsePersistedStateOptions<T> {
  /** Type of serializer to use */
  serializer?: SerializerType
  /** Custom serializer (overrides serializer option) */
  customSerializer?: Serializer<T>
  /** Whether to watch deeply (for objects/arrays) */
  deep?: boolean
}

/**
 * Create a reactive ref that persists to localStorage
 *
 * @param key - Storage key (will be prefixed with 'anasa-')
 * @param defaultValue - Default value if nothing in storage
 * @param options - Configuration options
 * @returns Reactive ref that auto-syncs with localStorage
 *
 * @example
 * // Boolean setting
 * const darkMode = usePersistedState('dark-mode', false, { serializer: 'boolean' })
 *
 * @example
 * // Number setting
 * const totalDays = usePersistedState('total-days', 25, { serializer: 'number' })
 *
 * @example
 * // JSON array/object
 * const holidays = usePersistedState<CustomHoliday[]>('custom-holidays', [], {
 *   serializer: 'json',
 *   deep: true
 * })
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options: UsePersistedStateOptions<T> = {}
): Ref<T> {
  const { serializer = 'json', customSerializer, deep = false } = options

  // Determine which serializer to use
  const getSerializer = (): Serializer<T> => {
    if (customSerializer) return customSerializer
    if (serializer === 'json') return serializers.json<T>()
    return serializers[serializer] as unknown as Serializer<T>
  }

  const ser = getSerializer()
  const state = ref(defaultValue) as Ref<T>
  const storageKey = `${STORAGE_PREFIX}${key}`

  // Load from localStorage on mount
  onMounted(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) {
      try {
        state.value = ser.read(stored)
      } catch (e) {
        console.error(`Failed to parse stored value for ${storageKey}:`, e)
      }
    }
  })

  // Watch and persist changes
  watch(
    state,
    (newValue) => {
      try {
        localStorage.setItem(storageKey, ser.write(newValue))
      } catch (e) {
        console.error(`Failed to save value for ${storageKey}:`, e)
      }
    },
    { deep }
  )

  return state
}

/**
 * Convenience function for boolean settings
 */
export function usePersistedBoolean(key: string, defaultValue: boolean = false): Ref<boolean> {
  return usePersistedState(key, defaultValue, { serializer: 'boolean' })
}

/**
 * Convenience function for number settings
 */
export function usePersistedNumber(key: string, defaultValue: number = 0): Ref<number> {
  return usePersistedState(key, defaultValue, { serializer: 'number' })
}

/**
 * Convenience function for JSON (array/object) settings
 */
export function usePersistedJson<T>(key: string, defaultValue: T): Ref<T> {
  return usePersistedState(key, defaultValue, { serializer: 'json', deep: true })
}
