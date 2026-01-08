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
  useCountdownTimer,
  useDrill,
  useDrillStorage,
  usePenaltyTimeout,
  type Feedback,
  type HistoryEntry,
} from '../hooks'
import {
  type DrillMode,
  generateEjotyQuestion,
  generateSingleQuestion,
  generateWordQuestion,
} from '../drills/numberToAlpha'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'

const DRILL_NAME = '123-abc'

type Screen =
  | 'start'
  | 'drill'
  | 'countdown'
  | 'challenge'
  | 'challengeResult'
  | 'note'

/**
 * アルファベット参照表（EJOTYのみ表示）
 */
function AlphaTable() {
  return (
    <div className="mb-4 flex justify-center">
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
    <div className="mb-4 text-center">
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
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastNumberRef = useRef<number | null>(null)
  const lastWordRef = useRef<string | null>(null)

  // EJOTYヒントのフェード用
  const [questionCount, setQuestionCount] = useState(0)

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
      setQuestionCount((c) => c + 1)
      presentQuestion()
    }
    // リトライの場合は同じ問題を続ける
  }

  // EJOTYモードで6問目以降にヒントをフェードアウト
  const shouldFadeEjotyHint = mode === 'ejoty' && questionCount >= 5

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="数字→ABC" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-4 text-center">
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

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="答えを入力"
          maxLength={10}
          inputTransform={(value) => value.toUpperCase()}
          inputClassName="uppercase"
        />
      </div>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        hintContent={
          feedback?.type === 'correct' && currentQuestion
            ? `${currentQuestion.answer} = ${currentQuestion.question}`
            : undefined
        }
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
  const lastWordRef = useRef<string | null>(null)

  // 問題生成関数（単語モードと同じ）
  const generateQuestion = useCallback(() => {
    const result = generateWordQuestion(lastWordRef.current)
    lastWordRef.current = result.newLastWord
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
      // 出題中の問題があれば、空回答として履歴に追加
      let finalHistory = history
      if (currentQuestion) {
        finalHistory = [
          ...history,
          {
            id: history.length + 1,
            question: currentQuestion,
            userAnswer: '',
            isCorrect: false,
          },
        ]
      }
      onTimeUp(score, finalHistory)
    }
  }, [remainingTime, score, history, currentQuestion, onTimeUp])

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
        <div className="mb-4 text-center">
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
          onSubmit={handleSubmit}
          placeholder="答えを入力"
          maxLength={10}
          inputTransform={(value) => value.toUpperCase()}
          inputClassName="uppercase"
          instantMode
        />
      </div>
    </>
  )
}

/**
 * 数字→アルファベットページ
 */
export function NumberToAlphaPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('single')
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeHistory, setChallengeHistory] = useState<HistoryEntry[]>([])
  const { updateHighScore } = useDrillStorage(DRILL_NAME)

  const handleStartDrill = (selectedMode: DrillMode) => {
    setMode(selectedMode)
    setScreen('drill')
  }

  const handleStartChallenge = () => {
    setScreen('countdown')
  }

  const handleCountdownComplete = () => {
    setScreen('challenge')
  }

  const handleOpenNote = () => {
    setScreen('note')
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
    <Layout maxWidth="2xl" drillId="123-abc">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="数字→アルファベット"
            description="1, 2, 3 ... を A, B, C ... に変換しよう"
          />
          <StartScreen
            onStartDrill={handleStartDrill}
            onStartChallenge={handleStartChallenge}
            onOpenNote={handleOpenNote}
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
          drillName="数字→アルファベット"
          history={challengeHistory}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
      {screen === 'note' && <NoteScreen onBack={handleBackToStart} />}
    </Layout>
  )
}
