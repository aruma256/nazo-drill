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
  const isLarge = size === 'large'

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className={`overflow-hidden ${isLarge ? 'rounded-xl shadow-lg' : 'rounded-lg'}`}
        style={{
          border: isLarge
            ? '2px solid var(--drill-primary)'
            : '1px solid #d1d5db',
        }}
      >
        <table className="border-collapse">
          <tbody>
            {GOJUON_TABLE.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((_, colIndex) => {
                  const isEmpty = isEmptyCell(rowIndex, colIndex)
                  const number = markedMap.get(`${rowIndex}-${colIndex}`)
                  const isMarked = number !== undefined

                  return (
                    <td
                      key={colIndex}
                      className={`${sizeClasses.cell} ${sizeClasses.text} text-center font-bold transition-colors duration-200`}
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: isLarge
                          ? 'var(--drill-primary-light)'
                          : '#d1d5db',
                        backgroundColor: isEmpty
                          ? '#1f2937'
                          : isMarked
                            ? 'var(--drill-primary-light)'
                            : '#ffffff',
                        color: isMarked
                          ? 'var(--drill-primary)'
                          : 'var(--drill-primary)',
                        ...(isTaMoMode && colIndex === 5
                          ? {
                              borderLeftWidth: '2px',
                              borderRightWidth: '2px',
                              borderLeftColor: '#374151',
                              borderRightColor: '#374151',
                            }
                          : {}),
                      }}
                    >
                      {isMarked && (
                        <span
                          className={
                            isLarge ? 'animate-bounce-in inline-block' : ''
                          }
                        >
                          {number}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
