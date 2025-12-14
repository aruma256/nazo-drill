import { useEffect, useCallback, useState } from 'react'

type FeedbackModalProps = {
  isOpen: boolean
  type: 'correct' | 'incorrect'
  correctAnswer?: string
  hintContent?: string
  onNext: () => void
  delayOnIncorrect?: number
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
    return () => cancelAnimationFrame(rafId)
  }, [durationMs])

  return (
    <div
      data-testid="progress-bar"
      className="mt-4 h-2 w-full rounded-full bg-gray-200"
    >
      <div
        className="h-2 rounded-full bg-red-500"
        style={{ width: `${progress}%` }}
      />
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

  // モーダルが閉じたときにwaitCompleteをリセット（クリーンアップ時）
  useEffect(() => {
    if (!isOpen) return
    return () => {
      setWaitComplete(false)
    }
  }, [isOpen])

  // 待機タイマー
  useEffect(() => {
    if (!isOpen || !needsWaiting || waitComplete) return

    const timer = setTimeout(() => {
      setWaitComplete(true)
    }, delayOnIncorrect!)

    return () => clearTimeout(timer)
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/20" />

      {/* モーダル本体 */}
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* メッセージ */}
        {type === 'correct' ? (
          <div className="mb-4 text-3xl font-bold text-green-600">✓ 正解！</div>
        ) : (
          <div className="mb-4 text-3xl font-bold text-red-600">
            ✗ 不正解
            <div className="mt-2 text-xl">正解は「{correctAnswer}」</div>
          </div>
        )}

        {/* 補助情報 */}
        {hintContent && (
          <div
            data-testid="modal-hint"
            className="mb-4 text-xl text-indigo-900"
          >
            {hintContent}
          </div>
        )}

        {/* タップして次へ / プログレスバー */}
        {isWaiting ? (
          <ProgressBar durationMs={delayOnIncorrect!} />
        ) : (
          <div className="mt-6 text-sm text-gray-400">タップして次へ</div>
        )}
      </div>
    </div>
  )
}
