import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
  ChallengeTimer,
  ChallengeResult,
  ChallengeCountdownModal,
  SectionHeader,
  PenaltyOverlay,
} from '../components'
import {
  useChallengeTimeUp,
  useCountdownTimer,
  useDrill,
  useDrillStorage,
  usePenaltyTimeout,
  type Feedback,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  type GojuonSlideMode,
  generateSlideQuestion,
  parseSlideQuestion,
} from '../drills/gojuonSlide'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'

const DRILL_NAME = '50on-slide'

type Screen = 'start' | 'drill' | 'countdown' | 'challenge' | 'challengeResult'

/**
 * 問題表示コンポーネント
 */
function QuestionDisplay({ question }: { question: string }) {
  const { char, arrow } = parseSlideQuestion(question)
  return (
    <div className="text-center">
      <div className="font-display mb-4 text-7xl font-bold text-drill-primary">
        {char}
      </div>
      <div className="text-6xl text-gray-700">{arrow}</div>
    </div>
  )
}

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: GojuonSlideMode) => void
  onStartChallenge: () => void
}) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <SectionHeader>ルール</SectionHeader>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>ひらがなと矢印が表示されます。</p>
          <p>
            五十音表の中でそのひらがなから矢印の方向に
            <span className="font-bold text-drill-primary">1マス移動</span>
            した先のひらがなを答えてください。
          </p>
          <div className="mt-3 rounded-lg bg-white/50 p-3">
            <p className="mb-3 text-center text-sm text-gray-500">例：</p>
            <div className="text-center">
              <div className="font-display mb-2 text-4xl font-bold text-drill-primary">
                あ
              </div>
              <div className="mb-3 text-4xl text-gray-700">↓</div>
              <p className="text-sm text-gray-600">
                「あ」から下に1マス移動すると...
              </p>
              <p className="mt-1 text-xl font-bold text-green-600">答え：い</p>
            </div>
          </div>
        </div>
      </section>

      {/* モードを選択 */}
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
            label="練習モード"
            mode="practice"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('practice')
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
  mode,
  onBack,
}: {
  mode: GojuonSlideMode
  onBack: () => void
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateSlideQuestion(lastQuestionRef.current)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [])

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
      <DrillMiniHeader onBack={onBack} drillLabel="スライド" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        <div className="mb-6 py-8">
          {currentQuestion && (
            <QuestionDisplay question={currentQuestion.question} />
          )}
        </div>

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="ひらがなで入力"
          maxLength={1}
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
  const { isPenalized, activatePenalty } = usePenaltyTimeout()
  const { remainingTime, subtractTime } =
    useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateSlideQuestion(lastQuestionRef.current)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [])

  const { currentQuestion, presentQuestion, checkAnswer, history } =
    useDrill(generateQuestion)

  // ドリル開始時に最初の問題を出題
  useEffect(() => {
    presentQuestion()
  }, [presentQuestion])

  // タイムアップ時の処理
  useChallengeTimeUp(remainingTime, score, history, currentQuestion, onTimeUp)

  const handleSubmit = () => {
    if (!userAnswer.trim() || remainingTime === 0) return

    const isCorrect = checkAnswer(userAnswer)
    if (isCorrect) {
      setScore((prev) => prev + 1)
      incrementCorrectCount('challenge')
    } else {
      // 不正解ペナルティ
      subtractTime(WRONG_ANSWER_PENALTY_SECONDS)
      activatePenalty()
    }
    presentQuestion()
    setUserAnswer('')
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="実力テスト" />

      {/* 問題エリア */}
      <div className="relative rounded-lg bg-white/70 p-4">
        {/* ペナルティ表示オーバーレイ */}
        <PenaltyOverlay isPenalized={isPenalized} />

        {/* タイマー */}
        <ChallengeTimer
          remainingSeconds={remainingTime}
          totalSeconds={CHALLENGE_TIME_LIMIT}
          isPenalized={isPenalized}
        />

        {/* スコア表示 */}
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500">正解数</span>
          <span className="ml-2 text-2xl font-bold text-drill-primary">
            {score}
          </span>
        </div>

        {/* 問題表示 */}
        <div className="mb-6 py-4">
          {currentQuestion && (
            <QuestionDisplay question={currentQuestion.question} />
          )}
        </div>

        {/* 回答入力エリア（フィードバックなし、即時次問題） */}
        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder="ひらがなで入力"
          maxLength={1}
          className="mt-4"
          instantMode
        />
      </div>
    </>
  )
}

/**
 * 五十音表スライドページ
 */
export function GojuonSlidePage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<GojuonSlideMode>('practice')
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeHistory, setChallengeHistory] = useState<HistoryEntry[]>([])
  const { updateHighScore } = useDrillStorage(DRILL_NAME)

  const handleStartDrill = (selectedMode: GojuonSlideMode) => {
    setMode(selectedMode)
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

  // 問題列のカスタム表示
  const renderQuestion = useCallback((question: Question) => {
    const { char, arrow } = parseSlideQuestion(question.question)
    return (
      <span className="font-display font-bold">
        {char} {arrow}
      </span>
    )
  }, [])

  return (
    <Layout maxWidth="2xl" drillId="50on-slide">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="五十音表スライド"
            description="矢印の方向に移動した文字を答えよう"
          />
          <StartScreen
            onStartDrill={handleStartDrill}
            onStartChallenge={handleStartChallenge}
          />
        </>
      )}
      {screen === 'drill' && (
        <DrillScreen mode={mode} onBack={handleBackToStart} />
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
          drillName="五十音表スライド"
          history={challengeHistory}
          questionRenderer={renderQuestion}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
    </Layout>
  )
}
