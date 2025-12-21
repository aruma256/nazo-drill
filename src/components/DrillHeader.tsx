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
    <header className="animate-fade-in-up mb-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          to={backTo}
          className="group inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[var(--drill-primary)] hover:shadow-md"
        >
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLabel}
        </Link>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="font-display mb-3 text-3xl font-black text-gray-900 md:text-4xl">
          <span className="relative inline-block">
            {title}
            {/* Decorative underline */}
            <span
              className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--drill-primary), var(--drill-accent))',
              }}
            />
          </span>
        </h1>

        {description && <p className="mt-4 text-gray-600">{description}</p>}
      </div>
    </header>
  )
}
