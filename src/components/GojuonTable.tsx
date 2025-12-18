import {
  GOJUON_TABLE,
  isEmptyCell,
  type MarkedCell,
} from '../drills/gojuonPick'

/**
 * 五十音表のサイズ設定
 */
type TableSize = 'small' | 'medium' | 'large'

const SIZE_CLASSES: Record<TableSize, { cell: string; text: string }> = {
  small: { cell: 'h-4 w-4', text: 'text-[0.6rem]' },
  medium: { cell: 'h-5 w-5', text: 'text-xs' },
  large: { cell: 'h-8 w-8 sm:h-10 sm:w-10', text: 'text-base sm:text-xl' },
}

interface GojuonTableProps {
  /** マークされたセルの配列 */
  markedCells: MarkedCell[]
  /** テーブルのサイズ */
  size: TableSize
  /** 「た」〜「も」特訓モード（境界線を表示） */
  isTaMoMode?: boolean
  /** 追加のmarginクラス */
  className?: string
}

/**
 * 五十音表コンポーネント
 * トップページのサンプル表示からドリル本体まで共通で使用
 */
export function GojuonTable({
  markedCells,
  size,
  isTaMoMode = false,
  className = 'mb-4',
}: GojuonTableProps) {
  // マークされたセルをマップ化（高速検索用）
  const markedMap = new Map<string, number>()
  for (const cell of markedCells) {
    markedMap.set(`${cell.row}-${cell.col}`, cell.number)
  }

  const sizeClasses = SIZE_CLASSES[size]

  return (
    <div className={`flex justify-center ${className}`}>
      <table className="border-collapse border border-gray-400">
        <tbody>
          {GOJUON_TABLE.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                const isEmpty = isEmptyCell(rowIndex, colIndex)
                const number = markedMap.get(`${rowIndex}-${colIndex}`)
                const isMarked = number !== undefined

                // た〜も特訓モード時の境界線
                const borderClass =
                  isTaMoMode && colIndex === 5
                    ? 'border-l-2 border-r-2 border-gray-700'
                    : ''

                return (
                  <td
                    key={colIndex}
                    className={`${sizeClasses.cell} ${sizeClasses.text} border border-gray-400 text-center font-bold text-indigo-600 ${
                      isEmpty
                        ? 'bg-neutral-800'
                        : isMarked
                          ? 'bg-amber-100'
                          : 'bg-white'
                    } ${borderClass}`}
                  >
                    {isMarked ? number : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 「くるま」を表示するサンプル用のマーク配列
 * トップページやルール説明で使用
 */
export const KURUMA_SAMPLE_MARKS: MarkedCell[] = [
  { row: 2, col: 9, number: 1 }, // く
  { row: 2, col: 2, number: 2 }, // る
  { row: 0, col: 4, number: 3 }, // ま
]
