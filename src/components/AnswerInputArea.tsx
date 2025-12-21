/**
 * ドリル共通の回答入力エリアコンポーネント
 *
 * 回答入力フィールドと送信/次へボタン、Enterキーのハンドリングを提供します。
 */

import { useRef, useEffect } from 'react'
import type { Feedback } from '../hooks'

interface AnswerInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onNext?: () => void
  feedback?: Feedback | null
  placeholder?: string
  maxLength?: number
  autoComplete?: string
  disabled?: boolean
  className?: string
  /** input要素に適用するクラス（uppercase等） */
  inputClassName?: string
  inputTransform?: (value: string) => string
  /** 即時モード: フィードバックなしで常に送信ボタンのみ表示（実力テスト用） */
  instantMode?: boolean
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
  inputClassName = '',
  inputTransform,
  instantMode = false,
}: AnswerInputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // フィードバック後に入力欄にフォーカス（instantModeでは常にフォーカス維持）
  useEffect(() => {
    if (instantMode || !feedback) {
      inputRef.current?.focus()
    }
  }, [feedback, instantMode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!instantMode && feedback && onNext) {
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
      <div className="flex items-stretch gap-3">
        <div className="relative min-w-0 flex-1">
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
            disabled={disabled || (!instantMode && !!feedback)}
            className={`w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-center text-2xl font-bold shadow-sm transition-all duration-200 placeholder:text-gray-300 focus:border-[var(--drill-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--drill-primary-light)] disabled:bg-gray-50 disabled:text-gray-400 ${inputClassName}`}
          />
          {/* Focus glow effect */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 peer-focus:opacity-100" />
        </div>

        {instantMode || !feedback ? (
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="group flex min-w-[72px] items-center justify-center rounded-2xl bg-[var(--drill-primary)] px-5 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none disabled:hover:scale-100"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="group flex min-w-[72px] items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
