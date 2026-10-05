import type { ReactNode } from 'react'
import type { HistoryEntry, Question } from '../types/drill'
import { SectionHeader } from './SectionHeader'

interface ChallengeHistoryProps {
  history: HistoryEntry[]
  questionRenderer?: (question: Question) => ReactNode
  /** 盤面など、表に収めにくい回答はカードの内容を渡す。 */
  entryRenderer?: (entry: HistoryEntry) => ReactNode
}

function AnswerResult({ isCorrect }: { isCorrect: boolean }) {
  return (
    <span
      role="img"
      aria-label={isCorrect ? '正解' : '不正解'}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
        isCorrect
          ? 'bg-emerald-100 text-emerald-600'
          : 'bg-rose-100 text-rose-600'
      }`}
    >
      {isCorrect ? '✓' : '✗'}
    </span>
  )
}

/** 回答済みの問題の履歴。見出し・番号・正誤表示を全ドリルで共有する。 */
export function ChallengeHistory({
  history,
  questionRenderer,
  entryRenderer,
}: ChallengeHistoryProps) {
  if (history.length === 0) return null

  return (
    <section className="mt-8">
      <SectionHeader>解答履歴</SectionHeader>
      {entryRenderer ? (
        <ol className="space-y-3">
          {history.map((entry) => (
            <li key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3 text-sm font-bold text-gray-600">
                <span>{entry.id}問目</span>
                <AnswerResult isCorrect={entry.isCorrect} />
              </div>
              {entryRenderer(entry)}
            </li>
          ))}
        </ol>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  問題
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  回答
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  正解
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  結果
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((entry) => (
                <tr
                  key={entry.id}
                  className={`transition-colors ${entry.isCorrect ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}
                >
                  <td className="px-3 py-3 text-center text-gray-400">
                    {entry.id}
                  </td>
                  <td className="px-3 py-3 text-center font-mono">
                    {questionRenderer
                      ? questionRenderer(entry.question)
                      : entry.question.question}
                  </td>
                  <td className="px-3 py-3 text-center font-mono">
                    {entry.userAnswer || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-medium">
                    {entry.question.answer}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <AnswerResult isCorrect={entry.isCorrect} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
