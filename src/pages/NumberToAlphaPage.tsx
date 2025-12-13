import { useState, useCallback, useRef, useEffect } from 'react'
import { Layout, DrillHeader } from '../components'
import { useDrill } from '../hooks'
import {
  type DrillMode,
  generateEjotyQuestion,
  generateSingleQuestion,
  generateWordQuestion,
} from '../drills/numberToAlpha'

type Screen = 'start' | 'drill'

/**
 * アルファベット参照表（EJOTYのみ表示）
 */
function AlphaTable() {
  return (
    <div className="mb-4 flex justify-center">
      <table className="border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              E
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              J
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              O
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              T
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              Y
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base">
              Z
            </td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/**
 * EJOTY特訓モード用ヒントメッセージ
 */
function EjotyHint({ shouldFade }: { shouldFade: boolean }) {
  return (
    <div className="mb-4 text-center">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p
          className={`font-medium text-amber-800 transition-opacity duration-[8000ms] ${
            shouldFade ? 'opacity-0' : ''
          }`}
        >
          E, J, O, T, Y = 5, 10, 15, 20, 25
        </p>
        <p className="mt-1 text-sm text-amber-600">5の倍数だけ覚えよう</p>
      </div>
    </div>
  )
}

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
          <p>数字をアルファベットに変換して答えます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-indigo-600">1</span> →{' '}
              <span className="font-bold text-green-600">A</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">5</span> →{' '}
              <span className="font-bold text-green-600">E</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">26</span> →{' '}
              <span className="font-bold text-green-600">Z</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            参照表を見ながら位置で覚えましょう
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
            onClick={() => onStartDrill('ejoty')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            "EJOTY"特訓モード
          </button>
          <button
            onClick={() => onStartDrill('single')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            1文字モード
          </button>
          <button
            onClick={() => onStartDrill('word')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            単語モード
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
  const lastNumberRef = useRef<number | null>(null)
  const lastWordRef = useRef<string | null>(null)

  // EJOTYヒントのフェード用
  const [questionCount, setQuestionCount] = useState(0)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    switch (mode) {
      case 'ejoty': {
        const result = generateEjotyQuestion(lastNumberRef.current)
        lastNumberRef.current = result.newLastNumber
        return result.question
      }
      case 'single': {
        const result = generateSingleQuestion(lastNumberRef.current)
        lastNumberRef.current = result.newLastNumber
        return result.question
      }
      case 'word': {
        const result = generateWordQuestion(lastWordRef.current)
        lastWordRef.current = result.newLastWord
        return result.question
      }
    }
  }, [mode])

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
    setQuestionCount((c) => c + 1)
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

  // EJOTYモードで6問目以降にヒントをフェードアウト
  const shouldFadeEjotyHint = mode === 'ejoty' && questionCount >= 5

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
        <span className="text-sm text-gray-500">数字→ABC</span>
      </div>

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold text-indigo-900">
            {currentQuestion?.question ?? '--'}
          </div>
          {currentQuestion?.subtext && (
            <div className="mt-1 text-sm text-gray-500">
              {currentQuestion.subtext}
            </div>
          )}
        </div>

        {/* EJOTY特訓モード用ヒントメッセージ */}
        {mode === 'ejoty' && <EjotyHint shouldFade={shouldFadeEjotyHint} />}

        {/* アルファベット参照表（1文字・単語モードのみ） */}
        {mode !== 'ejoty' && <AlphaTable />}

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
              maxLength={10}
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

        {/* フィードバック */}
        {feedback && (
          <div
            className={`rounded-lg p-2 text-center font-bold ${
              feedback.type === 'correct'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback.type === 'correct' ? (
              '正解！'
            ) : (
              <>
                不正解… 答え：
                <span className="text-indigo-900">
                  {feedback.correctAnswer}
                </span>
                {currentQuestion && (
                  <span className="ml-2">
                    = {currentQuestion.question.replace(/, /g, ', ')}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/**
 * 数字toアルファベットページ
 */
export function NumberToAlphaPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('single')

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
            title="数字toアルファベット"
            description="数字をアルファベットに変換しよう"
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
