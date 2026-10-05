import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { HistoryEntry, Question } from '../types/drill'
import { ChallengeHistory } from './ChallengeHistory'

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
  /** 盤面などの解答履歴カードの内容。 */
  historyEntryRenderer?: (entry: HistoryEntry) => ReactNode
}

/**
 * スコアカウントアップアニメーション
 */
function AnimatedScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target === 0) return

    const duration = 1000 // 1秒
    const steps = Math.min(target, 20)
    const stepDuration = duration / steps

    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrent(Math.round((step / steps) * target))
      if (step >= steps) {
        clearInterval(interval)
        setCurrent(target)
      }
    }, stepDuration)

    return () => {
      clearInterval(interval)
    }
  }, [target])

  return <span className="font-mono tabular-nums">{current}</span>
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
  historyEntryRenderer,
}: ChallengeResultProps) {
  const handleShare = () => {
    const text = `#ナゾドリル 【${drillName}】実力テストで ${score}問 正解しました！\nhttps://nazo-drill.aruma256.dev/`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      {/* Result card */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Header decoration */}
        <div
          className="h-2"
          style={{
            background:
              'linear-gradient(90deg, var(--drill-primary), var(--drill-accent))',
          }}
        />

        <div className="p-8 text-center">
          {/* Trophy icon */}
          <div className="animate-bounce-in mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200">
            <svg
              className="h-8 w-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L9 8L2 9L7 14L5.5 21L12 17.5L18.5 21L17 14L22 9L15 8L12 2Z" />
            </svg>
          </div>

          <h2 className="font-display mb-1 text-2xl font-black text-gray-800">
            結果発表
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            実力テスト（{timeLimit}秒）
          </p>

          {/* Score display */}
          <div className="mb-8">
            <div
              className="text-7xl font-black"
              style={{ color: 'var(--drill-primary)' }}
            >
              <AnimatedScore target={score} />
            </div>
            <div className="mt-2 text-lg font-medium text-gray-600">問正解</div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="group w-full cursor-pointer rounded-2xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              style={{
                background:
                  'linear-gradient(135deg, var(--drill-primary), var(--drill-primary-dark))',
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                もう一度チャレンジ
              </span>
            </button>

            <button
              onClick={handleShare}
              className="group w-full cursor-pointer rounded-2xl bg-black px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-900 hover:shadow-xl active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                結果をシェア！
              </span>
            </button>

            <button
              onClick={onBack}
              className="w-full cursor-pointer rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 font-bold text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
            >
              モード選択に戻る
            </button>
          </div>
        </div>
      </div>

      {/* History table */}
      {history && history.length > 0 && (
        <ChallengeHistory
          history={history}
          questionRenderer={questionRenderer}
          entryRenderer={historyEntryRenderer}
        />
      )}
    </div>
  )
}
