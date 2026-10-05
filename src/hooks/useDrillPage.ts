import { useCallback, useState } from 'react'
import { useDrillStorage } from './useDrillStorage'
import type { DrillPageState, HistoryEntry } from '../types/drill'

/** 開始・練習・実力テスト・結果の画面遷移と、最高記録の保存。 */
export function useDrillPage<Mode extends string = string>(
  drillName: string,
  { challengeMode = 'challenge' }: { challengeMode?: string } = {},
) {
  const [state, setState] = useState<DrillPageState<Mode>>({ screen: 'start' })
  const { updateHighScore } = useDrillStorage(drillName)

  const startPractice = useCallback((mode: Mode) => {
    setState({ screen: 'drill', mode })
  }, [])
  const startChallenge = useCallback(() => {
    setState({ screen: 'countdown' })
  }, [])
  const completeCountdown = useCallback(() => {
    setState({ screen: 'challenge' })
  }, [])
  const finishChallenge = useCallback(
    (score: number, history: HistoryEntry[]) => {
      updateHighScore(challengeMode, score)
      setState({ screen: 'challengeResult', result: { score, history } })
    },
    [challengeMode, updateHighScore],
  )
  const backToStart = useCallback(() => {
    setState({ screen: 'start' })
  }, [])
  const openNote = useCallback(() => {
    setState({ screen: 'note' })
  }, [])

  return {
    state,
    startPractice,
    startChallenge,
    completeCountdown,
    finishChallenge,
    backToStart,
    openNote,
  }
}

export type DrillPageController<Mode extends string> = ReturnType<
  typeof useDrillPage<Mode>
>
