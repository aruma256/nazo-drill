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
        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        <span className="mr-1">←</span>
        <span>やめる</span>
      </button>
      <span className="text-sm text-gray-500">{drillLabel}</span>
    </div>
  )
}
