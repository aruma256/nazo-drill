import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDrillStorage } from '../useDrillStorage'

describe('useDrillStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getCorrectCount', () => {
    it('should return 0 when no data exists', () => {
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      expect(result.current.getCorrectCount('beginner')).toBe(0)
    })

    it('should return the stored count', () => {
      localStorage.setItem('test-drill-beginner-correctCount', '5')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      expect(result.current.getCorrectCount('beginner')).toBe(5)
    })
  })

  describe('incrementCorrectCount', () => {
    it('should increment from 0 to 1', () => {
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      act(() => {
        result.current.incrementCorrectCount('beginner')
      })

      expect(result.current.getCorrectCount('beginner')).toBe(1)
      expect(localStorage.getItem('test-drill-beginner-correctCount')).toBe('1')
    })

    it('should increment existing count', () => {
      localStorage.setItem('test-drill-advanced-correctCount', '10')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      act(() => {
        result.current.incrementCorrectCount('advanced')
      })

      expect(result.current.getCorrectCount('advanced')).toBe(11)
    })

    it('should return the new count', () => {
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      let newCount = 0
      act(() => {
        newCount = result.current.incrementCorrectCount('beginner')
      })

      expect(newCount).toBe(1)
    })
  })

  describe('resetCorrectCount', () => {
    it('should reset count to 0', () => {
      localStorage.setItem('test-drill-beginner-correctCount', '15')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      act(() => {
        result.current.resetCorrectCount('beginner')
      })

      expect(result.current.getCorrectCount('beginner')).toBe(0)
      expect(
        localStorage.getItem('test-drill-beginner-correctCount'),
      ).toBeNull()
    })
  })

  describe('getAllCorrectCounts', () => {
    it('should return all modes with their counts', () => {
      localStorage.setItem('test-drill-beginner-correctCount', '5')
      localStorage.setItem('test-drill-advanced-correctCount', '10')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      const counts = result.current.getAllCorrectCounts([
        'beginner',
        'advanced',
      ])

      expect(counts).toEqual({
        beginner: 5,
        advanced: 10,
      })
    })

    it('should return 0 for modes without stored data', () => {
      localStorage.setItem('test-drill-beginner-correctCount', '5')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      const counts = result.current.getAllCorrectCounts([
        'beginner',
        'advanced',
      ])

      expect(counts).toEqual({
        beginner: 5,
        advanced: 0,
      })
    })
  })

  describe('getHighScore', () => {
    it('should return 0 when no data exists', () => {
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      expect(result.current.getHighScore('challenge')).toBe(0)
    })

    it('should return the stored high score', () => {
      localStorage.setItem('test-drill-challenge-highScore', '15')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      expect(result.current.getHighScore('challenge')).toBe(15)
    })
  })

  describe('updateHighScore', () => {
    it('should save the score when no previous high score exists', () => {
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      let newHighScore = 0
      act(() => {
        newHighScore = result.current.updateHighScore('challenge', 10)
      })

      expect(newHighScore).toBe(10)
      expect(localStorage.getItem('test-drill-challenge-highScore')).toBe('10')
    })

    it('should update the score when it is higher than the current high score', () => {
      localStorage.setItem('test-drill-challenge-highScore', '5')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      let newHighScore = 0
      act(() => {
        newHighScore = result.current.updateHighScore('challenge', 10)
      })

      expect(newHighScore).toBe(10)
      expect(localStorage.getItem('test-drill-challenge-highScore')).toBe('10')
    })

    it('should not update the score when it is lower than the current high score', () => {
      localStorage.setItem('test-drill-challenge-highScore', '15')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      let returnedScore = 0
      act(() => {
        returnedScore = result.current.updateHighScore('challenge', 10)
      })

      expect(returnedScore).toBe(15)
      expect(localStorage.getItem('test-drill-challenge-highScore')).toBe('15')
    })

    it('should not update the score when it is equal to the current high score', () => {
      localStorage.setItem('test-drill-challenge-highScore', '10')
      const { result } = renderHook(() => useDrillStorage('test-drill'))

      let returnedScore = 0
      act(() => {
        returnedScore = result.current.updateHighScore('challenge', 10)
      })

      expect(returnedScore).toBe(10)
      expect(localStorage.getItem('test-drill-challenge-highScore')).toBe('10')
    })
  })
})
