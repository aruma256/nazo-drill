import { useCallback, useRef } from 'react'
import {
  DrillPageLayout,
  DrillScreenLayout,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  SectionHeader,
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
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'

const DRILL_NAME = 'abc-shift'

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
    submitAnswer,
    nextQuestion,
  } = usePracticeDrill(generateQuestion, {
    storage: { drillName: DRILL_NAME, mode },
  })

  return (
    <>
      <DrillScreenLayout onBack={onBack} drillLabel="ABCシフト">
        {/* 問題表示 */}
        <div className="text-center">
          <div className="text-5xl font-bold text-drill-primary-dark">
            {currentQuestion?.question ?? '--'}
          </div>
        </div>

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          feedback={feedback}
          placeholder="答えを入力"
          maxLength={1}
          inputTransform={(value) => value.toUpperCase()}
          inputClassName="uppercase"
        />
      </DrillScreenLayout>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        onNext={nextQuestion}
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
      <div className="text-center">
        <div className="text-5xl font-bold text-drill-primary-dark">
          {currentQuestion?.question ?? '--'}
        </div>
      </div>

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <AnswerInputArea
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        placeholder="答えを入力"
        maxLength={1}
        inputTransform={(value) => value.toUpperCase()}
        inputClassName="uppercase"
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
      title="アルファベットシフト"
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
