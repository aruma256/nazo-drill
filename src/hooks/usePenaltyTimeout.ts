import { useCallback, useEffect, useRef, useState } from 'react'
import { PENALTY_DISPLAY_DURATION_MS } from '../constants/challenge'

/**
 * ペナルティ表示を一定時間後に自動的に解除するためのカスタムフック
 *
 * @returns isPenalized - ペナルティ表示中かどうか
 * @returns activatePenalty - ペナルティ表示を開始する関数
 */
export function usePenaltyTimeout() {
  const [isPenalized, setIsPenalized] = useState(false)
  const timeoutIdRef = useRef<number | null>(null)

  const activatePenalty = useCallback(() => {
    // 既存のタイムアウトをクリア
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current)
    }

    setIsPenalized(true)
    timeoutIdRef.current = window.setTimeout(() => {
      setIsPenalized(false)
      timeoutIdRef.current = null
    }, PENALTY_DISPLAY_DURATION_MS)
  }, [])

  // クリーンアップ: コンポーネントのアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [])

  return { isPenalized, activatePenalty }
}
