import { useCallback, useRef } from 'react'
import {
  DrillPageLayout,
  DrillScreenLayout,
  PracticeScreenLayout,
  TextQuestion,
  DrillStartScreen,
  AnswerInputArea,
} from '../components'
import {
  usePracticeDrill,
  useChallengeDrill,
  useDrillPage,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  type GojuonSlideMode,
  generateSlideQuestion,
  parseSlideQuestion,
} from '../drills/gojuonSlide'

const DRILL_NAME = '50on-slide'
const DRILL_TITLE = '五十音表スライド'
const PRACTICE_MODES = [{ mode: 'practice', label: '練習モード' }] as const

/**
 * 問題表示コンポーネント
 */
function QuestionDisplay({ question }: { question: string }) {
  const { char, arrow } = parseSlideQuestion(question)
  return (
    <div className="text-center">
      <TextQuestion text={char} />
      <div className="mt-4 text-4xl text-gray-700 sm:text-5xl">{arrow}</div>
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
    <DrillStartScreen
      drillId={DRILL_NAME}
      title={DRILL_TITLE}
      practiceModes={PRACTICE_MODES}
      onStartDrill={onStartDrill}
      onStartChallenge={onStartChallenge}
    >
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
    </DrillStartScreen>
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
  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateSlideQuestion(lastQuestionRef.current)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [])

  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    feedback,
    revealed,
    revealAnswer,
    submitAnswer,
    nextQuestion,
  } = usePracticeDrill(generateQuestion, {
    storage: { drillName: DRILL_NAME, mode },
  })

  return (
    <PracticeScreenLayout
      onBack={onBack}
      drillLabel="スライド"
      question={
        <div>
          {currentQuestion && (
            <QuestionDisplay question={currentQuestion.question} />
          )}
        </div>
      }
      answer={currentQuestion?.answer}
      feedback={feedback}
      revealed={revealed}
      onReveal={revealAnswer}
      onNext={nextQuestion}
      disabled={!currentQuestion}
    >
      <AnswerInputArea
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        onNext={nextQuestion}
        feedback={feedback}
        placeholder="ひらがなで入力"
        maxLength={1}
      />
    </PracticeScreenLayout>
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
  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateSlideQuestion(lastQuestionRef.current)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [])

  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    submitAnswer,
    remainingTime,
    isPenalized,
    isFinished,
    score,
  } = useChallengeDrill(generateQuestion, {
    onTimeUp,
    storage: { drillName: DRILL_NAME, mode: 'challenge' },
  })

  return (
    <DrillScreenLayout
      onBack={onBack}
      drillLabel="実力テスト"
      challenge={{ remainingTime, isPenalized, score }}
    >
      {/* 問題表示 */}
      <div>
        {currentQuestion && (
          <QuestionDisplay question={currentQuestion.question} />
        )}
      </div>

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <AnswerInputArea
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        placeholder="ひらがなで入力"
        maxLength={1}
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
  )
}

/**
 * 五十音表スライドページ
 */
export function GojuonSlidePage() {
  const page = useDrillPage<GojuonSlideMode>(DRILL_NAME)
  const renderQuestion = useCallback((question: Question) => {
    const { char, arrow } = parseSlideQuestion(question.question)
    return (
      <span className="font-display font-bold">
        {char} {arrow}
      </span>
    )
  }, [])

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title={DRILL_TITLE}
      description="矢印の方向に移動した文字を答えよう"
      controller={page}
      startScreen={
        <StartScreen
          onStartDrill={page.startPractice}
          onStartChallenge={page.startChallenge}
        />
      }
      renderPractice={(mode) => (
        <DrillScreen mode={mode} onBack={page.backToStart} />
      )}
      challengeScreen={
        <ChallengeScreen
          onTimeUp={page.finishChallenge}
          onBack={page.backToStart}
        />
      }
      questionRenderer={renderQuestion}
    />
  )
}
