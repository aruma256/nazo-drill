const POSITIONS = Array.from({ length: 9 }, (_, index) => ({
  id: `${Math.floor(index / 3)}-${index % 3}`,
  index,
  row: Math.floor(index / 3) + 1,
  column: (index % 3) + 1,
}))

interface MagicSquareBoardProps {
  cells: readonly number[]
  givens?: readonly number[]
  onSelect?: (index: number) => void
  disabled?: boolean
  wrongIndex?: number | null
  size?: 'normal' | 'small'
  label?: string
}

export function MagicSquareBoard({
  cells,
  givens = cells,
  onSelect,
  disabled = false,
  wrongIndex = null,
  size = 'normal',
  label = '3×3魔方陣',
}: MagicSquareBoardProps) {
  const small = size === 'small'
  return (
    <div
      role={onSelect ? 'group' : 'img'}
      aria-label={
        onSelect
          ? label
          : `${label}：${cells.map((number) => number || '空欄').join('、')}`
      }
      className={`mx-auto grid grid-cols-3 ${
        small
          ? 'w-24 gap-1 rounded-lg bg-drill-accent/40 p-1'
          : 'w-full max-w-[300px] gap-2 rounded-2xl bg-drill-accent/40 p-2 shadow-inner'
      }`}
    >
      {POSITIONS.map(({ id, index, row, column }) => {
        const number = cells[index]
        const wrong = wrongIndex === index
        const given = givens[index] !== 0
        const classes = `flex aspect-square min-w-0 items-center justify-center border-2 font-mono font-bold ${
          small ? 'rounded text-lg' : 'rounded-xl text-4xl sm:text-5xl'
        } ${
          wrong
            ? 'border-red-400 bg-red-50 text-red-500'
            : number !== 0
              ? given
                ? 'border-transparent bg-drill-primary-light text-drill-primary-dark'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-transparent bg-white text-gray-300'
        }`
        if (!onSelect) {
          return (
            <span key={id} className={classes}>
              {number || '·'}
            </span>
          )
        }
        return (
          <button
            key={id}
            type="button"
            aria-label={`${row}行${column}列、${number || '空欄'}`}
            aria-invalid={wrong || undefined}
            disabled={disabled || number !== 0}
            onClick={() => {
              onSelect(index)
            }}
            className={`${classes} touch-manipulation select-none transition-colors enabled:cursor-pointer enabled:hover:border-drill-primary enabled:hover:bg-drill-primary-light/50 enabled:active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-drill-primary disabled:cursor-default`}
          >
            {wrong ? '×' : number || <span aria-hidden="true">·</span>}
          </button>
        )
      })}
    </div>
  )
}
