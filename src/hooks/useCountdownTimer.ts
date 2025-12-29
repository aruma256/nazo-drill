import { useCallback, useEffect, useState } from 'react'

interface UseCountdownTimerReturn {
  /** 残り時間（秒） */
  remainingTime: number
  /** 指定秒数を減らす（ペナルティ用） */
  subtractTime: (seconds: number) => void
}

/**
 * カウントダウンタイマーのカスタムフック
 * @param initialSeconds 初期秒数
 * @returns 残り時間と時間操作関数
 */
export function useCountdownTimer(
  initialSeconds: number,
): UseCountdownTimerReturn {
  const [remainingTime, setRemainingTime] = useState(initialSeconds)

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const subtractTime = useCallback((seconds: number) => {
    setRemainingTime((prev) => Math.max(0, prev - seconds))
  }, [])

  return { remainingTime, subtractTime }
}
