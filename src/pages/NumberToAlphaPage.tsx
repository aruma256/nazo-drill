import { useCallback, useRef } from 'react'
import {
  DrillPageLayout,
  DrillScreenLayout,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  PracticeAnswerArea,
  DrillMiniHeader,
  SectionHeader,
} from '../components'
import {
  usePracticeDrill,
  useChallengeDrill,
  useDrillPage,
  type HistoryEntry,
} from '../hooks'
import {
  type DrillMode,
  generateEjotyQuestion,
  generateSingleQuestion,
  generateWordQuestion,
} from '../drills/numberToAlpha'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'

const DRILL_NAME = '123-abc'

/**
 * アルファベット参照表（EJOTYのみ表示）
 */
function AlphaTable() {
  return (
    <div className="flex justify-center">
      <table className="border-collapse border border-gray-300">
        <tbody>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-drill-primary-light text-center text-sm font-bold text-drill-primary sm:h-8 sm:w-14 sm:text-base">
              E
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-drill-primary-light text-center text-sm font-bold text-drill-primary sm:h-8 sm:w-14 sm:text-base">
              J
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-drill-primary-light text-center text-sm font-bold text-drill-primary sm:h-8 sm:w-14 sm:text-base">
              O
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-drill-primary-light text-center text-sm font-bold text-drill-primary sm:h-8 sm:w-14 sm:text-base">
              T
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-drill-primary-light text-center text-sm font-bold text-drill-primary sm:h-8 sm:w-14 sm:text-base">
              Y
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base">
              Z
            </td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
            <td className="h-7 w-12 border border-transparent bg-transparent sm:h-8 sm:w-14"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/**
 * EJOTY特訓モード用ヒントメッセージ
 */
function EjotyHint({ shouldFade }: { shouldFade: boolean }) {
  return (
    <div className="text-center">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p
          className={`font-medium text-amber-800 transition-opacity duration-[8000ms] ${
            shouldFade ? 'opacity-0' : ''
          }`}
        >
          E, J, O, T, Y = 5, 10, 15, 20, 25
        </p>
        <p className="mt-1 text-sm text-amber-600">5の倍数だけ覚えよう</p>
      </div>
    </div>
  )
}

/**
 * 暗記ノート用データ（1〜26の対応表）
 * memo は語呂合わせなどユーザーが後で入力するためのプレースホルダー
 */
const ALPHABET_TABLE: { num: number; alpha: string; memo: string }[] = [
  { num: 1, alpha: 'A', memo: '' },
  { num: 2, alpha: 'B', memo: '' },
  { num: 3, alpha: 'C', memo: '' },
  { num: 4, alpha: 'D', memo: '' },
  { num: 5, alpha: 'E', memo: 'EJOTY' },
  { num: 6, alpha: 'F', memo: '' },
  { num: 7, alpha: 'G', memo: '' },
  { num: 8, alpha: 'H', memo: 'height (高さ) は h + eight' },
  { num: 9, alpha: 'I', memo: '' },
  { num: 10, alpha: 'J', memo: 'EJOTY' },
  { num: 11, alpha: 'K', memo: '' },
  { num: 12, alpha: 'L', memo: '' },
  { num: 13, alpha: 'M', memo: '「3」を左に倒すとM（右に倒すとW=23）' },
  { num: 14, alpha: 'N', memo: '' },
  { num: 15, alpha: 'O', memo: 'EJOTY' },
  { num: 16, alpha: 'P', memo: '' },
  { num: 17, alpha: 'Q', memo: '' },
  { num: 18, alpha: 'R', memo: 'R18…🤔' },
  { num: 19, alpha: 'S', memo: '' },
  { num: 20, alpha: 'T', memo: 'EJOTY' },
  { num: 21, alpha: 'U', memo: '' },
  { num: 22, alpha: 'V', memo: '' },
  { num: 23, alpha: 'W', memo: '「3」を右に倒すとW（左に倒すとM=13）' },
  { num: 24, alpha: 'X', memo: '' },
  { num: 25, alpha: 'Y', memo: 'EJOTY' },
  { num: 26, alpha: 'Z', memo: '' },
]

/**
 * 暗記ノート画面
 */
function NoteScreen({ onBack }: { onBack: () => void }) {
  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="暗記ノート" />

      <div className="space-y-6">
        {/* 習得レベル */}
        <section className="rounded-lg bg-white/70 p-4">
          <SectionHeader>習得レベル</SectionHeader>
          <div className="space-y-3 text-gray-700">
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                レベル1: EJOTYのみ覚える
              </p>
              <p className="mt-1 text-sm">
                まずは5の倍数だけ覚えましょう。
                <br />
                <span className="font-mono font-bold text-drill-primary">
                  E=5, J=10, O=15, T=20, Y=25
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                レベル2: EJOTYから進めて求める
              </p>
              <p className="mt-1 text-sm">
                EJOTYを基準に、足し算で他の文字を導く。
                <br />
                例: E=5 なので、F=6, G=7
              </p>
            </div>
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                レベル3: 3, 8, 13, 18, 23 も覚える
              </p>
              <p className="mt-1 text-sm">
                EJOTYの2つ前の文字を覚える。
                <br />
                <span className="font-mono font-bold text-drill-primary">
                  C=3, H=8, M=13, R=18, W=23
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                レベル4: 他の文字も覚える
              </p>
              <p className="mt-1 text-sm">
                よく使う文字から優先的に暗記していく。
              </p>
            </div>
          </div>
        </section>

        {/* 対応表 */}
        <section className="rounded-lg bg-white/70 p-4">
          <SectionHeader>対応表</SectionHeader>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-16 px-3 py-2 text-center text-sm font-bold text-gray-600">
                    数字
                  </th>
                  <th className="w-16 px-3 py-2 text-center text-sm font-bold text-gray-600">
                    ABC
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-gray-600">
                    覚え方メモ
                  </th>
                </tr>
              </thead>
              <tbody>
                {ALPHABET_TABLE.map((row) => {
                  const isEjoty = [5, 10, 15, 20, 25].includes(row.num)
                  return (
                    <tr
                      key={row.num}
                      className={`border-t border-gray-100 ${
                        isEjoty ? 'bg-amber-50' : 'bg-white'
                      }`}
                    >
                      <td
                        className={`px-3 py-2 text-center font-mono text-lg ${
                          isEjoty ? 'font-bold text-amber-700' : 'text-gray-700'
                        }`}
                      >
                        {row.num}
                      </td>
                      <td
                        className={`px-3 py-2 text-center font-mono text-lg ${
                          isEjoty
                            ? 'font-bold text-amber-700'
                            : 'text-drill-primary'
                        }`}
                      >
                        {row.alpha}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {row.memo}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
  onStartChallenge,
  onOpenNote,
}: {
  onStartDrill: (mode: DrillMode) => void
  onStartChallenge: () => void
  onOpenNote: () => void
}) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <SectionHeader>ルール</SectionHeader>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>
            1, 2, 3 ...
            を、アルファベットのAから順に対応させて変換します。1はA、2はB ...
            26はZ となります。
          </p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-drill-primary">1</span> →{' '}
              <span className="font-bold text-green-600">A</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-drill-primary">5</span> →{' '}
              <span className="font-bold text-green-600">E</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-drill-primary">26</span> →{' '}
              <span className="font-bold text-green-600">Z</span>
            </p>
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
            label={'"EJOTY"特訓モード'}
            mode="ejoty"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('ejoty')
            }}
            icon="✏️"
          />
          <ModeButton
            label="1文字モード"
            mode="single"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('single')
            }}
            icon="✏️"
          />
          <ModeButton
            label="単語モード"
            mode="word"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('word')
            }}
            icon="✏️"
          />

          <div className="border-t-4 border-[var(--drill-primary-light)]"></div>

          <ModeButton
            label="暗記ノート"
            mode="note"
            drillName={DRILL_NAME}
            onClick={onOpenNote}
            icon="📖"
            hidePoints
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
  mode: DrillMode
  onBack: () => void
}) {
  // 前回の問題を追跡するRef
  const lastNumberRef = useRef<number | null>(null)
  const lastWordRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    switch (mode) {
      case 'ejoty': {
        const result = generateEjotyQuestion(lastNumberRef.current)
        lastNumberRef.current = result.newLastNumber
        return result.question
      }
      case 'single': {
        const result = generateSingleQuestion(lastNumberRef.current)
        lastNumberRef.current = result.newLastNumber
        return result.question
      }
      case 'word':
      case 'challenge': {
        const result = generateWordQuestion(lastWordRef.current)
        lastWordRef.current = result.newLastWord
        return result.question
      }
    }
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
    totalQuestions,
  } = usePracticeDrill(generateQuestion, {
    storage: { drillName: DRILL_NAME, mode },
  })

  // EJOTYモードで6問目以降にヒントをフェードアウト
  const shouldFadeEjotyHint = mode === 'ejoty' && totalQuestions >= 6

  return (
    <>
      <DrillScreenLayout onBack={onBack} drillLabel="数字→ABC">
        {/* 問題表示 */}
        <div className="text-center">
          <div className="text-5xl font-bold text-drill-primary-dark">
            {currentQuestion?.question ?? '--'}
          </div>
          {currentQuestion?.subtext && (
            <div className="mt-1 text-sm text-gray-500">
              {currentQuestion.subtext}
            </div>
          )}
        </div>

        {/* EJOTY特訓モード用ヒントメッセージ */}
        {mode === 'ejoty' && <EjotyHint shouldFade={shouldFadeEjotyHint} />}

        {/* アルファベット参照表（1文字モードのみ） */}
        {mode === 'single' && <AlphaTable />}

        <PracticeAnswerArea
          revealed={revealed}
          answer={currentQuestion?.answer}
          onReveal={revealAnswer}
          onNext={nextQuestion}
          disabled={!!feedback}
        >
          <AnswerInputArea
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            feedback={feedback}
            placeholder="答えを入力"
            maxLength={10}
            inputTransform={(value) => value.toUpperCase()}
            inputClassName="uppercase"
          />
        </PracticeAnswerArea>
      </DrillScreenLayout>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        hintContent={
          feedback?.type === 'correct' && currentQuestion
            ? `${currentQuestion.answer} = ${currentQuestion.question}`
            : undefined
        }
        onNext={nextQuestion}
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
  // 前回の問題を追跡するRef
  const lastWordRef = useRef<string | null>(null)

  // 問題生成関数（単語モードと同じ）
  const generateQuestion = useCallback(() => {
    const result = generateWordQuestion(lastWordRef.current)
    lastWordRef.current = result.newLastWord
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
        {currentQuestion?.subtext && (
          <div className="mt-1 text-sm text-gray-500">
            {currentQuestion.subtext}
          </div>
        )}
      </div>

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <AnswerInputArea
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        placeholder="答えを入力"
        maxLength={10}
        inputTransform={(value) => value.toUpperCase()}
        inputClassName="uppercase"
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
  )
}

/**
 * 数字→アルファベットページ
 */
export function NumberToAlphaPage() {
  const page = useDrillPage<DrillMode>(DRILL_NAME)

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title="数字→アルファベット"
      description="1, 2, 3 ... を A, B, C ... に変換しよう"
      controller={page}
      startScreen={
        <StartScreen
          onStartDrill={page.startPractice}
          onStartChallenge={page.startChallenge}
          onOpenNote={page.openNote}
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
      noteScreen={<NoteScreen onBack={page.backToStart} />}
    />
  )
}
