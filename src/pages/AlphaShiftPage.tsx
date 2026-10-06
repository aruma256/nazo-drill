import { useCallback, useRef } from 'react'
import {
  DrillPageLayout,
  DrillScreenLayout,
  PracticeScreenLayout,
  TextQuestion,
  DrillStartScreen,
  AlphabetAnswerInput,
} from '../components'
import {
  usePracticeDrill,
  useChallengeDrill,
  useDrillPage,
  type HistoryEntry,
} from '../hooks'
import {
  generateAlphaShiftQuestion,
  generateChallengeQuestion,
  type TrainingMode,
} from '../drills/alphaShift'

const DRILL_NAME = 'abc-shift'
const DRILL_TITLE = 'アルファベットシフト'
const PRACTICE_MODES = [
  { mode: 'plus-training', label: '+1～+3 特訓' },
  { mode: 'minus-training', label: '-1～-3 特訓' },
] as const

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: TrainingMode) => void
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
    </DrillStartScreen>
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
  mode: TrainingMode
}) {
  // 前回の問題を追跡するRef
  const lastQuestionRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    const result = generateAlphaShiftQuestion(lastQuestionRef.current, mode)
    lastQuestionRef.current = result.newLastQuestion
    return result.question
  }, [mode])

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
      drillLabel="ABCシフト"
      question={<TextQuestion text={currentQuestion?.question} />}
      answer={currentQuestion?.answer}
      feedback={feedback}
      revealed={revealed}
      onReveal={revealAnswer}
      onNext={nextQuestion}
      disabled={!currentQuestion}
    >
      <AlphabetAnswerInput
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        onNext={nextQuestion}
        feedback={feedback}
        maxLength={1}
      />
    </PracticeScreenLayout>
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
      <TextQuestion text={currentQuestion?.question} />

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <AlphabetAnswerInput
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        maxLength={1}
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
  )
}

/**
 * アルファベットシフトページ
 */
export function AlphaShiftPage() {
  const page = useDrillPage<TrainingMode>(DRILL_NAME)

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title={DRILL_TITLE}
      description="アルファベットをずらして変換しよう"
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
    />
  )
}
