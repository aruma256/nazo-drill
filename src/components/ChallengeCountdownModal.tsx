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
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at center,
            ${count === 3 ? 'rgba(239, 68, 68, 0.3)' : count === 2 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'} 0%,
            rgba(0, 0, 0, 0.7) 100%)`,
        }}
      />

      {/* Countdown number */}
      <div className="relative">
        {/* Pulse ring effect */}
        <div
          key={`ring-${animationKey}`}
          className="absolute inset-0 animate-ping rounded-full opacity-30"
          style={{
            backgroundColor:
              count === 3 ? '#ef4444' : count === 2 ? '#f59e0b' : '#10b981',
            transform: 'scale(2)',
          }}
        />

        {/* Number container */}
        <div
          key={`num-${animationKey}`}
          className="animate-countdown-pulse relative flex h-40 w-40 items-center justify-center rounded-full shadow-2xl"
          style={{
            background:
              count === 3
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : count === 2
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
          }}
        >
          <span className="font-display text-8xl font-black tabular-nums text-white">
            {count}
          </span>
        </div>
      </div>

      {/* Ready text */}
      <div className="absolute bottom-1/4 text-center">
        <p className="font-display text-2xl font-bold text-white/90">
          {count === 3
            ? '準備はいい？'
            : count === 2
              ? 'もうすぐ...'
              : 'スタート！'}
        </p>
      </div>
    </div>
  )
}
