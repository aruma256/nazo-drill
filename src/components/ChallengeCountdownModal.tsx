import { useEffect, useState } from 'react'

interface ChallengeCountdownModalProps {
  /** カウントダウン完了時のコールバック */
  onComplete: () => void
}

/**
 * 実力テスト開始前のカウントダウンモーダル
 * 3 → 2 → 1 と表示し、0になったらonCompleteを呼ぶ
 */
export function ChallengeCountdownModal({
  onComplete,
}: ChallengeCountdownModalProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [count, onComplete])

  if (count === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="text-9xl font-bold text-white tabular-nums">{count}</div>
    </div>
  )
}
