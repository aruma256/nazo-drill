import { useEffect, useRef, type ReactNode } from 'react'

interface PracticeAnswerAreaProps {
  revealed: boolean
  answer?: ReactNode
  onReveal: () => void
  onNext: () => void
  disabled?: boolean
  children?: ReactNode
}

/** 練習の回答欄と、ポイントを加算せず答えを確認して次問へ進む操作。 */
export function PracticeAnswerArea({
  revealed,
  answer,
  onReveal,
  onNext,
  disabled = false,
  children,
}: PracticeAnswerAreaProps) {
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const answerAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (revealed) {
      nextButtonRef.current?.focus()
    } else if (!disabled) {
      answerAreaRef.current
        ?.querySelector<HTMLInputElement | HTMLButtonElement>(
          'input:not(:disabled), button:not(:disabled)',
        )
        ?.focus()
    }
  }, [revealed, disabled])

  return (
    <div ref={answerAreaRef} className="space-y-4">
      {revealed ? (
        <div className="text-center">
          {answer && (
            <div
              role="status"
              className="rounded-xl bg-drill-primary-light p-4 text-2xl font-bold text-drill-primary-dark"
            >
              {answer}
            </div>
          )}
          <button
            ref={nextButtonRef}
            type="button"
            onClick={onNext}
            className={`rounded-xl bg-drill-primary px-6 py-3 font-bold text-white ${answer ? 'mt-4' : ''}`}
          >
            次の問題へ
          </button>
        </div>
      ) : (
        <>
          {children}
          <div className="text-center">
            <button
              type="button"
              onClick={onReveal}
              disabled={disabled}
              className="rounded-full px-4 py-2 text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-drill-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              答えを見る
            </button>
          </div>
        </>
      )}
    </div>
  )
}
