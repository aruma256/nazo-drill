import { useCallback, useState } from 'react'
import {
  ChallengeCountdownModal,
  ChallengeResult,
  DrillHeader,
  DrillScreenLayout,
  Layout,
  ModeButton,
  SectionHeader,
} from '../components'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'
import { useChallenge, useDrillSession, useDrillStorage } from '../hooks'
import type { HistoryEntry } from '../hooks'
import {
  MAGIC_SQUARES,
  MagicSquareBoard,
  useMagicSquareRound,
  type MagicSquareMode,
} from '../drills/magicSquare'
import type { Screen } from '../types/drill'

const DRILL_NAME = 'magic-square'
const CHALLENGE_MODE = 'two-clues-challenge'
const PRACTICE_MODES = [
  { mode: 'first-three', label: '1・2・3が埋まっている', icon: '🌱' },
  { mode: 'three-clues', label: '3マス埋まっている', icon: '✏️' },
  { mode: 'two-clues', label: '2マス埋まっている', icon: '🔥' },
] as const

type MagicSquareRound = ReturnType<typeof useMagicSquareRound>

function RoundView({
  round,
  onSelect,
  disabled = false,
}: {
  round: MagicSquareRound
  onSelect: (index: number) => void
  disabled?: boolean
}) {
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="font-display flex h-16 items-center justify-center text-2xl font-bold"
      >
        {round.phase === 'complete' ? (
          <span className="text-emerald-600">○ 正解！</span>
        ) : round.phase === 'revealed' ? (
          <span className="text-drill-primary-dark">答えを確認しよう</span>
        ) : (
          <span className="text-drill-primary-dark">
            <span className="mr-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-drill-primary font-mono text-4xl text-white shadow-md">
              {round.nextNumber}
            </span>
            を置こう
          </span>
        )}
      </div>
      <MagicSquareBoard
        cells={round.cells}
        givens={round.question.cells}
        onSelect={onSelect}
        wrongIndex={round.wrongIndex}
        disabled={disabled || !round.canPlaceNumber}
      />
    </>
  )
}

function PracticeScreen({
  mode,
  onBack,
}: {
  mode: MagicSquareMode
  onBack: () => void
}) {
  const round = useMagicSquareRound(mode)
  const { recordAnswer } = useDrillSession({
    storage: { drillName: DRILL_NAME, mode },
  })
  const handleSelect = (index: number) => {
    if (round.placeNumber(index) === 'complete') {
      recordAnswer({
        question: round.question,
        userAnswer: round.question.answer,
        isCorrect: true,
      })
    }
  }

  return (
    <DrillScreenLayout onBack={onBack} drillLabel="3×3魔方陣">
      <RoundView round={round} onSelect={handleSelect} />
      <div className="text-center">
        {round.phase === 'revealed' ? (
          <button
            type="button"
            onClick={round.nextQuestion}
            className="rounded-xl bg-drill-primary px-6 py-3 font-bold text-white"
          >
            次の問題へ
          </button>
        ) : (
          <button
            type="button"
            onClick={round.revealAnswer}
            disabled={!round.canPlaceNumber}
            className="rounded-full px-4 py-2 text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-drill-primary disabled:opacity-40"
          >
            わからないので答えを見る
          </button>
        )}
      </div>
    </DrillScreenLayout>
  )
}

function ChallengeScreen({
  onBack,
  onTimeUp,
}: {
  onBack: () => void
  onTimeUp: (score: number, history: HistoryEntry[]) => void
}) {
  const round = useMagicSquareRound('two-clues', { allowImmediateRetry: true })
  const { score, history, recordAnswer } = useDrillSession({
    storage: { drillName: DRILL_NAME, mode: CHALLENGE_MODE },
  })
  const { phase, question, cells } = round

  const { remainingTime, isPenalized, isFinished, applyPenalty } = useChallenge(
    {
      score,
      history,
      // 完成直後の正解表示中は、同じ盤面を時間切れとして二重に記録しない。
      currentQuestion: phase === 'complete' ? null : question,
      onTimeUp,
      userAnswer: cells.join(''),
    },
  )

  const handleSelect = (index: number) => {
    if (isFinished) return
    const result = round.placeNumber(index)
    if (result === 'wrong') {
      applyPenalty()
    } else if (result === 'complete') {
      recordAnswer({ question, userAnswer: question.answer, isCorrect: true })
    }
  }

  return (
    <DrillScreenLayout
      onBack={onBack}
      drillLabel="実力テスト"
      challenge={{ remainingTime, isPenalized, score }}
    >
      <RoundView round={round} onSelect={handleSelect} disabled={isFinished} />
    </DrillScreenLayout>
  )
}

function MagicSquareHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <section className="mt-8">
      <SectionHeader>解答履歴</SectionHeader>
      <ol className="space-y-3">
        {history.map((entry) => {
          const givens = Array.from(entry.question.question, Number)
          return (
            <li key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-gray-600">
                {entry.id}問目
                <span
                  className={`ml-3 ${entry.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}
                >
                  {entry.isCorrect ? '○ 完成' : '時間切れ'}
                </span>
              </p>
              <div className="flex justify-center gap-8">
                <div>
                  <p className="mb-2 text-center text-xs text-gray-500">
                    あなたの回答
                  </p>
                  <MagicSquareBoard
                    cells={Array.from(entry.userAnswer, Number)}
                    givens={givens}
                    size="small"
                    label={`${entry.id}問目の回答`}
                  />
                </div>
                <div>
                  <p className="mb-2 text-center text-xs text-gray-500">正解</p>
                  <MagicSquareBoard
                    cells={Array.from(entry.question.answer, Number)}
                    givens={givens}
                    size="small"
                    label={`${entry.id}問目の正解`}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function MagicSquarePage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [practiceMode, setPracticeMode] =
    useState<MagicSquareMode>('first-three')
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
    <Layout
      maxWidth="2xl"
      drillId="magic-square"
      compact={screen === 'drill' || screen === 'challenge'}
    >
      {screen === 'start' && (
        <>
          <DrillHeader
            title="3×3魔方陣"
            description="数字を小さい順に置いて、魔方陣を完成させよう"
          />
          <section className="mb-8">
            <SectionHeader>ルール</SectionHeader>
            <div className="space-y-3 pl-3 text-gray-700">
              <p>
                1〜9を1回ずつ使い、たて・よこ・ななめの合計をすべて15にします。
              </p>
              <MagicSquareBoard cells={MAGIC_SQUARES[0]} size="small" />
              <p>
                このドリルでは、2～3マスのみが埋まった状態の魔方陣を素早く完成させるトレーニングができます。
              </p>
            </div>
          </section>
          <section className="mb-6">
            <SectionHeader>モードを選択</SectionHeader>
            <div className="space-y-3">
              <ModeButton
                label={`実力テスト（${CHALLENGE_TIME_LIMIT}秒）`}
                ariaLabel={`3×3魔方陣の実力テスト（${CHALLENGE_TIME_LIMIT}秒）`}
                drillName={DRILL_NAME}
                mode={CHALLENGE_MODE}
                icon="⏱️"
                variant="challenge"
                onClick={() => {
                  setScreen('countdown')
                }}
              />
              <div className="border-t-4 border-[var(--drill-primary-light)]"></div>
              {PRACTICE_MODES.map(({ mode, label, icon }) => (
                <ModeButton
                  key={mode}
                  label={label}
                  ariaLabel={`${label}魔方陣の練習`}
                  drillName={DRILL_NAME}
                  mode={mode}
                  icon={icon}
                  onClick={() => {
                    setPracticeMode(mode)
                    setScreen('drill')
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
      {screen === 'drill' && (
        <PracticeScreen mode={practiceMode} onBack={back} />
      )}
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
        <>
          <ChallengeResult
            score={result.score}
            timeLimit={CHALLENGE_TIME_LIMIT}
            drillName="3×3魔方陣"
            onRetry={() => {
              setScreen('countdown')
            }}
            onBack={back}
          />
          <MagicSquareHistory history={result.history} />
        </>
      )}
    </Layout>
  )
}
