import type { CSSProperties, ReactNode } from 'react'
import { DRILL_THEMES, type DrillId } from '../constants/theme'

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'

interface LayoutProps {
  children: ReactNode
  maxWidth?: MaxWidth
  className?: string
  drillId?: DrillId
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

export function Layout({
  children,
  maxWidth = '4xl',
  className = '',
  drillId,
}: LayoutProps) {
  const theme = drillId ? DRILL_THEMES[drillId] : null
  const drillStyle: CSSProperties | undefined = theme
    ? ({
        '--drill-primary': theme.primary,
        '--drill-primary-dark': theme.dark,
        '--drill-primary-light': theme.light,
        '--drill-accent': theme.accent,
      } as CSSProperties)
    : undefined

  return (
    <div
      className={`container relative z-10 mx-auto px-4 py-8 ${maxWidthClasses[maxWidth]} ${className}`}
      style={drillStyle}
    >
      {children}
    </div>
  )
}
