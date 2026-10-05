import { useEffect, useRef } from 'react'
import type { HistoryEntry } from '../types/drill'

/**
 * チャレンジモードのタイムアップ処理を提供するカスタムフック
 * 残り時間が0になったときに、回答済みの履歴でタイムアップコールバックを呼び出す
 *
 * @param remainingTime - 残り時間（秒）
 * @param score - 現在のスコア
 * @param history - 回答履歴
 * @param onTimeUp - タイムアップ時のコールバック関数
 */
export function useChallengeTimeUp(
  remainingTime: number,
  score: number,
  history: HistoryEntry[],
  onTimeUp: (score: number, history: HistoryEntry[]) => void,
) {
  const finishedRef = useRef(false)
  useEffect(() => {
    if (remainingTime === 0 && !finishedRef.current) {
      finishedRef.current = true
      onTimeUp(score, history)
    }
  }, [remainingTime, score, history, onTimeUp])
}
