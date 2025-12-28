import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
  SectionHeader,
  ChallengeTimer,
  ChallengeResult,
  ChallengeCountdownModal,
} from '../components'
import {
  useCountdownTimer,
  useDrill,
  useDrillStorage,
  type Feedback,
  type HistoryEntry,
} from '../hooks'
import {
  generateAlphaShiftQuestion,
  generateChallengeQuestion,
  type AlphaShiftMode,
} from '../drills/alphaShift'

const DRILL_NAME = 'abc-shift'
const CHALLENGE_TIME_LIMIT = 45

type Screen = 'start' | 'drill' | 'countdown' | 'challenge' | 'challengeResult'

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: AlphaShiftMode) => void
  onStartChallenge: () => void
}) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <SectionHeader>ルール</SectionHeader>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>アルファベットを指定された数だけずらして答えます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-drill-primary">A+1</span> →{' '}
              <span className="font-bold text-green-600">B</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-drill-primary">D-2</span> →{' '}
              <span className="font-bold text-green-600">B</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-drill-primary">X+3</span> →{' '}
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
        <SectionHeader>モードを選択</SectionHeader>
        <div className="space-y-3">
          <ModeButton
            label={`実力テスト（${CHALLENGE_TIME_LIMIT}秒）`}
            mode="challenge"
            drillName={DRILL_NAME}
            onClick={onStartChallenge}
            icon="⏱️"
            variant="challenge"
          />

          <div className="border-t-4 border-[var(--drill-primary-light)]"></div>

          <ModeButton
            label="+1～+3 特訓"
            mode="plus-training"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('plus-training')
            }}
            icon="✏️"
          />
          <ModeButton
            label="-1～-3 特訓"
            mode="minus-training"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('minus-training')
            }}
            icon="✏️"
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
  const [feedback, setFeedback] = useState<Feedback | null>(null)
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
      setFeedback({ type: 'retry' })
    }
    setUserAnswer('')
  }

  const handleNext = () => {
    const wasCorrect = feedback?.type === 'correct'
    setFeedback(null)
    if (wasCorrect) {
      presentQuestion()
    }
    // リトライの場合は同じ問題を続ける
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="ABCシフト" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-6 text-center">
          <div className="text-5xl font-bold text-drill-primary-dark">
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
        onNext={handleNext}
      />
    </>
  )
}

/**
 * チャレンジ画面（実力テストモード）
 * +1〜+3と-1〜-3を交互に出題
 */
function ChallengeScreen({
  onTimeUp,
  onBack,
}: {
  onTimeUp: (score: number, history: HistoryEntry[]) => void
  onBack: () => void
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const remainingTime = useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)
  // +と-の交互出題を管理
  const isPlusRef = useRef<boolean>(true)

  // 問題生成関数（交互出題）
  const generateQuestion = useCallback(() => {
    const result = generateChallengeQuestion(
      lastQuestionRef.current,
      isPlusRef.current,
    )
    lastQuestionRef.current = result.newLastQuestion
    isPlusRef.current = result.nextIsPlus
    return result.question
  }, [])

  const { currentQuestion, presentQuestion, checkAnswer, history } =
    useDrill(generateQuestion)

  // ドリル開始時に最初の問題を出題
  useEffect(() => {
    presentQuestion()
  }, [presentQuestion])

  // タイムアップ時の処理
  useEffect(() => {
    if (remainingTime === 0) {
      onTimeUp(score, history)
    }
  }, [remainingTime, score, history, onTimeUp])

  const handleSubmit = () => {
    if (!userAnswer.trim() || remainingTime === 0) return

    const isCorrect = checkAnswer(userAnswer)
    if (isCorrect) {
      setScore((prev) => prev + 1)
      incrementCorrectCount('challenge')
    }
    presentQuestion()
    setUserAnswer('')
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="実力テスト" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* タイマー */}
        <ChallengeTimer
          remainingSeconds={remainingTime}
          totalSeconds={CHALLENGE_TIME_LIMIT}
        />

        {/* スコア表示 */}
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500">正解数</span>
          <span className="ml-2 text-2xl font-bold text-drill-primary">
            {score}
          </span>
        </div>

        {/* 問題表示 */}
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold text-drill-primary-dark">
            {currentQuestion?.question ?? '--'}
          </div>
        </div>

        {/* 回答入力エリア（フィードバックなし、即時次問題） */}
        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder="答えを入力"
          maxLength={1}
          inputTransform={(value) => value.toUpperCase()}
          inputClassName="uppercase"
          instantMode
        />
      </div>
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
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeHistory, setChallengeHistory] = useState<HistoryEntry[]>([])
  const { updateHighScore } = useDrillStorage(DRILL_NAME)

  const handleStartDrill = (mode: AlphaShiftMode) => {
    setCurrentMode(mode)
    setScreen('drill')
  }

  const handleStartChallenge = () => {
    setScreen('countdown')
  }

  const handleCountdownComplete = () => {
    setScreen('challenge')
  }

  const handleChallengeTimeUp = useCallback(
    (score: number, history: HistoryEntry[]) => {
      setChallengeScore(score)
      setChallengeHistory(history)
      updateHighScore('challenge', score)
      setScreen('challengeResult')
    },
    [updateHighScore],
  )

  const handleRetryChallenge = () => {
    setChallengeScore(0)
    setChallengeHistory([])
    setScreen('countdown')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl" drillId="abc-shift">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="アルファベットシフト"
            description="アルファベットをずらして変換しよう"
          />
          <StartScreen
            onStartDrill={handleStartDrill}
            onStartChallenge={handleStartChallenge}
          />
        </>
      )}
      {screen === 'drill' && (
        <DrillScreen onBack={handleBackToStart} mode={currentMode} />
      )}
      {screen === 'countdown' && (
        <ChallengeCountdownModal onComplete={handleCountdownComplete} />
      )}
      {screen === 'challenge' && (
        <ChallengeScreen
          onTimeUp={handleChallengeTimeUp}
          onBack={handleBackToStart}
        />
      )}
      {screen === 'challengeResult' && (
        <ChallengeResult
          score={challengeScore}
          timeLimit={CHALLENGE_TIME_LIMIT}
          drillName="ABCシフト"
          history={challengeHistory}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
    </Layout>
  )
}
