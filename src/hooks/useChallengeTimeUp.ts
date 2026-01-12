import { useEffect } from 'react'
import type { HistoryEntry, Question } from './useDrill'

/**
 * チャレンジモードのタイムアップ処理を提供するカスタムフック
 * 残り時間が0になったときに、現在の問題を履歴に追加してタイムアップコールバックを呼び出す
 *
 * @param remainingTime - 残り時間（秒）
 * @param score - 現在のスコア
 * @param history - 回答履歴
 * @param currentQuestion - 現在出題中の問題（あれば）
 * @param onTimeUp - タイムアップ時のコールバック関数
 */
export function useChallengeTimeUp(
  remainingTime: number,
  score: number,
  history: HistoryEntry[],
  currentQuestion: Question | null,
  onTimeUp: (score: number, history: HistoryEntry[]) => void,
) {
  useEffect(() => {
    if (remainingTime === 0) {
      // 出題中の問題があれば、空回答として履歴に追加
      let finalHistory = history
      if (currentQuestion) {
        finalHistory = [
          ...history,
          {
            id: history.length + 1,
            question: currentQuestion,
            userAnswer: '',
            isCorrect: false,
          },
        ]
      }
      onTimeUp(score, finalHistory)
    }
  }, [remainingTime, score, history, currentQuestion, onTimeUp])
}
