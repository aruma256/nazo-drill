import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChallengeDrill } from '../useChallengeDrill'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../../constants/challenge'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function createGenerator() {
  let count = 0
  return vi.fn(() => ({ question: String(++count), answer: 'A' }))
}

describe('useChallengeDrill', () => {
  it('初回出題はStrictModeでも1回で、誤答の直後も回答を受け付ける', () => {
    const generateQuestion = createGenerator()
    const { result } = renderHook(
      () =>
        useChallengeDrill(generateQuestion, {
          onTimeUp: vi.fn(),
          storage: { drillName: 'test', mode: 'challenge' },
        }),
      { wrapper: StrictMode },
    )
    expect(generateQuestion).toHaveBeenCalledTimes(1)
    expect(result.current.totalQuestions).toBe(1)

    act(() => {
      result.current.submitAnswer()
    })
    expect(result.current.history).toHaveLength(0)
    act(() => {
      result.current.setUserAnswer('?')
    })
    act(() => {
      result.current.submitAnswer()
    })
    expect(result.current.remainingTime).toBe(
      CHALLENGE_TIME_LIMIT - WRONG_ANSWER_PENALTY_SECONDS,
    )
    expect(result.current.isPenalized).toBe(true)
    expect(result.current.userAnswer).toBe('')
    expect(result.current.currentQuestion?.question).toBe('2')

    act(() => {
      result.current.setUserAnswer('ａ')
    })
    act(() => {
      result.current.submitAnswer()
    })
    expect(result.current.isPenalized).toBe(true)
    expect(result.current.score).toBe(1)
    expect(
      result.current.history.map(({ userAnswer, isCorrect }) => ({
        userAnswer,
        isCorrect,
      })),
    ).toEqual([
      { userAnswer: '?', isCorrect: false },
      { userAnswer: 'ａ', isCorrect: true },
    ])
    expect(localStorage.getItem('test-challenge-correctCount')).toBe('1')
  })

  it('時間切れを1回通知し、その後は回答や問題更新を受け付けない', () => {
    const generateQuestion = createGenerator()
    const onTimeUp = vi.fn()
    const { result, rerender } = renderHook(
      () => useChallengeDrill(generateQuestion, { onTimeUp }),
      { wrapper: StrictMode },
    )
    act(() => {
      result.current.setUserAnswer('途中の入力')
    })
    act(() => {
      vi.advanceTimersByTime(CHALLENGE_TIME_LIMIT * 1000)
    })
    expect(result.current.isFinished).toBe(true)
    expect(onTimeUp).toHaveBeenCalledExactlyOnceWith(0, [])

    act(() => {
      result.current.setUserAnswer('A')
    })
    act(() => {
      result.current.submitAnswer()
    })
    rerender()
    expect(result.current.score).toBe(0)
    expect(result.current.history).toHaveLength(0)
    expect(generateQuestion).toHaveBeenCalledTimes(1)
    expect(onTimeUp).toHaveBeenCalledTimes(1)
  })
})
