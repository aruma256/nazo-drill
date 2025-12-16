import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
} from '../components'
import { useDrill, useDrillStorage } from '../hooks'
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

const DRILL_NAME = '50on-pick'

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
          <ModeButton
            label="「た」〜「も」特訓モード"
            mode="ta-mo"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('ta-mo')
            }}
          />
          <ModeButton
            label="1文字モード"
            mode="single"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('single')
            }}
          />
          <ModeButton
            label="単語モード"
            mode="word"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('word')
            }}
          />
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
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

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

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = checkAnswer(userAnswer)
    if (isCorrect) {
      incrementCorrectCount(mode)
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

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="文字拾い" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        <GojuonTable markedCells={markedCells} isTaMoMode={mode === 'ta-mo'} />

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="ひらがなで入力"
          maxLength={10}
        />
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
