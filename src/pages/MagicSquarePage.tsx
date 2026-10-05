import {
  DrillPageLayout,
  DrillScreenLayout,
  ModeButton,
  SectionHeader,
} from '../components'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'
import { useChallenge, useDrillSession, useDrillPage } from '../hooks'
import type { HistoryEntry } from '../hooks'
import {
  MAGIC_SQUARES,
  MagicSquareBoard,
  useMagicSquareRound,
  type MagicSquareMode,
} from '../drills/magicSquare'

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
  const { question } = round

  const { remainingTime, isPenalized, isFinished, applyPenalty } = useChallenge(
    {
      score,
      history,
      onTimeUp,
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

function MagicSquareHistoryEntry({ entry }: { entry: HistoryEntry }) {
  const givens = Array.from(entry.question.question, Number)
  return (
    <div className="flex justify-center gap-8">
      <div>
        <p className="mb-2 text-center text-xs text-gray-500">あなたの回答</p>
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
  )
}

function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: MagicSquareMode) => void
  onStartChallenge: () => void
}) {
  return (
    <>
      <section className="mb-8">
        <SectionHeader>ルール</SectionHeader>
        <div className="space-y-3 pl-3 text-gray-700">
          <p>1〜9を1回ずつ使い、たて・よこ・ななめの合計をすべて15にします。</p>
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
            onClick={onStartChallenge}
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
                onStartDrill(mode)
              }}
            />
          ))}
        </div>
      </section>
    </>
  )
}

export function MagicSquarePage() {
  const page = useDrillPage<MagicSquareMode>(DRILL_NAME, {
    challengeMode: CHALLENGE_MODE,
  })

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title="3×3魔方陣"
      description="数字を小さい順に置いて、魔方陣を完成させよう"
      controller={page}
      startScreen={
        <StartScreen
          onStartDrill={page.startPractice}
          onStartChallenge={page.startChallenge}
        />
      }
      renderPractice={(mode) => (
        <PracticeScreen mode={mode} onBack={page.backToStart} />
      )}
      challengeScreen={
        <ChallengeScreen
          onBack={page.backToStart}
          onTimeUp={page.finishChallenge}
        />
      }
      historyEntryRenderer={(entry) => (
        <MagicSquareHistoryEntry entry={entry} />
      )}
    />
  )
}
