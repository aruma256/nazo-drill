interface ChallengeResultProps {
  /** 正答数 */
  score: number
  /** 制限時間（秒） */
  timeLimit: number
  /** 「もう一度」ボタン押下時のコールバック */
  onRetry: () => void
  /** 「戻る」ボタン押下時のコールバック */
  onBack: () => void
}

/**
 * 実力テスト結果表示コンポーネント
 */
export function ChallengeResult({
  score,
  timeLimit,
  onRetry,
  onBack,
}: ChallengeResultProps) {
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
          onClick={onBack}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50"
        >
          モード選択に戻る
        </button>
      </div>
    </div>
  )
}
