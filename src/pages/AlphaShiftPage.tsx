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
  generateAlphaShiftQuestion,
  type AlphaShiftMode,
} from '../drills/alphaShift'

const DRILL_NAME = 'abc-shift'

type Screen = 'start' | 'drill'

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
}: {
  onStartDrill: (mode: AlphaShiftMode) => void
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
            循環する問題（Z+1など）は出題されません
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
          <ModeButton
            label="+1～+3 特訓"
            mode="plus-training"
            drillName={DRILL_NAME}
            onClick={() => onStartDrill('plus-training')}
          />
          <ModeButton
            label="-1～-3 特訓"
            mode="minus-training"
            drillName={DRILL_NAME}
            onClick={() => onStartDrill('minus-training')}
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
  onBack,
  mode,
}: {
  onBack: () => void
  mode: AlphaShiftMode
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect'
    correctAnswer?: string
  } | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateAlphaShiftQuestion(lastQuestionRef.current, mode)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
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

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="ABCシフト" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-6 text-center">
          <div className="text-5xl font-bold text-indigo-900">
            {currentQuestion?.question ?? '--'}
          </div>
        </div>

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="答えを入力"
          maxLength={1}
          inputTransform={(value) => value.toUpperCase()}
          className="uppercase"
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
 * アルファベットシフトページ
 */
export function AlphaShiftPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [currentMode, setCurrentMode] =
    useState<AlphaShiftMode>('plus-training')

  const handleStartDrill = (mode: AlphaShiftMode) => {
    setCurrentMode(mode)
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
      {screen === 'drill' && (
        <DrillScreen onBack={handleBackToStart} mode={currentMode} />
      )}
    </Layout>
  )
}
