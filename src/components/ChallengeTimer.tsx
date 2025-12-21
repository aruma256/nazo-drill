interface ChallengeTimerProps {
  /** 残り時間（秒） */
  remainingSeconds: number
  /** 合計時間（秒） */
  totalSeconds: number
}

/**
 * 実力テスト用カウントダウンタイマー
 */
export function ChallengeTimer({
  remainingSeconds,
  totalSeconds,
}: ChallengeTimerProps) {
  const progress = (remainingSeconds / totalSeconds) * 100
  const isLowTime = remainingSeconds <= 10

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          残り時間
        </span>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{
            color: isLowTime
              ? 'var(--color-incorrect)'
              : 'var(--color-challenge)',
          }}
        >
          {remainingSeconds}秒
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${isLowTime ? 'challenge-timer-low' : 'challenge-timer'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
