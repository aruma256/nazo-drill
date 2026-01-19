interface ScoreDisplayProps {
  score: number
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="mb-4 text-center">
      <span className="text-sm text-gray-500">正解数</span>
      <span className="ml-2 text-2xl font-bold text-drill-primary">
        {score}
      </span>
    </div>
  )
}
