import { useState, useCallback, useRef, useEffect } from 'react'
import { Layout, DrillHeader } from '../components'
import { useDrill } from '../hooks'
import {
  type DrillMode,
  type MarkedCell,
  GOJUON_TABLE,
  generateWordQuestion,
  generateSingleQuestion,
  generateTaMoQuestion,
  parseMarkedCells,
  isEmptyCell,
} from '../drills/gojuonPick'

type Screen = 'start' | 'drill'

/**
 * 五十音表コンポーネント
 */
function GojuonTable({
  markedCells,
  isTaMoMode,
}: {
  markedCells: MarkedCell[]
  isTaMoMode: boolean
}) {
  // マークされたセルをマップ化（高速検索用）
  const markedMap = new Map<string, number>()
  for (const cell of markedCells) {
    markedMap.set(`${cell.row}-${cell.col}`, cell.number)
  }

  return (
    <div className="mb-4 flex justify-center">
      <table className="border-collapse border border-gray-400">
        <tbody>
          {GOJUON_TABLE.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                const isEmpty = isEmptyCell(rowIndex, colIndex)
                const number = markedMap.get(`${rowIndex}-${colIndex}`)
                const isMarked = number !== undefined

                // た〜も特訓モード時の境界線
                const borderClass =
                  isTaMoMode && colIndex === 5
                    ? 'border-l-2 border-r-2 border-gray-700'
                    : ''

                return (
                  <td
                    key={colIndex}
                    className={`h-8 w-8 border border-gray-400 text-center text-base font-bold text-indigo-600 sm:h-10 sm:w-10 sm:text-xl ${
                      isEmpty
                        ? 'bg-neutral-800'
                        : isMarked
                          ? 'bg-amber-100'
                          : 'bg-white'
                    } ${borderClass}`}
                  >
                    {isMarked ? number : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * ルール説明のサンプル五十音表
 */
function ExampleGojuonTable() {
  // 「くるま」を表示するサンプル
  const exampleMarks = [
    { row: 2, col: 9, number: 1 }, // く
    { row: 2, col: 2, number: 2 }, // る
    { row: 0, col: 4, number: 3 }, // ま
  ]

  const markedMap = new Map<string, number>()
  for (const cell of exampleMarks) {
    markedMap.set(`${cell.row}-${cell.col}`, cell.number)
  }

  return (
    <div className="flex justify-center">
      <table className="border-collapse border border-gray-400">
        <tbody>
          {GOJUON_TABLE.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                const isEmpty = isEmptyCell(rowIndex, colIndex)
                const number = markedMap.get(`${rowIndex}-${colIndex}`)
                const isMarked = number !== undefined

                return (
                  <td
                    key={colIndex}
                    className={`h-5 w-5 border border-gray-400 text-center text-xs font-bold text-indigo-600 ${
                      isEmpty
                        ? 'bg-neutral-800'
                        : isMarked
                          ? 'bg-amber-100'
                          : 'bg-white'
                    }`}
                  >
                    {isMarked ? number : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
          <p>五十音表の中に数字が書かれたマスがあります。</p>
          <p>
            数字を
            <span className="font-bold text-indigo-600">1, 2, 3...</span>
            の順に拾い、そのマスに対応するひらがなを読み取ります。
          </p>
          <div className="mt-3 rounded-lg bg-white/50 p-3">
            <p className="mb-3 text-center text-sm text-gray-500">例：</p>
            <ExampleGojuonTable />
            <p className="mb-1 mt-3 text-center text-sm text-gray-600">
              1→「く」、2→「る」、3→「ま」
            </p>
            <p className="text-center text-xl font-bold text-green-600">
              答え：くるま
            </p>
          </div>
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
            onClick={() => onStartDrill('ta-mo')}
            className="w-full rounded-lg border-2 border-transparent bg-white px-6 py-4 text-lg font-bold text-indigo-700 shadow-md transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg"
          >
            「た」〜「も」特訓モード
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
  const lastWordRef = useRef<string | null>(null)
  const lastColRef = useRef<number | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    switch (mode) {
      case 'word': {
        const result = generateWordQuestion(lastWordRef.current)
        lastWordRef.current = result.newLastWord
        return result.question
      }
      case 'single': {
        const result = generateSingleQuestion(lastColRef.current)
        lastColRef.current = result.newLastCol
        return result.question
      }
      case 'ta-mo': {
        const result = generateTaMoQuestion(lastColRef.current)
        lastColRef.current = result.newLastCol
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

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

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
        <span className="text-sm text-gray-500">文字拾い</span>
      </div>

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        <GojuonTable markedCells={markedCells} isTaMoMode={mode === 'ta-mo'} />

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
              placeholder="ひらがなで入力"
              maxLength={10}
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
              '⭕ 正解！'
            ) : (
              <>
                ❌ 答え：
                <span className="text-indigo-900">
                  {feedback.correctAnswer}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/**
 * 五十音表の文字拾いページ
 */
export function GojuonPickPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('word')

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
            title="五十音表の文字拾い"
            description="数字の順に文字を読み取ろう"
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
