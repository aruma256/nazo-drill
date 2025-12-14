import { useEffect, useCallback } from 'react'

type FeedbackModalProps = {
  isOpen: boolean
  type: 'correct' | 'incorrect'
  correctAnswer?: string
  hintContent?: string
  onNext: () => void
}

export function FeedbackModal({
  isOpen,
  type,
  correctAnswer,
  hintContent,
  onNext,
}: FeedbackModalProps) {
  const handleClose = useCallback(() => {
    onNext()
  }, [onNext])

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

        {/* タップして次へ */}
        <div className="mt-6 text-sm text-gray-400">タップして次へ</div>
      </div>
    </div>
  )
}
