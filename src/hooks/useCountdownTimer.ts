import { useEffect, useState } from 'react'

/**
 * カウントダウンタイマーのカスタムフック
 * @param initialSeconds 初期秒数
 * @returns 残り時間（秒）
 */
export function useCountdownTimer(initialSeconds: number): number {
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

  return remainingTime
}
