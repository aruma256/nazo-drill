import { Link } from 'react-router-dom'

interface DrillHeaderProps {
  title: string
  description?: string
  backTo?: string
  backLabel?: string
}

export function DrillHeader({
  title,
  description,
  backTo = '/',
  backLabel = 'トップへ戻る',
}: DrillHeaderProps) {
  return (
    <header className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={backTo}
          className="btn-secondary flex items-center px-3 py-2 text-sm"
        >
          <span className="mr-2">←</span>
          <span className="font-medium">{backLabel}</span>
        </Link>
      </div>
      <h1 className="drill-title mb-2 text-center text-3xl md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-center" style={{ color: 'var(--color-ink-light)' }}>
          {description}
        </p>
      )}
    </header>
  )
}
