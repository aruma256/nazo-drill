import { StrictMode } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useChallengeTimeUp } from '../useChallengeTimeUp'
import type { HistoryEntry } from '../useDrill'

describe('useChallengeTimeUp', () => {
  it('回答済みの履歴だけを渡し、再レンダーやStrictModeでも終了を1回だけ通知する', () => {
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
        useChallengeTimeUp(remainingTime, 1, history, onTimeUp)
      },
      { initialProps: { remainingTime: 1 }, wrapper: StrictMode },
    )
    expect(onTimeUp).not.toHaveBeenCalled()
    rerender({ remainingTime: 0 })
    rerender({ remainingTime: 0 })
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(onTimeUp).toHaveBeenCalledWith(1, history)
    expect(history).toHaveLength(1)
  })

  it('時間切れからマウントした場合も、終了を二重に通知しない', () => {
    const onTimeUp = vi.fn()
    renderHook(
      () => {
        useChallengeTimeUp(0, 0, [], onTimeUp)
      },
      {
        wrapper: StrictMode,
      },
    )
    expect(onTimeUp).toHaveBeenCalledExactlyOnceWith(0, [])
  })
})
