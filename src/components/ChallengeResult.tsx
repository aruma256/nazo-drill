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
      <h3 className="mb-3 text-left text-sm font-bold text-gray-600">
        解答履歴
      </h3>
      <div className="rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-center text-gray-500">#</th>
              <th className="px-2 py-2 text-center text-gray-500">問題</th>
              <th className="px-2 py-2 text-center text-gray-500">回答</th>
              <th className="px-2 py-2 text-center text-gray-500">正解</th>
              <th className="px-2 py-2 text-center text-gray-500">結果</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr
                key={entry.id}
                className={entry.isCorrect ? 'bg-green-50' : 'bg-red-50'}
              >
                <td className="px-2 py-2 text-gray-400">{entry.id}</td>
                <td className="px-2 py-2 font-mono">
                  {questionRenderer
                    ? questionRenderer(entry.question)
                    : entry.question.question}
                </td>
                <td className="px-2 py-2 font-mono">
                  {entry.userAnswer || '-'}
                </td>
                <td className="px-2 py-2 font-mono">{entry.question.answer}</td>
                <td className="px-2 py-2 text-center">
                  {entry.isCorrect ? (
                    <span className="text-green-600">○</span>
                  ) : (
                    <span className="text-red-600">×</span>
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
    <div className="rounded-lg bg-white/70 p-6 text-center">
      <h2 className="mb-2 text-xl font-bold text-gray-800">結果発表</h2>
      <p className="mb-6 text-sm text-gray-500">{timeLimit}秒チャレンジ</p>

      <div className="mb-8">
        <div className="text-6xl font-bold text-indigo-600">{score}</div>
        <div className="mt-1 text-lg text-gray-600">問正解</div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-indigo-700"
        >
          もう一度チャレンジ
        </button>
        <button
          onClick={handleShare}
          className="w-full rounded-lg bg-black px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-gray-800"
        >
          結果を𝕏でシェア！
        </button>
        <button
          onClick={onBack}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50"
        >
          モード選択に戻る
        </button>
      </div>

      {history && history.length > 0 && (
        <HistoryTable history={history} questionRenderer={questionRenderer} />
      )}
    </div>
  )
}
