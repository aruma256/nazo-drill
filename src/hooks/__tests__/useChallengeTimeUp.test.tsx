import { StrictMode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useChallengeTimeUp } from '../useChallengeTimeUp'
import type { HistoryEntry } from '../useDrill'

describe('useChallengeTimeUp', () => {
  it('時間切れに未回答を追加し、再レンダーやStrictModeでも終了を1回だけ通知する', () => {
    const question = { question: '2', answer: 'B' }
    const history: HistoryEntry[] = [
      {
        id: 1,
        question: { question: '1', answer: 'A' },
        userAnswer: 'A',
        isCorrect: true,
      },
    ]
    const onTimeUp = vi.fn()
    const { rerender } = renderHook(
      ({ remainingTime }) => {
        useChallengeTimeUp(remainingTime, 1, history, question, onTimeUp)
      },
      { initialProps: { remainingTime: 1 }, wrapper: StrictMode },
    )
    expect(onTimeUp).not.toHaveBeenCalled()
    rerender({ remainingTime: 0 })
    rerender({ remainingTime: 0 })
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(onTimeUp).toHaveBeenCalledWith(1, [
      ...history,
      { id: 2, question, userAnswer: '', isCorrect: false },
    ])
    expect(history).toHaveLength(1)
  })

  it('途中の盤面を残し、時間切れからマウントした場合も終了を二重に通知しない', () => {
    const question = { question: '810000000', answer: '816357492' }
    const onTimeUp = vi.fn()
    renderHook(
      () => {
        useChallengeTimeUp(0, 0, [], question, onTimeUp, '810000002')
      },
      { wrapper: StrictMode },
    )
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(onTimeUp).toHaveBeenCalledWith(0, [
      { id: 1, question, userAnswer: '810000002', isCorrect: false },
    ])
  })

  it('未完了の問題がなければ時間切れの記録を追加しない', () => {
    const onTimeUp = vi.fn()
    renderHook(() => {
      useChallengeTimeUp(0, 0, [], null, onTimeUp)
    })
    expect(onTimeUp).toHaveBeenCalledWith(0, [])
  })
})
