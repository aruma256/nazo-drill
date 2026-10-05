import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDrillSession } from '../useDrillSession'

beforeEach(() => {
  localStorage.clear()
})

describe('useDrillSession', () => {
  it('独自判定を1回だけ行い、得点・履歴・累計正答数に同じ結果を反映する', () => {
    const question = { question: '13', answer: '東京都' }
    const validateAnswer = vi.fn((answer: string) => answer === 'とうきょう')
    const key = 'test-drill-practice-correctCount'
    localStorage.setItem(key, '7')
    const { result } = renderHook(
      () =>
        useDrillSession({
          validateAnswer,
          storage: { drillName: 'test-drill', mode: 'practice' },
        }),
      { wrapper: StrictMode },
    )

    act(() => {
      expect(result.current.submitAnswer(question, 'とうきょう')).toBe(true)
      expect(result.current.submitAnswer(question, '大阪')).toBe(false)
    })

    expect(validateAnswer).toHaveBeenCalledTimes(2)
    expect(validateAnswer).toHaveBeenNthCalledWith(1, 'とうきょう', question)
    expect(result.current.score).toBe(1)
    expect(localStorage.getItem(key)).toBe('8')
    expect(result.current.history).toEqual([
      { id: 1, question, userAnswer: 'とうきょう', isCorrect: true },
      { id: 2, question, userAnswer: '大阪', isCorrect: false },
    ])
  })

  it('セッションをリセットしても累計正答数は維持する', () => {
    const { result } = renderHook(() =>
      useDrillSession({
        storage: { drillName: 'test-drill', mode: 'challenge' },
      }),
    )
    act(() => {
      result.current.submitAnswer({ question: '1', answer: 'A' }, 'ａ')
    })
    expect(result.current.score).toBe(1)
    act(() => {
      result.current.resetSession()
    })
    expect(result.current.score).toBe(0)
    expect(result.current.history).toEqual([])
    expect(localStorage.getItem('test-drill-challenge-correctCount')).toBe('1')
    act(() => {
      result.current.submitAnswer({ question: '2', answer: 'B' }, 'b')
    })
    expect(result.current.history[0].id).toBe(1)
    expect(localStorage.getItem('test-drill-challenge-correctCount')).toBe('2')
  })

  it('保存先を省略した場合はlocalStorageを更新せず、履歴だけを消せる', () => {
    const { result } = renderHook(() => useDrillSession())
    act(() => {
      result.current.submitAnswer({ question: '1', answer: 'A' }, 'A')
    })
    act(() => {
      result.current.clearHistory()
    })
    expect(result.current.score).toBe(1)
    expect(result.current.history).toEqual([])
    expect(localStorage.length).toBe(0)
  })
})
