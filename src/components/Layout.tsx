import type { ReactNode } from 'react'

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'

interface LayoutProps {
  children: ReactNode
  maxWidth?: MaxWidth
  className?: string
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
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div
        className={`container mx-auto px-4 py-8 ${maxWidthClasses[maxWidth]} ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
