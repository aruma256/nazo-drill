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
  const isCritical = remainingSeconds <= 5

  return (
    <div className="mb-6">
      {/* Timer display */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
              isLowTime ? 'bg-red-100' : 'bg-indigo-100'
            }`}
          >
            <svg
              className={`h-4 w-4 ${isLowTime ? 'text-red-600' : 'text-indigo-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="font-display text-sm font-medium text-gray-600">
            残り時間
          </span>
        </div>

        <div
          className={`font-mono text-3xl font-black tabular-nums transition-all duration-300 ${
            isCritical
              ? 'animate-pulse text-red-600'
              : isLowTime
                ? 'text-red-600'
                : 'text-indigo-600'
          }`}
        >
          {remainingSeconds}
          <span className="ml-1 text-lg font-medium text-gray-400">秒</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-linear ${
            isLowTime
              ? 'bg-gradient-to-r from-red-500 to-rose-400'
              : 'bg-gradient-to-r from-indigo-500 to-purple-400'
          }`}
          style={{ width: `${progress}%` }}
        />

        {/* Glow effect when low time */}
        {isLowTime && (
          <div
            className="absolute left-0 top-0 h-full animate-pulse rounded-full bg-red-400 opacity-50 blur-sm"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  )
}
