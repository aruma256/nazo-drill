import { useId } from 'react'
import generatedShapes from './shapes.json'
import { PREFECTURE_MAP_COLORS } from '../../constants/theme'

const shapes: Partial<
  Record<string, { name: string; path: string; lakePath: string }>
> = generatedShapes

export function PrefectureShape({
  prefectureId,
  className = '',
  label = '出題中の都道府県の形',
}: {
  prefectureId: number
  className?: string
  label?: string
}) {
  const clipId = useId()
  const shape = shapes[String(prefectureId)]
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shape?.path} clipRule="evenodd" />
        </clipPath>
      </defs>
      <path
        d={shape?.path}
        fill={PREFECTURE_MAP_COLORS.land}
        fillRule="evenodd"
      />
      {shape?.lakePath && (
        <path
          d={shape.lakePath}
          fill={PREFECTURE_MAP_COLORS.lake}
          fillRule="evenodd"
          stroke={PREFECTURE_MAP_COLORS.border}
          strokeWidth="0.7"
          strokeLinejoin="round"
          clipPath={`url(#${clipId})`}
        />
      )}
      <path
        d={shape?.path}
        fill="none"
        stroke={PREFECTURE_MAP_COLORS.border}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
