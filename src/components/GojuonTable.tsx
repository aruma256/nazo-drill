/* eslint-disable react-x/no-array-index-key -- 五十音表は固定配列のためindexをkeyに使用 */
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
      <table className="gojuon-table">
        <tbody>
          {GOJUON_TABLE.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                const isEmpty = isEmptyCell(rowIndex, colIndex)
                const number = markedMap.get(`${rowIndex}-${colIndex}`)
                const isMarked = number !== undefined

                // た〜も特訓モード時の境界線
                const borderStyle =
                  isTaMoMode && colIndex === 5
                    ? {
                        borderLeft: '2px solid var(--color-ink)',
                        borderRight: '2px solid var(--color-ink)',
                      }
                    : {}

                return (
                  <td
                    key={colIndex}
                    className={`gojuon-cell ${sizeClasses.cell} ${sizeClasses.text} ${
                      isEmpty
                        ? 'gojuon-cell-empty'
                        : isMarked
                          ? 'gojuon-cell-marked'
                          : 'gojuon-cell-normal'
                    }`}
                    style={borderStyle}
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
