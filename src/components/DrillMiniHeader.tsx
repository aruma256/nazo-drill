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
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={onBack}
        className="group flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[var(--drill-primary)] hover:shadow-md"
      >
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span>やめる</span>
      </button>

      <span
        className="rounded-full px-3 py-1 text-sm font-medium"
        style={{
          backgroundColor: 'var(--drill-primary-light)',
          color: 'var(--drill-primary)',
        }}
      >
        {drillLabel}
      </span>
    </div>
  )
}
