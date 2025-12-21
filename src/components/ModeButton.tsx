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
}: ModeButtonProps) {
  const { getCorrectCount } = useDrillStorage(drillName)
  const points = getCorrectCount(mode)

  if (disabled) {
    return (
      <button disabled className="mode-button w-full cursor-not-allowed">
        {label}
      </button>
    )
  }

  return (
    <button onClick={onClick} className="mode-button w-full cursor-pointer">
      <span className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
        {label}
      </span>
      <span className="points-badge ml-2">{points} pt</span>
    </button>
  )
}
