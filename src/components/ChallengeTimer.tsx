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
        <span className="text-sm font-medium text-gray-600">残り時間</span>
        <span
          className={`text-2xl font-bold tabular-nums ${
            isLowTime ? 'text-red-600' : 'text-indigo-600'
          }`}
        >
          {remainingSeconds}秒
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isLowTime ? 'bg-red-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
