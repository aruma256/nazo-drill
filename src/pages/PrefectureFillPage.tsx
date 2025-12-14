import { useState, useCallback, useRef, useEffect } from 'react'
import { Layout, DrillHeader, FeedbackModal } from '../components'
import { useDrill } from '../hooks'
import type { Question } from '../hooks/useDrill'
import {
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
  normalizeAnswer,
  checkTwoPrefecturesAnswer,
} from '../drills/prefectureFill'

type Screen = 'start' | 'drill'
type DrillMode = 'normal' | 'one-prefecture' | 'two-prefectures'

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
}: {
  onStartDrill: (mode: DrillMode) => void
}) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
          ルール
        </h2>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>◯で隠された文字を推測し、都道府県名を当てます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-indigo-600">◯うき◯◯</span> →{' '}
              <span className="font-bold text-green-600">とうきょう</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            答えは全てひらがなで入力してください
          </p>
        </div>
      </section>

      {/* モード選択 */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
          モードを選択
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => onStartDrill('normal')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            穴埋めモード
          </button>
          <button
            onClick={() => onStartDrill('one-prefecture')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            1県確定特訓
          </button>
          <button
            onClick={() => onStartDrill('two-prefectures')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            2県確定特訓
          </button>
        </div>
      </section>
    </>
  )
}

/**
 * ドリル画面
 */
function DrillScreen({
  mode,
  onBack,
}: {
  mode: DrillMode
  onBack: () => void
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect'
    correctAnswer?: string
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 前回の問題を追跡するRef
  const lastNormalRef = useRef<string | null>(null)
  const lastCharRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback((): Question => {
    if (mode === 'one-prefecture') {
      const result = generateOnePrefectureQuestion(lastCharRef.current)
      lastCharRef.current = result.lastChar
      return result.question
    } else if (mode === 'two-prefectures') {
      const result = generateTwoPrefecturesQuestion(lastCharRef.current)
      lastCharRef.current = result.lastChar
      return result.question
    } else {
      const result = generateNormalQuestion(lastNormalRef.current)
      lastNormalRef.current = result.lastPrefecture
      return result.question
    }
  }, [mode])

  const { currentQuestion, presentQuestion } = useDrill(generateQuestion)

  // ドリル開始時に最初の問題を出題
  useEffect(() => {
    presentQuestion()
  }, [presentQuestion])

  // フィードバック後に入力欄にフォーカス
  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus()
    }
  }, [feedback])

  // 回答チェック（2県確定モードは特別処理）
  const checkUserAnswer = useCallback(
    (userAns: string): boolean => {
      if (!currentQuestion) return false

      if (mode === 'two-prefectures') {
        return checkTwoPrefecturesAnswer(userAns, currentQuestion.answer)
      } else {
        return (
          normalizeAnswer(userAns) === normalizeAnswer(currentQuestion.answer)
        )
      }
    },
    [currentQuestion, mode],
  )

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = checkUserAnswer(userAnswer)
    if (isCorrect) {
      setFeedback({ type: 'correct' })
    } else {
      setFeedback({
        type: 'incorrect',
        correctAnswer: currentQuestion?.answer,
      })
    }
    setUserAnswer('')
  }

  const handleNext = () => {
    setFeedback(null)
    presentQuestion()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  // モード名を取得
  const getModeName = () => {
    switch (mode) {
      case 'one-prefecture':
        return '1県確定'
      case 'two-prefectures':
        return '2県確定'
      default:
        return '穴埋め'
    }
  }

  // プレースホルダーを取得
  const getPlaceholder = () => {
    if (mode === 'two-prefectures') {
      return '2県をスペース区切りで'
    }
    return 'ひらがなで入力'
  }

  return (
    <>
      {/* ミニヘッダー */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          <span className="mr-1">←</span>
          <span>やめる</span>
        </button>
        <span className="text-sm text-gray-500">
          都道府県 ({getModeName()})
        </span>
      </div>

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-6 text-center">
          <div className="text-4xl font-bold tracking-widest text-indigo-900 md:text-5xl">
            {currentQuestion?.question ?? '--'}
          </div>
          {currentQuestion?.subtext && (
            <div className="mt-1 text-sm text-gray-500">
              {currentQuestion.subtext}
            </div>
          )}
        </div>

        {/* 回答入力＆ボタンエリア */}
        <div className="mb-2">
          <label htmlFor="answer-input" className="sr-only">
            あなたの答え:
          </label>
          <div className="flex items-stretch gap-2">
            <input
              ref={inputRef}
              type="text"
              id="answer-input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              maxLength={mode === 'two-prefectures' ? 20 : 10}
              autoComplete="off"
              disabled={!!feedback}
              className="min-w-0 flex-1 rounded-lg border-2 border-gray-300 p-3 text-center text-2xl font-bold focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
            />
            {!feedback ? (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="min-w-[80px] whitespace-nowrap rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <span className="text-lg">➤</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="min-w-[80px] whitespace-nowrap rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-green-700"
              >
                <span className="text-lg">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        correctAnswer={feedback?.correctAnswer}
        onNext={handleNext}
        delayOnIncorrect={3000}
      />
    </>
  )
}

/**
 * 都道府県名穴埋めページ
 */
export function PrefectureFillPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('normal')

  const handleStartDrill = (selectedMode: DrillMode) => {
    setMode(selectedMode)
    setScreen('drill')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="都道府県名の穴埋め"
            description="◯で隠された都道府県名を当てよう"
          />
          <StartScreen onStartDrill={handleStartDrill} />
        </>
      )}
      {screen === 'drill' && (
        <DrillScreen mode={mode} onBack={handleBackToStart} />
      )}
    </Layout>
  )
}
