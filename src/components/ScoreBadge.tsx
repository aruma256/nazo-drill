interface ScoreBadgeProps {
  /** バッジに表示するラベル（例: "累計"、"最高"） */
  label: string
  /** 表示する値 */
  value: number
  /** 単位（例: "問"） */
  unit: string
}

/**
 * スコア表示バッジ
 * 値が0より大きい場合はテーマカラーで、0の場合はグレーで表示する
 */
export function ScoreBadge({ label, value, unit }: ScoreBadgeProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-all duration-300"
      style={{
        backgroundColor: value > 0 ? 'var(--drill-primary-light)' : '#f1f5f9',
        color: value > 0 ? 'var(--drill-primary)' : '#94a3b8',
      }}
    >
      <span className="text-xs opacity-70">{label}</span>
      <span className="font-mono">{value}</span>
      <span className="text-xs opacity-70">{unit}</span>
    </div>
  )
}
