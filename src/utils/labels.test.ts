import { describe, it, expect } from 'vitest'
import { getEfficiencyLabel } from './labels'

describe('getEfficiencyLabel', () => {
  describe('when leaveDays is 0', () => {
    it('should return free days label', () => {
      expect(getEfficiencyLabel(0, 2)).toBe('2 δωρεάν ημέρες')
      expect(getEfficiencyLabel(0, 3)).toBe('3 δωρεάν ημέρες')
      expect(getEfficiencyLabel(0, 5)).toBe('5 δωρεάν ημέρες')
      expect(getEfficiencyLabel(0, 10)).toBe('10 δωρεάν ημέρες')
    })

    it('should handle single free day', () => {
      expect(getEfficiencyLabel(0, 1)).toBe('1 δωρεάν ημέρες')
    })
  })

  describe('when leaveDays is 1 (singular)', () => {
    it('should return singular form "ημέρα"', () => {
      expect(getEfficiencyLabel(1, 3)).toBe('Κάντε 1 ημέρα 3')
      expect(getEfficiencyLabel(1, 5)).toBe('Κάντε 1 ημέρα 5')
      expect(getEfficiencyLabel(1, 9)).toBe('Κάντε 1 ημέρα 9')
    })
  })

  describe('when leaveDays is greater than 1 (plural)', () => {
    it('should return plural form "ημέρες"', () => {
      expect(getEfficiencyLabel(2, 5)).toBe('Κάντε 2 ημέρες 5')
      expect(getEfficiencyLabel(3, 7)).toBe('Κάντε 3 ημέρες 7')
      expect(getEfficiencyLabel(5, 9)).toBe('Κάντε 5 ημέρες 9')
      expect(getEfficiencyLabel(10, 15)).toBe('Κάντε 10 ημέρες 15')
    })
  })

  describe('edge cases', () => {
    it('should handle large numbers', () => {
      expect(getEfficiencyLabel(20, 30)).toBe('Κάντε 20 ημέρες 30')
      expect(getEfficiencyLabel(100, 150)).toBe('Κάντε 100 ημέρες 150')
    })

    it('should handle equal leave and total days', () => {
      expect(getEfficiencyLabel(5, 5)).toBe('Κάντε 5 ημέρες 5')
      expect(getEfficiencyLabel(1, 1)).toBe('Κάντε 1 ημέρα 1')
    })
  })
})
