import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDrill } from '../useDrill'
import type { Question } from '../useDrill'

describe('useDrill', () => {
  // テスト用の問題生成関数
  const createMockGenerator = (questions: Question[]) => {
    let index = 0
    return vi.fn(() => {
      const question = questions[index % questions.length]
      index++
      return question
    })
  }

  describe('presentQuestion', () => {
    it('should present a question from the generator', () => {
      const generator = createMockGenerator([
        { question: 'What is 1+1?', answer: '2' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      expect(result.current.currentQuestion).toEqual({
        question: 'What is 1+1?',
        answer: '2',
      })
    })

    it('should avoid presenting the same question consecutively', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'A1' },
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })
      expect(result.current.currentQuestion?.question).toBe('Q1')

      act(() => {
        result.current.presentQuestion()
      })
      // Q1が連続したので、Q2が選ばれるはず
      expect(result.current.currentQuestion?.question).toBe('Q2')
    })

    it('should increment totalQuestions on each presentation', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      expect(result.current.totalQuestions).toBe(0)

      act(() => {
        result.current.presentQuestion()
      })
      expect(result.current.totalQuestions).toBe(1)

      act(() => {
        result.current.presentQuestion()
      })
      expect(result.current.totalQuestions).toBe(2)
    })
  })

  describe('checkAnswer', () => {
    it('should return true for correct answer', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'HELLO' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      let isCorrect = false
      act(() => {
        isCorrect = result.current.checkAnswer('HELLO')
      })

      expect(isCorrect).toBe(true)
    })

    it('should return false for incorrect answer', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'HELLO' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      let isCorrect = true
      act(() => {
        isCorrect = result.current.checkAnswer('WRONG')
      })

      expect(isCorrect).toBe(false)
    })

    it('should be case-insensitive', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'Hello' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      let isCorrect = false
      act(() => {
        isCorrect = result.current.checkAnswer('hello')
      })

      expect(isCorrect).toBe(true)
    })

    it('should trim whitespace', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'ABC' }])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      let isCorrect = false
      act(() => {
        isCorrect = result.current.checkAnswer('  ABC  ')
      })

      expect(isCorrect).toBe(true)
    })

    it('should increment score on correct answer', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'A1' }])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      expect(result.current.score).toBe(0)

      act(() => {
        result.current.checkAnswer('A1')
      })

      expect(result.current.score).toBe(1)
    })

    it('should not increment score on incorrect answer', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'A1' }])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('WRONG')
      })

      expect(result.current.score).toBe(0)
    })

    it('should throw error when no question is presented', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'A1' }])
      const { result } = renderHook(() => useDrill(generator))

      expect(() => {
        result.current.checkAnswer('A1')
      }).toThrow('No question has been presented')
    })
  })

  describe('getScoreStats', () => {
    it('should return correct statistics', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
        { question: 'Q3', answer: 'A3' },
        { question: 'Q4', answer: 'A4' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      // 4問中2問正解
      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('A1') // correct
      })
      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('WRONG') // incorrect
      })
      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('A3') // correct
      })
      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('WRONG') // incorrect
      })

      expect(result.current.getScoreStats()).toEqual({
        score: 2,
        total: 4,
        percentage: 50,
      })
    })

    it('should return 0 percentage when no questions answered', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'A1' }])
      const { result } = renderHook(() => useDrill(generator))

      expect(result.current.getScoreStats()).toEqual({
        score: 0,
        total: 0,
        percentage: 0,
      })
    })
  })

  describe('resetScore', () => {
    it('should reset score and totalQuestions to 0', () => {
      const generator = createMockGenerator([
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })
      act(() => {
        result.current.checkAnswer('A1')
      })
      act(() => {
        result.current.presentQuestion()
      })

      expect(result.current.score).toBe(1)
      expect(result.current.totalQuestions).toBe(2)

      act(() => {
        result.current.resetScore()
      })

      expect(result.current.score).toBe(0)
      expect(result.current.totalQuestions).toBe(0)
    })

    it('should clear current question', () => {
      const generator = createMockGenerator([{ question: 'Q1', answer: 'A1' }])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })
      expect(result.current.currentQuestion).not.toBeNull()

      act(() => {
        result.current.resetScore()
      })
      expect(result.current.currentQuestion).toBeNull()
    })
  })

  describe('subtext support', () => {
    it('should preserve subtext in question', () => {
      const generator = createMockGenerator([
        { question: '5', answer: 'E', subtext: '/26' },
      ])
      const { result } = renderHook(() => useDrill(generator))

      act(() => {
        result.current.presentQuestion()
      })

      expect(result.current.currentQuestion).toEqual({
        question: '5',
        answer: 'E',
        subtext: '/26',
      })
    })
  })
})
