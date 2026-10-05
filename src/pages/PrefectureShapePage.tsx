import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnswerInputArea,
  ChallengeCountdownModal,
  ChallengeResult,
  ChallengeTimer,
  DrillHeader,
  DrillMiniHeader,
  FeedbackModal,
  Layout,
  ModeButton,
  PenaltyOverlay,
  ScoreDisplay,
  SectionHeader,
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
  checkShapeAnswer,
  generateShapeQuestion,
  PREFECTURES,
  PrefectureShape,
  type Prefecture,
} from '../drills/prefectureShape'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'
import type { Screen } from '../types/drill'

const DRILL_NAME = 'prefecture-shape'
// 都道府県名の練習・実力テストの保存済み記録を引き継ぐ。
const PRACTICE_MODE = 'prefecture'
const CHALLENGE_MODE = 'prefecture-challenge'

function useShapeDrill(mode: string) {
  const previousId = useRef<number | null>(null)
  const generateQuestion = useCallback(() => {
    const question = generateShapeQuestion(previousId.current)
    previousId.current = Number(question.question)
    return question
  }, [])
  const validateAnswer = useCallback((answer: string, question: Question) => {
    const prefecture = PREFECTURES.find(
      (item) => item.id === Number(question.question),
    )
    return !!prefecture && checkShapeAnswer(answer, prefecture)
  }, [])
  const drill = useDrill(generateQuestion, {
    validateAnswer,
    storage: { drillName: DRILL_NAME, mode },
  })
  const { presentQuestion } = drill
  useEffect(() => {
    if (previousId.current === null) presentQuestion()
  }, [presentQuestion])
  const prefecture = PREFECTURES.find(
    (item) => item.id === Number(drill.currentQuestion?.question),
  )
  return { ...drill, prefecture }
}

function ShapeQuestion({ prefecture }: { prefecture: Prefecture | undefined }) {
  return (
    <div className="mb-4 text-center">
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
  const { currentQuestion, presentQuestion, checkAnswer, prefecture } =
    useShapeDrill(PRACTICE_MODE)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)

  const handleSubmit = () => {
    if (!userAnswer.trim() || feedback || revealed || !currentQuestion) return
    const correct = checkAnswer(userAnswer)
    setFeedback({ type: correct ? 'correct' : 'retry' })
    setUserAnswer('')
  }
  const handleNext = () => {
    if (feedback?.type === 'correct' || revealed) {
      presentQuestion()
      setHintLevel(0)
    }
    setFeedback(null)
    setRevealed(false)
    setUserAnswer('')
  }
  const explanation = prefecture?.name ?? ''

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="都道府県 (形)" />
      <div className="rounded-lg bg-white/70 p-4">
        <ShapeQuestion prefecture={prefecture} />
        {revealed ? (
          <div className="text-center">
            <p
              role="status"
              className="rounded-xl bg-drill-primary-light p-4 font-medium text-drill-primary-dark"
            >
              {explanation}
            </p>
            <button
              onClick={handleNext}
              className="mt-4 rounded-xl bg-drill-primary px-6 py-3 font-bold text-white"
            >
              次の問題へ
            </button>
          </div>
        ) : (
          <>
            <AnswerInputArea
              value={userAnswer}
              onChange={setUserAnswer}
              onSubmit={handleSubmit}
              onNext={handleNext}
              feedback={feedback}
              placeholder="答えを入力"
              maxLength={20}
            />
            {prefecture && (
              <div className="mt-4 rounded-xl border-2 border-drill-accent bg-drill-primary-light/40 p-3">
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
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setRevealed(true)
                  setUserAnswer('')
                }}
                disabled={!!feedback}
                className="rounded-full px-4 py-2 text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-drill-primary"
              >
                わからないので答えを見る
              </button>
            </div>
          </>
        )}
      </div>
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
  const {
    currentQuestion,
    presentQuestion,
    checkAnswer,
    prefecture,
    score,
    history,
  } = useShapeDrill(CHALLENGE_MODE)
  const { remainingTime, subtractTime } =
    useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { isPenalized, activatePenalty } = usePenaltyTimeout()
  const [userAnswer, setUserAnswer] = useState('')
  useChallengeTimeUp(remainingTime, score, history, currentQuestion, onTimeUp)

  const handleSubmit = () => {
    if (!userAnswer.trim() || remainingTime === 0 || !currentQuestion) return
    if (!checkAnswer(userAnswer)) {
      subtractTime(WRONG_ANSWER_PENALTY_SECONDS)
      activatePenalty()
    }
    presentQuestion()
    setUserAnswer('')
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="実力テスト" />
      <div className="relative rounded-lg bg-white/70 p-4">
        <PenaltyOverlay isPenalized={isPenalized} />
        <ChallengeTimer
          remainingSeconds={remainingTime}
          totalSeconds={CHALLENGE_TIME_LIMIT}
          isPenalized={isPenalized}
        />
        <ScoreDisplay score={score} />
        <ShapeQuestion prefecture={prefecture} />
        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder="答えを入力"
          maxLength={20}
          disabled={remainingTime === 0}
          instantMode
        />
      </div>
    </>
  )
}

export function PrefectureShapePage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [result, setResult] = useState<{
    score: number
    history: HistoryEntry[]
  }>({ score: 0, history: [] })
  const { updateHighScore } = useDrillStorage(DRILL_NAME)
  const handleTimeUp = useCallback(
    (score: number, history: HistoryEntry[]) => {
      setResult({ score, history })
      updateHighScore(CHALLENGE_MODE, score)
      setScreen('challengeResult')
    },
    [updateHighScore],
  )
  const back = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl" drillId="prefecture-shape">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="都道府県の形"
            description="形から都道府県名を答えよう"
          />
          <section className="mb-8">
            <SectionHeader>ルール</SectionHeader>
            <div className="space-y-2 pl-3 text-gray-700">
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
            </div>
          </section>
          <section className="mb-6">
            <SectionHeader>モードを選択</SectionHeader>
            <div className="space-y-3">
              <ModeButton
                label={`実力テスト（${CHALLENGE_TIME_LIMIT}秒）`}
                ariaLabel={`都道府県名の実力テスト（${CHALLENGE_TIME_LIMIT}秒）`}
                drillName={DRILL_NAME}
                mode={CHALLENGE_MODE}
                icon="⏱️"
                variant="challenge"
                onClick={() => {
                  setScreen('countdown')
                }}
              />
              <div className="border-t-4 border-[var(--drill-primary-light)]"></div>
              <ModeButton
                label="練習モード"
                ariaLabel="都道府県名の練習"
                drillName={DRILL_NAME}
                mode={PRACTICE_MODE}
                icon="✏️"
                onClick={() => {
                  setScreen('drill')
                }}
              />
            </div>
          </section>
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
        </>
      )}
      {screen === 'drill' && <PracticeScreen onBack={back} />}
      {screen === 'countdown' && (
        <ChallengeCountdownModal
          onComplete={() => {
            setScreen('challenge')
          }}
        />
      )}
      {screen === 'challenge' && (
        <ChallengeScreen onBack={back} onTimeUp={handleTimeUp} />
      )}
      {screen === 'challengeResult' && (
        <ChallengeResult
          score={result.score}
          history={result.history}
          timeLimit={CHALLENGE_TIME_LIMIT}
          drillName="都道府県の形"
          onRetry={() => {
            setScreen('countdown')
          }}
          onBack={back}
          questionRenderer={(question) => {
            const prefecture = PREFECTURES.find(
              (item) => item.id === Number(question.question),
            )
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
      )}
    </Layout>
  )
}
