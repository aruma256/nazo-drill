import { describe, expect, it } from 'vitest'
import {
  getRandomInt,
  getRandomElement,
  getRandomElementExcluding,
} from '../random'

describe('getRandomInt', () => {
  it('should return a number within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomInt(1, 10)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('should return the same number when min equals max', () => {
    expect(getRandomInt(5, 5)).toBe(5)
  })
})

describe('getRandomElement', () => {
  it('should return an element from the array', () => {
    const array = ['a', 'b', 'c', 'd', 'e']
    for (let i = 0; i < 100; i++) {
      const result = getRandomElement(array)
      expect(array).toContain(result)
    }
  })

  it('should return the only element from a single-element array', () => {
    expect(getRandomElement(['only'])).toBe('only')
  })
})

describe('getRandomElementExcluding', () => {
  it('should exclude the specified value', () => {
    const array = ['a', 'b', 'c']
    for (let i = 0; i < 100; i++) {
      const result = getRandomElementExcluding(array, 'a')
      expect(result).not.toBe('a')
      expect(array).toContain(result)
    }
  })

  it('should return any element when lastValue is null', () => {
    const array = ['a', 'b', 'c']
    for (let i = 0; i < 100; i++) {
      const result = getRandomElementExcluding(array, null)
      expect(array).toContain(result)
    }
  })

  it('should work with custom key function', () => {
    const array = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ]
    for (let i = 0; i < 100; i++) {
      const result = getRandomElementExcluding(array, 1, (item) => item.id)
      expect(result.id).not.toBe(1)
    }
  })

  it('should return the element when array has only one item', () => {
    const array = ['only']
    expect(getRandomElementExcluding(array, 'only')).toBe('only')
  })
})
