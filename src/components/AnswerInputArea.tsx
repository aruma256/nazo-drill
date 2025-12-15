/**
 * ドリル共通の回答入力エリアコンポーネント
 *
 * 回答入力フィールドと送信/次へボタン、Enterキーのハンドリングを提供します。
 */

import { useRef, useEffect } from 'react'

interface AnswerInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onNext: () => void
  feedback: { type: 'correct' | 'incorrect'; correctAnswer?: string } | null
  placeholder?: string
  maxLength?: number
  autoComplete?: string
  disabled?: boolean
  className?: string
  inputTransform?: (value: string) => string
}

/**
 * ドリル共通の回答入力エリアコンポーネント
 */
export function AnswerInputArea({
  value,
  onChange,
  onSubmit,
  onNext,
  feedback,
  placeholder = 'ひらがなで入力',
  maxLength = 10,
  autoComplete = 'off',
  disabled = false,
  className = '',
  inputTransform,
}: AnswerInputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // フィードバック後に入力欄にフォーカス
  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus()
    }
  }, [feedback])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback) {
        onNext()
      } else {
        onSubmit()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = inputTransform
      ? inputTransform(e.target.value)
      : e.target.value
    onChange(newValue)
  }

  return (
    <div className={`mb-2 ${className}`}>
      <label htmlFor="answer-input" className="sr-only">
        あなたの答え:
      </label>
      <div className="flex items-stretch gap-2">
        <input
          ref={inputRef}
          type="text"
          id="answer-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled || !!feedback}
          className={`min-w-0 flex-1 rounded-lg border-2 border-gray-300 p-3 text-center text-2xl font-bold focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 ${className}`}
        />
        {!feedback ? (
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="min-w-[80px] whitespace-nowrap rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <span className="text-lg">➤</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="min-w-[80px] whitespace-nowrap rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-green-700"
          >
            <span className="text-lg">→</span>
          </button>
        )}
      </div>
    </div>
  )
}
