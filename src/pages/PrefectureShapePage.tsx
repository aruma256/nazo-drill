import { useCallback, useRef, useState } from 'react'
import {
  PrefectureAnswerGuide,
  PrefectureAnswerInput,
  PracticeAnswerArea,
  DrillPageLayout,
  DrillScreenLayout,
  FeedbackModal,
  DrillStartScreen,
} from '../components'
import {
  useChallengeDrill,
  usePracticeDrill,
  useDrillPage,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  checkShapeAnswer,
  generateShapeQuestion,
  PREFECTURES,
  PrefectureShape,
  type Prefecture,
} from '../drills/prefectureShape'

const DRILL_NAME = 'prefecture-shape'
const DRILL_TITLE = '都道府県の形'
// 都道府県名の練習・実力テストの保存済み記録を引き継ぐ。
const PRACTICE_MODE = 'prefecture'
const CHALLENGE_MODE = 'prefecture-challenge'
const PRACTICE_MODES = [{ mode: PRACTICE_MODE, label: '練習モード' }] as const

function useShapeQuestionGenerator() {
  const previousId = useRef<number | null>(null)
  return useCallback(() => {
    const question = generateShapeQuestion(previousId.current)
    previousId.current = Number(question.question)
    return question
  }, [])
}

function getQuestionPrefecture(question: Question | null) {
  return PREFECTURES.find((item) => item.id === Number(question?.question))
}

function validateShapeAnswer(answer: string, question: Question) {
  const prefecture = getQuestionPrefecture(question)
  return !!prefecture && checkShapeAnswer(answer, prefecture)
}

function ShapeQuestion({ prefecture }: { prefecture: Prefecture | undefined }) {
  return (
    <div className="text-center">
      <div className="mx-auto max-w-[280px] rounded-2xl border-2 border-dashed border-drill-accent bg-drill-primary-light/40 sm:max-w-[320px]">
        {prefecture && (
          <PrefectureShape prefectureId={prefecture.id} className="w-full" />
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        離島や小さな島・湖は一部省略しています。
      </p>
    </div>
  )
}

function PracticeScreen({ onBack }: { onBack: () => void }) {
  const generateQuestion = useShapeQuestionGenerator()
  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    feedback,
    revealed,
    submitAnswer,
    nextQuestion,
    revealAnswer,
  } = usePracticeDrill(generateQuestion, {
    validateAnswer: validateShapeAnswer,
    storage: { drillName: DRILL_NAME, mode: PRACTICE_MODE },
  })
  const prefecture = getQuestionPrefecture(currentQuestion)
  const [hintLevel, setHintLevel] = useState(0)

  const handleNext = () => {
    if (nextQuestion()) setHintLevel(0)
  }
  const explanation = prefecture?.name ?? ''

  return (
    <>
      <DrillScreenLayout onBack={onBack} drillLabel="都道府県 (形)">
        <ShapeQuestion prefecture={prefecture} />
        <PracticeAnswerArea
          revealed={revealed}
          answer={explanation}
          onReveal={revealAnswer}
          onNext={handleNext}
          disabled={!!feedback}
        >
          <PrefectureAnswerInput
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={submitAnswer}
            onNext={handleNext}
            feedback={feedback}
          />
          {prefecture && (
            <div className="rounded-xl border-2 border-drill-accent bg-drill-primary-light/40 p-3">
              <div aria-live="polite" className="space-y-2 text-sm">
                {hintLevel >= 1 && (
                  <p className="text-drill-primary-dark">
                    <span className="font-bold">ヒント1：</span>
                    {prefecture.region}
                  </p>
                )}
                {hintLevel >= 2 && (
                  <p className="text-drill-primary-dark">
                    <span className="font-bold">ヒント2：</span>
                    頭文字は「{prefecture.reading[0]}」
                  </p>
                )}
              </div>
              {hintLevel < 2 && (
                <button
                  onClick={() => {
                    setHintLevel((level) => level + 1)
                  }}
                  disabled={!!feedback}
                  className={`w-full cursor-pointer rounded-lg border-2 border-dashed border-drill-accent bg-white px-4 py-3 text-sm font-bold text-drill-primary-dark transition-colors hover:bg-drill-primary-light disabled:cursor-not-allowed disabled:opacity-50 ${hintLevel > 0 ? 'mt-3' : ''}`}
                >
                  <span aria-hidden="true">💡 </span>
                  ヒント{hintLevel + 1}を見る
                </button>
              )}
            </div>
          )}
        </PracticeAnswerArea>
      </DrillScreenLayout>
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        hintContent={feedback?.type === 'correct' ? explanation : undefined}
        onNext={handleNext}
      />
    </>
  )
}

function ChallengeScreen({
  onBack,
  onTimeUp,
}: {
  onBack: () => void
  onTimeUp: (score: number, history: HistoryEntry[]) => void
}) {
  const generateQuestion = useShapeQuestionGenerator()
  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    submitAnswer,
    score,
    remainingTime,
    isPenalized,
    isFinished,
  } = useChallengeDrill(generateQuestion, {
    onTimeUp,
    validateAnswer: validateShapeAnswer,
    storage: { drillName: DRILL_NAME, mode: CHALLENGE_MODE },
  })
  const prefecture = getQuestionPrefecture(currentQuestion)

  return (
    <DrillScreenLayout
      onBack={onBack}
      drillLabel="実力テスト"
      challenge={{ remainingTime, isPenalized, score }}
    >
      <ShapeQuestion prefecture={prefecture} />
      <PrefectureAnswerInput
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
  )
}

function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: typeof PRACTICE_MODE) => void
  onStartChallenge: () => void
}) {
  return (
    <DrillStartScreen
      drillId={DRILL_NAME}
      title={DRILL_TITLE}
      practiceModes={PRACTICE_MODES}
      onStartDrill={onStartDrill}
      onStartChallenge={onStartChallenge}
      challengeMode={CHALLENGE_MODE}
      footer={
        <p className="mt-8 text-center text-xs text-gray-500">
          出典：
          <a
            href="https://www.gsi.go.jp/kankyochiri/gm_jpn.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            国土地理院「地球地図日本」
          </a>
          （加工）
        </p>
      }
    >
      <p>都道府県の形を見て、都道府県名を当てます。</p>
      <div className="mt-3 flex items-center justify-center gap-4 rounded-lg bg-white/50 p-3 text-center">
        <PrefectureShape
          prefectureId={1}
          label="例題：北海道の形"
          className="w-24 shrink-0"
        />
        <span className="font-mono text-lg">→</span>
        <span className="font-mono text-lg font-bold text-green-600">
          北海道
        </span>
      </div>
      <PrefectureAnswerGuide />
    </DrillStartScreen>
  )
}

export function PrefectureShapePage() {
  const page = useDrillPage<typeof PRACTICE_MODE>(DRILL_NAME, {
    challengeMode: CHALLENGE_MODE,
  })

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title={DRILL_TITLE}
      description="形から都道府県名を答えよう"
      controller={page}
      startScreen={
        <StartScreen
          onStartDrill={page.startPractice}
          onStartChallenge={page.startChallenge}
        />
      }
      renderPractice={() => <PracticeScreen onBack={page.backToStart} />}
      challengeScreen={
        <ChallengeScreen
          onBack={page.backToStart}
          onTimeUp={page.finishChallenge}
        />
      }
      questionRenderer={(question) => {
        const prefecture = getQuestionPrefecture(question)
        return prefecture ? (
          <div className="flex flex-col items-center gap-1">
            <PrefectureShape
              prefectureId={prefecture.id}
              label={`${prefecture.name}の形`}
              className="w-12"
            />
            <span className="text-xs">{prefecture.name}</span>
          </div>
        ) : null
      }}
    />
  )
}
