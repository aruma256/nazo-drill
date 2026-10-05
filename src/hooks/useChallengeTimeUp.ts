import { useEffect, useRef } from 'react'
import type { HistoryEntry, Question } from '../types/drill'

/**
 * チャレンジモードのタイムアップ処理を提供するカスタムフック
 * 残り時間が0になったときに、現在の問題を履歴に追加してタイムアップコールバックを呼び出す
 *
 * @param remainingTime - 残り時間（秒）
 * @param score - 現在のスコア
 * @param history - 回答履歴
 * @param currentQuestion - 現在出題中の未完了の問題（あれば）
 * @param onTimeUp - タイムアップ時のコールバック関数
 * @param userAnswer - 時間切れ時の回答（魔方陣では途中の盤面）
 */
export function useChallengeTimeUp(
  remainingTime: number,
  score: number,
  history: HistoryEntry[],
  currentQuestion: Question | null,
  onTimeUp: (score: number, history: HistoryEntry[]) => void,
  userAnswer = '',
) {
  const finishedRef = useRef(false)
  useEffect(() => {
    if (remainingTime === 0 && !finishedRef.current) {
      finishedRef.current = true
      // 未完了の問題があれば、時間切れ時の回答を履歴に追加
      let finalHistory = history
      if (currentQuestion) {
        finalHistory = [
          ...history,
          {
            id: history.length + 1,
            question: currentQuestion,
            userAnswer,
            isCorrect: false,
          },
        ]
      }
      onTimeUp(score, finalHistory)
    }
  }, [remainingTime, score, history, currentQuestion, onTimeUp, userAnswer])
}
