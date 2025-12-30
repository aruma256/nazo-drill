import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DRILL_THEMES, type DrillId } from '../constants'

interface DrillCardProps {
  to: string
  title: string
  description: string
  children: ReactNode
  drillId?: DrillId
  points?: number
  actionLabel?: string
  comingSoon?: boolean
}

export function DrillCard({
  to,
  title,
  description,
  children,
  drillId,
  points,
  actionLabel = '練習する',
  comingSoon = false,
}: DrillCardProps) {
  const theme = drillId ? DRILL_THEMES[drillId] : null

  const cardContent = (
    <>
      {/* Theme color ribbon */}
      {theme && (
        <div
          className="absolute left-0 top-0 h-full w-2 transition-all duration-300 group-hover:w-3"
          style={{ backgroundColor: theme.primary }}
        />
      )}

      {/* Points badge */}
      {typeof points === 'number' && points > 0 && (
        <div
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: theme?.primary ?? '#6366f1' }}
        >
          {points >= 1000 ? `${Math.floor(points / 1000)}k` : points}
        </div>
      )}

      {/* Card content */}
      <div className="p-6 pl-6">
        {/* Icon and title row */}
        <div className="mb-3 flex items-center gap-3">
          {theme && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md"
              style={{
                backgroundColor: theme.primary,
                fontFamily:
                  theme.icon === 'あ'
                    ? 'var(--font-display)'
                    : theme.icon === '1→A'
                      ? 'var(--font-mono)'
                      : 'inherit',
              }}
            >
              {theme.icon}
            </div>
          )}
          <h3 className="font-display text-xl font-bold text-gray-800">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          {description}
        </p>

        {/* Example preview area */}
        <div
          className="rounded-xl p-4 transition-colors duration-300"
          style={{
            backgroundColor: theme ? theme.light : '#f8fafc',
          }}
        >
          {children}
        </div>

        {/* Hover indicator */}
        {!comingSoon && (
          <div
            className="mt-4 flex items-center justify-end gap-1 text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: theme?.primary ?? '#6366f1' }}
          >
            {actionLabel}
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}

        {/* Coming Soon badge */}
        {comingSoon && (
          <div className="mt-4 flex items-center justify-end">
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-500">
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </>
  )

  const baseClassName =
    'group relative block overflow-hidden rounded-2xl bg-white transition-all duration-300'
  const hoverClassName = comingSoon
    ? ''
    : 'hover:-translate-y-1 hover:shadow-2xl'
  const opacityClassName = comingSoon ? 'opacity-70' : ''

  if (comingSoon) {
    return (
      <div
        className={`${baseClassName} ${hoverClassName} ${opacityClassName} cursor-default`}
        style={{
          boxShadow: `0 4px 20px -2px ${theme ? theme.primary + '20' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className={`${baseClassName} ${hoverClassName}`}
      style={{
        boxShadow: `0 4px 20px -2px ${theme ? theme.primary + '20' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      {cardContent}
    </Link>
  )
}

interface DrillExampleProps {
  question: string
  answer: string
}

export function DrillExample({ question, answer }: DrillExampleProps) {
  return (
    <div className="text-center">
      <div className="font-mono mb-2 text-2xl font-bold text-gray-800">
        {question}
      </div>
      <div className="text-sm text-gray-500">
        <span>答え：</span>
        <span className="font-mono font-bold">{answer}</span>
      </div>
    </div>
  )
}
