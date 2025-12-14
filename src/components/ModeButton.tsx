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
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-6 py-4 text-lg font-bold text-gray-400"
      >
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
    >
      {label}
      <span className="mt-1 block text-sm font-normal text-gray-500">
        {points} pt
      </span>
    </button>
  )
}
