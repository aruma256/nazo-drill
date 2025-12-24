import type { ReactNode } from 'react'
import type { DrillId } from '../constants/theme'

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
  return (
    <div
      className={`container relative z-10 mx-auto px-4 py-8 ${maxWidthClasses[maxWidth]} ${className}`}
      data-drill={drillId}
    >
      {children}
    </div>
  )
}
