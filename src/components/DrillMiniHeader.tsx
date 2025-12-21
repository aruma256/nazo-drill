/**
 * ドリル画面用のミニヘッダー
 */
export function DrillMiniHeader({
  onBack,
  drillLabel,
}: {
  onBack: () => void
  drillLabel: string
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <button
        onClick={onBack}
        className="flex items-center rounded-md px-2 py-1 text-sm transition-colors"
        style={{
          color: 'var(--drill-primary, var(--color-ink-light))',
        }}
      >
        <span className="mr-1">←</span>
        <span>やめる</span>
      </button>
      <span className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        {drillLabel}
      </span>
    </div>
  )
}
