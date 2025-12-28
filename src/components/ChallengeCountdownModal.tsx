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
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
      setAnimationKey((prev) => prev + 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [count, onComplete])

  if (count === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--drill-primary) 30%, transparent) 0%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />

      {/* Countdown number */}
      <div className="relative">
        {/* Pulse ring effect */}
        <div
          key={`ring-${animationKey}`}
          className="absolute inset-0 animate-ping rounded-full opacity-30"
          style={{
            backgroundColor: 'var(--drill-primary)',
            transform: 'scale(2)',
          }}
        />

        {/* Number container */}
        <div
          key={`num-${animationKey}`}
          className="animate-countdown-pulse relative flex h-40 w-40 items-center justify-center rounded-full shadow-2xl"
          style={{
            background:
              'linear-gradient(135deg, var(--drill-primary), var(--drill-primary-dark))',
          }}
        >
          <span className="font-display text-8xl font-black tabular-nums text-white">
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}
