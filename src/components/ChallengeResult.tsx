import type { ReactNode } from 'react'
import type { HistoryEntry, Question } from '../hooks'

interface ChallengeResultProps {
  /** 正答数 */
  score: number
  /** 制限時間（秒） */
  timeLimit: number
  /** ドリル名（シェア用） */
  drillName: string
  /** 「もう一度」ボタン押下時のコールバック */
  onRetry: () => void
  /** 「戻る」ボタン押下時のコールバック */
  onBack: () => void
  /** 解答履歴（オプショナル） */
  history?: HistoryEntry[]
  /** 問題列のカスタム表示（オプショナル） */
  questionRenderer?: (question: Question) => ReactNode
}

/**
 * 解答履歴テーブルコンポーネント
 */
function HistoryTable({
  history,
  questionRenderer,
}: {
  history: HistoryEntry[]
  questionRenderer?: (question: Question) => ReactNode
}) {
  if (history.length === 0) return null

  return (
    <div className="mt-6">
      <h3
        className="mb-3 text-left text-sm font-bold"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        解答履歴
      </h3>
      <div
        className="overflow-hidden rounded-lg"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>問題</th>
              <th>回答</th>
              <th>正解</th>
              <th>結果</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr
                key={entry.id}
                className={
                  entry.isCorrect
                    ? 'history-row-correct'
                    : 'history-row-incorrect'
                }
              >
                <td style={{ color: 'var(--color-ink-muted)' }}>{entry.id}</td>
                <td className="font-mono">
                  {questionRenderer
                    ? questionRenderer(entry.question)
                    : entry.question.question}
                </td>
                <td className="font-mono">{entry.userAnswer || '-'}</td>
                <td className="font-mono">{entry.question.answer}</td>
                <td className="text-center">
                  {entry.isCorrect ? (
                    <span style={{ color: 'var(--color-correct)' }}>○</span>
                  ) : (
                    <span style={{ color: 'var(--color-incorrect)' }}>×</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * 実力テスト結果表示コンポーネント
 */
export function ChallengeResult({
  score,
  timeLimit,
  drillName,
  onRetry,
  onBack,
  history,
  questionRenderer,
}: ChallengeResultProps) {
  const handleShare = () => {
    const text = `#ナゾドリル 【${drillName}】実力テストで ${score}問 正解しました！\n\nhttps://nazo-drill.aruma256.dev/`
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="card p-6 text-center">
      <h2
        className="mb-2 text-xl font-bold"
        style={{ color: 'var(--color-ink)' }}
      >
        結果発表
      </h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        {timeLimit}秒チャレンジ
      </p>

      <div className="score-display mb-8">
        <div className="score-number">{score}</div>
        <div
          className="mt-1 text-lg"
          style={{ color: 'var(--color-ink-light)' }}
        >
          問正解
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="btn btn-challenge w-full px-6 py-3"
        >
          もう一度チャレンジ
        </button>
        <button
          onClick={handleShare}
          className="btn w-full px-6 py-3"
          style={{ background: '#000', color: '#fff' }}
        >
          結果を𝕏でシェア！
        </button>
        <button onClick={onBack} className="btn btn-secondary w-full px-6 py-3">
          モード選択に戻る
        </button>
      </div>

      {history && history.length > 0 && (
        <HistoryTable history={history} questionRenderer={questionRenderer} />
      )}
    </div>
  )
}
