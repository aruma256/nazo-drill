import { useState, useCallback, useRef, useEffect } from 'react'
import { Layout, DrillHeader, FeedbackModal } from '../components'
import { useDrill } from '../hooks'
import { generateAlphaShiftQuestion } from '../drills/alphaShift'

type Screen = 'start' | 'drill'

/**
 * スタート画面
 */
function StartScreen({ onStartDrill }: { onStartDrill: () => void }) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
          ルール
        </h2>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>アルファベットを指定された数だけずらして答えます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-indigo-600">A+1</span> →{' '}
              <span className="font-bold text-green-600">B</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">D-2</span> →{' '}
              <span className="font-bold text-green-600">B</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">X+3</span> →{' '}
              <span className="font-bold text-green-600">?</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            シフトは-5〜+5の範囲で、循環する問題は出題されません
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
            onClick={onStartDrill}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            初級
          </button>
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-6 py-4 text-lg font-bold text-gray-400"
          >
            中級（準備中）
          </button>
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-6 py-4 text-lg font-bold text-gray-400"
          >
            上級（準備中）
          </button>
        </div>
      </section>
    </>
  )
}

/**
 * ドリル画面
 */
function DrillScreen({ onBack }: { onBack: () => void }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect'
    correctAnswer?: string
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateAlphaShiftQuestion(lastQuestionRef.current)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [])

  const { currentQuestion, presentQuestion, checkAnswer } =
    useDrill(generateQuestion)

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

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = checkAnswer(userAnswer)
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
        <span className="text-sm text-gray-500">ABCシフト</span>
      </div>

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-6 text-center">
          <div className="text-5xl font-bold text-indigo-900">
            {currentQuestion?.question ?? '--'}
          </div>
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
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="答えを入力"
              maxLength={1}
              autoComplete="off"
              disabled={!!feedback}
              className="min-w-0 flex-1 rounded-lg border-2 border-gray-300 p-3 text-center text-2xl font-bold uppercase focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
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
 * アルファベットシフトページ
 */
export function AlphaShiftPage() {
  const [screen, setScreen] = useState<Screen>('start')

  const handleStartDrill = () => {
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
            title="アルファベットシフト"
            description="アルファベットをずらして変換しよう"
          />
          <StartScreen onStartDrill={handleStartDrill} />
        </>
      )}
      {screen === 'drill' && <DrillScreen onBack={handleBackToStart} />}
    </Layout>
  )
}
