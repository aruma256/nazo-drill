import { useEffect, useCallback, useState } from 'react'

interface FeedbackModalProps {
  isOpen: boolean
  type: 'correct' | 'incorrect' | 'retry'
  correctAnswer?: string
  hintContent?: string
  onNext: () => void
  delayOnIncorrect?: number
}

// Animated checkmark SVG
function AnimatedCheckmark() {
  return (
    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-200">
      <svg
        className="h-12 w-12 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M5 13l4 4L19 7"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
            animation: 'checkmark-draw 0.5s ease-out forwards 0.2s',
          }}
        />
      </svg>
    </div>
  )
}

// Animated X mark SVG
function AnimatedXMark() {
  return (
    <div className="animate-shake mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-200">
      <svg
        className="h-12 w-12 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 6l12 12M6 18L18 6" />
      </svg>
    </div>
  )
}

// Animated retry icon
function AnimatedRetryMark() {
  return (
    <div className="animate-spin-once mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200">
      <svg
        className="h-12 w-12 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </div>
  )
}

function ProgressBar({ durationMs }: { durationMs: number }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    let rafId: number

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100)
      setProgress(remaining)
      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(updateProgress)
      }
    }

    rafId = requestAnimationFrame(updateProgress)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [durationMs])

  return (
    <div className="mt-6">
      <div className="mb-2 text-xs text-gray-400">
        しばらくお待ちください...
      </div>
      <div
        data-testid="progress-bar"
        className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function FeedbackModal({
  isOpen,
  type,
  correctAnswer,
  hintContent,
  onNext,
  delayOnIncorrect,
}: FeedbackModalProps) {
  // 待機が必要な条件
  const needsWaiting = type === 'incorrect' && !!delayOnIncorrect
  // 待機完了フラグ
  const [waitComplete, setWaitComplete] = useState(false)

  // モーダルが閉じたときにwaitCompleteをリセット
  useEffect(() => {
    if (!isOpen) return

    // クリーンアップ関数でリセット（モーダルが閉じたとき）
    return () => {
      setWaitComplete(false)
    }
  }, [isOpen])

  // 待機タイマー
  useEffect(() => {
    if (!isOpen || !needsWaiting || waitComplete) return

    const timer = setTimeout(() => {
      setWaitComplete(true)
    }, delayOnIncorrect)

    return () => {
      clearTimeout(timer)
    }
  }, [isOpen, needsWaiting, waitComplete, delayOnIncorrect])

  const isWaiting = isOpen && needsWaiting && !waitComplete

  const handleClose = useCallback(() => {
    if (isWaiting) return
    onNext()
  }, [onNext, isWaiting])

  // キーボードイベントのハンドリング
  // Enterキーでsubmitした際に同じイベントがモーダルに伝播しないよう、
  // 次のフレームでリスナーを登録する
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    const frameId = requestAnimationFrame(() => {
      document.addEventListener('keydown', handleKeyDown)
    })

    return () => {
      cancelAnimationFrame(frameId)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <div
      data-testid="feedback-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* 背景オーバーレイ */}
      <div
        className="animate-fade-in absolute inset-0"
        style={{
          background:
            type === 'correct'
              ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(0, 0, 0, 0.3) 100%)'
              : type === 'retry'
                ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0.3) 100%)'
                : 'radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
        }}
      />

      {/* モーダル本体 */}
      <div className="animate-bounce-in relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl">
        {/* Top decoration */}
        <div
          className="h-2"
          style={{
            background:
              type === 'correct'
                ? 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)'
                : type === 'retry'
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d)'
                  : 'linear-gradient(90deg, #ef4444, #f87171, #fca5a5)',
          }}
        />

        <div className="p-8">
          {/* アイコンとメッセージ */}
          {type === 'correct' ? (
            <>
              <AnimatedCheckmark />
              <div className="font-display text-3xl font-black text-emerald-600">
                正解！
              </div>
              <div className="mt-2 text-gray-500">すばらしい！</div>
            </>
          ) : type === 'retry' ? (
            <>
              <AnimatedRetryMark />
              <div className="font-display text-3xl font-black text-amber-600">
                もう一度！
              </div>
              <div className="mt-2 text-gray-500">正解するまでがんばろう</div>
            </>
          ) : (
            <>
              <AnimatedXMark />
              <div className="font-display text-3xl font-black text-rose-600">
                不正解
              </div>
              <div className="mt-4 rounded-2xl bg-rose-50 p-4">
                <div className="text-sm text-rose-400">正解は</div>
                <div className="font-mono mt-1 text-2xl font-bold text-rose-600">
                  {correctAnswer}
                </div>
              </div>
            </>
          )}

          {/* 補助情報 */}
          {hintContent && (
            <div
              data-testid="modal-hint"
              className="mt-4 rounded-2xl bg-indigo-50 p-4 text-lg font-medium text-indigo-900"
            >
              {hintContent}
            </div>
          )}

          {/* タップして次へ / プログレスバー */}
          {isWaiting ? (
            <ProgressBar durationMs={delayOnIncorrect} />
          ) : (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>
                {type === 'retry' ? 'タップしてもう一度' : 'タップして次へ'}
              </span>
              <svg
                className="h-4 w-4 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    type === 'retry'
                      ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                      : 'M9 5l7 7-7 7'
                  }
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
