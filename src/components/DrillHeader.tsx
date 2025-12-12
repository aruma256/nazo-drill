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
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <span className="mr-2 text-xl">←</span>
          <span className="font-medium">{backLabel}</span>
        </Link>
      </div>
      <h1 className="mb-2 text-center text-3xl font-bold text-indigo-900 md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-center text-gray-700">{description}</p>
      )}
    </header>
  )
}
