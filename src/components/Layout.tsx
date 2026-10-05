import { useEffect, type ReactNode } from 'react'
import { DRILL_THEMES, type DrillId } from '../constants/theme'

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'

interface LayoutProps {
  children: ReactNode
  maxWidth?: MaxWidth
  className?: string
  drillId?: DrillId
  /** 問題画面では上下の余白を抑え、モバイルの表示領域を確保する。 */
  compact?: boolean
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

const DEFAULT_THEME = {
  primary: '#6366f1',
  dark: '#4f46e5',
  light: '#e0e7ff',
  accent: '#a5b4fc',
}

export function Layout({
  children,
  maxWidth = '4xl',
  className = '',
  drillId,
  compact = false,
}: LayoutProps) {
  useEffect(() => {
    const theme = drillId ? DRILL_THEMES[drillId] : DEFAULT_THEME
    const root = document.documentElement
    root.style.setProperty('--drill-primary', theme.primary)
    root.style.setProperty('--drill-primary-dark', theme.dark)
    root.style.setProperty('--drill-primary-light', theme.light)
    root.style.setProperty('--drill-accent', theme.accent)
  }, [drillId])

  return (
    <div
      className={`container relative z-10 mx-auto px-4 ${compact ? 'py-4' : 'py-8'} ${maxWidthClasses[maxWidth]} ${className}`}
    >
      {children}
    </div>
  )
}
