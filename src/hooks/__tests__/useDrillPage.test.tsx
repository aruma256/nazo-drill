import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDrillPage } from '../useDrillPage'
import type { HistoryEntry } from '../../types/drill'

beforeEach(() => {
  localStorage.clear()
})

describe('useDrillPage', () => {
  it('練習モードの選択と暗記ノートから開始画面へ戻れる', () => {
    const { result } = renderHook(
      () => useDrillPage<'single' | 'word'>('123-abc'),
      { wrapper: StrictMode },
    )
    expect(result.current.state).toEqual({ screen: 'start' })
    act(() => {
      result.current.startPractice('single')
    })
    expect(result.current.state).toEqual({ screen: 'drill', mode: 'single' })
    act(() => {
      result.current.backToStart()
    })
    act(() => {
      result.current.startPractice('word')
    })
    expect(result.current.state).toEqual({ screen: 'drill', mode: 'word' })
    act(() => {
      result.current.backToStart()
      result.current.openNote()
    })
    expect(result.current.state).toEqual({ screen: 'note' })
    act(() => {
      result.current.backToStart()
    })
    expect(result.current.state).toEqual({ screen: 'start' })
  })

  it.each([
    ['123-abc', undefined, 'challenge'],
    ['prefecture-shape', 'prefecture-challenge', 'prefecture-challenge'],
    ['magic-square', 'two-clues-challenge', 'two-clues-challenge'],
  ])(
    '%sは既存の保存キーへ最高記録を保存し、再挑戦では結果をリセットする',
    (drillName, challengeMode, storageMode) => {
      const key = `${drillName}-${storageMode}-highScore`
      localStorage.setItem(key, '2')
      const history: HistoryEntry[] = [
        {
          id: 1,
          question: { question: '1', answer: 'A' },
          userAnswer: 'A',
          isCorrect: true,
        },
      ]
      const { result } = renderHook(
        () => useDrillPage(drillName, { challengeMode }),
        { wrapper: StrictMode },
      )
      act(() => {
        result.current.startChallenge()
      })
      expect(result.current.state).toEqual({ screen: 'countdown' })
      act(() => {
        result.current.completeCountdown()
      })
      expect(result.current.state).toEqual({ screen: 'challenge' })
      act(() => {
        result.current.finishChallenge(3, history)
      })
      expect(result.current.state).toEqual({
        screen: 'challengeResult',
        result: { score: 3, history },
      })
      expect(localStorage.getItem(key)).toBe('3')
      act(() => {
        result.current.startChallenge()
      })
      expect(result.current.state).toEqual({ screen: 'countdown' })
      act(() => {
        result.current.completeCountdown()
        result.current.finishChallenge(0, [])
      })
      expect(result.current.state).toEqual({
        screen: 'challengeResult',
        result: { score: 0, history: [] },
      })
      expect(localStorage.getItem(key)).toBe('3')
      act(() => {
        result.current.backToStart()
      })
      expect(result.current.state).toEqual({ screen: 'start' })
    },
  )
})
