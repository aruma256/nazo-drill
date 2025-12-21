import { useDrillStorage } from '../hooks'

interface ModeButtonProps {
  /** ボタンに表示するラベル */
  label: string
  /** モード名（localStorageのキーに使用） */
  mode: string
  /** ドリル名（localStorageのキーに使用） */
  drillName: string
  /** クリック時のコールバック */
  onClick: () => void
  /** 無効状態（準備中など） */
  disabled?: boolean
  /** アイコン（オプション） */
  icon?: React.ReactNode
  /** アニメーション遅延（スタガード用） */
  animationDelay?: string
}

/**
 * モード選択ボタン
 * - ポイント（累計正答数）を表示
 * - disabled時はポイント非表示＆グレーアウト
 */
export function ModeButton({
  label,
  mode,
  drillName,
  onClick,
  disabled = false,
  icon,
  animationDelay,
}: ModeButtonProps) {
  const { getCorrectCount } = useDrillStorage(drillName)
  const points = getCorrectCount(mode)

  if (disabled) {
    return (
      <button
        disabled
        className="font-display w-full cursor-not-allowed rounded-2xl bg-gray-100 px-6 py-5 text-lg font-bold text-gray-400"
        style={{ animationDelay }}
      >
        <div className="flex items-center justify-center gap-3">
          {icon && <span className="text-2xl opacity-50">{icon}</span>}
          <span>{label}</span>
        </div>
        <span className="mt-1 block text-sm font-normal text-gray-300">
          準備中
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="animate-fade-in-up group relative w-full overflow-hidden rounded-2xl border-2 border-transparent bg-white px-6 py-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--drill-primary)] hover:shadow-xl active:scale-[0.98]"
      style={{ animationDelay }}
    >
      {/* Gradient border effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, var(--drill-primary-light) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
          )}
          <span className="font-display text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-drill-primary-dark">
            {label}
          </span>
        </div>

        {/* Points badge */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-all duration-300"
            style={{
              backgroundColor:
                points > 0 ? 'var(--drill-primary-light)' : '#f1f5f9',
              color: points > 0 ? 'var(--drill-primary)' : '#94a3b8',
            }}
          >
            <span className="font-mono">{points}</span>
            <span className="text-xs opacity-70">pt</span>
          </div>

          {/* Arrow indicator */}
          <svg
            className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--drill-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  )
}
