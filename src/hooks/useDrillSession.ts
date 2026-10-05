import { useCallback, useState } from 'react'
import { toHalfWidthAlpha } from '../utils'
import { incrementStoredCorrectCount } from './useDrillStorage'
import type { HistoryEntry, Question } from '../types/drill'

export interface DrillSessionOptions {
  /** 省略時は英字の大小・全角半角と前後の空白を揃えて比較する。 */
  validateAnswer?: (userAnswer: string, question: Question) => boolean
  /** 指定したモードの累計正答数を、正答時に更新する。 */
  storage?: { drillName: string; mode: string }
}

function validateDefaultAnswer(userAnswer: string, question: Question) {
  const normalize = (answer: string) =>
    toHalfWidthAlpha(answer).trim().toUpperCase()
  return normalize(userAnswer) === normalize(question.answer)
}

/** 1回の判定結果から得点・履歴・累計正答数を更新する。 */
export function useDrillSession({
  validateAnswer = validateDefaultAnswer,
  storage,
}: DrillSessionOptions = {}) {
  const [session, setSession] = useState<{
    score: number
    history: HistoryEntry[]
  }>({ score: 0, history: [] })
  const drillName = storage?.drillName
  const mode = storage?.mode

  /** 盤面完成など、ドリル固有の操作で判定済みの場合も同じ経路で記録する。 */
  const recordAnswer = useCallback(
    ({
      question,
      userAnswer,
      isCorrect,
    }: Omit<HistoryEntry, 'id'>): boolean => {
      if (isCorrect && drillName !== undefined && mode !== undefined) {
        incrementStoredCorrectCount(drillName, mode)
      }
      setSession((previous) => ({
        score: previous.score + (isCorrect ? 1 : 0),
        history: [
          ...previous.history,
          {
            id: previous.history.length + 1,
            question,
            userAnswer,
            isCorrect,
          },
        ],
      }))
      return isCorrect
    },
    [drillName, mode],
  )

  const submitAnswer = useCallback(
    (question: Question, userAnswer: string): boolean => {
      return recordAnswer({
        question,
        userAnswer,
        isCorrect: validateAnswer(userAnswer, question),
      })
    },
    [validateAnswer, recordAnswer],
  )

  const resetSession = useCallback(() => {
    setSession({ score: 0, history: [] })
  }, [])
  const clearHistory = useCallback(() => {
    setSession((previous) => ({ ...previous, history: [] }))
  }, [])

  return { ...session, submitAnswer, recordAnswer, resetSession, clearHistory }
}
