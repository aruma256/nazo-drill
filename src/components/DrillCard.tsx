import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type DrillTheme = 'gojuon' | 'num' | 'shift' | 'pref'

interface DrillCardProps {
  to: string
  title: string
  description: string
  theme?: DrillTheme
  children: ReactNode
}

export function DrillCard({
  to,
  title,
  description,
  theme = 'num',
  children,
}: DrillCardProps) {
  return (
    <Link to={to} className={`drill-card drill-theme-${theme} block p-6`}>
      <h3
        className="mb-3 text-xl font-bold"
        style={{ color: 'var(--color-ink)' }}
      >
        {title}
      </h3>
      <p className="mb-3" style={{ color: 'var(--color-ink-light)' }}>
        {description}
      </p>
      {children}
    </Link>
  )
}

interface DrillExampleProps {
  question: string
  answer: string
}

export function DrillExample({ question, answer }: DrillExampleProps) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{ backgroundColor: 'var(--color-paper-warm)' }}
    >
      <div
        className="mb-1 text-2xl font-bold"
        style={{ color: 'var(--drill-primary, var(--color-ink))' }}
      >
        {question}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        答え：
        <span className="font-bold" style={{ color: 'var(--color-correct)' }}>
          {answer}
        </span>
      </div>
    </div>
  )
}
