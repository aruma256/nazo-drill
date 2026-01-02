import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
  SectionHeader,
  ChallengeTimer,
  ChallengeResult,
  ChallengeCountdownModal,
  PenaltyOverlay,
} from '../components'
import {
  useCountdownTimer,
  useDrill,
  useDrillStorage,
  type Feedback,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
  normalizeAnswer,
  checkTwoPrefecturesAnswer,
  SINGLE_PREFECTURE_CHARS,
  DOUBLE_PREFECTURE_CHARS,
} from '../drills/prefectureFill'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'

const DRILL_NAME = 'prefecture-fill'

type Screen =
  | 'start'
  | 'drill'
  | 'countdown'
  | 'challenge'
  | 'challengeResult'
  | 'note'
type DrillMode = 'normal' | 'one-prefecture' | 'two-prefectures' | 'challenge'

/**
 * 都道府県名の中の指定文字を強調表示する
 */
function HighlightChar({
  text,
  char,
}: {
  text: string
  char: string
}): React.ReactNode {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  for (let i = 0; i < text.length; i++) {
    if (text[i] === char) {
      if (i > lastIndex) {
        parts.push(text.slice(lastIndex, i))
      }
      parts.push(
        <span key={i} className="font-bold text-drill-primary">
          {char}
        </span>,
      )
      lastIndex = i + 1
    }
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}

/**
 * 暗記ノート画面
 */
function NoteScreen({ onBack }: { onBack: () => void }) {
  // 1県確定の文字と対応県のリスト
  const singlePrefectureEntries = Object.entries(SINGLE_PREFECTURE_CHARS)
  // 2県確定の文字と対応県のリスト
  const doublePrefectureEntries = Object.entries(DOUBLE_PREFECTURE_CHARS)

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="暗記ノート" />

      <div className="space-y-6">
        {/* 参考 */}
        <section className="rounded-lg bg-white/70 p-4">
          <SectionHeader>参考</SectionHeader>
          <div className="space-y-2 text-sm text-gray-600">
            <p>このページの語呂合わせは以下で紹介されているものです：</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <a
                  href="https://note.com/1220oz_an/n/ncc783842b083"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-drill-primary underline hover:text-drill-primary-dark"
                >
                  都道府県は暗記しろ｜フライパン職人
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/watch?v=ye7I-GRgPkM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-drill-primary underline hover:text-drill-primary-dark"
                >
                  謎解きのプロなら、都道府県を使った謎解きも当然瞬殺だよね？｜リドラの謎解きチャンネル
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* 1県確定 */}
        <section className="rounded-lg bg-white/70 p-4">
          <SectionHeader>1県確定の文字</SectionHeader>
          <div className="space-y-3 text-gray-700">
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                ざ こ ほ ど の て に ね ず め ろ ん
              </p>
              <p className="mt-1 text-sm">
                これらの文字を含む都道府県は1つだけ。
                <br />
                <span className="font-bold text-drill-primary">
                  「雑魚ほどの手に根津メロン」
                </span>
                と覚えよう！
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-16 px-3 py-2 text-center text-sm font-bold text-gray-600">
                      文字
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-bold text-gray-600">
                      都道府県
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {singlePrefectureEntries.map(([char, prefectures]) => (
                    <tr
                      key={char}
                      className="border-t border-gray-100 bg-white"
                    >
                      <td className="px-3 py-2 text-center text-lg font-bold text-drill-primary">
                        {char}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <HighlightChar text={prefectures[0]} char={char} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2県確定 */}
        <section className="rounded-lg bg-white/70 p-4">
          <SectionHeader>2県確定の文字</SectionHeader>
          <div className="space-y-3 text-gray-700">
            <div className="rounded-lg border border-drill-accent bg-drill-primary-light p-3">
              <p className="font-bold text-drill-primary-dark">
                え っ ぐ も ば ご り ら
              </p>
              <p className="mt-1 text-sm">
                これらの文字を含む都道府県は2つだけ。
                <br />
                <span className="font-bold text-drill-primary">
                  「エッグモバゴリラ」
                </span>
                と覚えよう！
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-16 px-3 py-2 text-center text-sm font-bold text-gray-600">
                      文字
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-bold text-gray-600">
                      都道府県（2つ）
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doublePrefectureEntries.map(([char, prefectures]) => (
                    <tr
                      key={char}
                      className="border-t border-gray-100 bg-white"
                    >
                      <td className="px-3 py-2 text-center text-lg font-bold text-drill-primary">
                        {char}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {prefectures.map((pref, i) => (
                          <span key={pref}>
                            <HighlightChar text={pref} char={char} />
                            {i < prefectures.length - 1 && '、'}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <p>◯で隠された文字を推測し、都道府県名を当てます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-drill-primary">◯うき◯◯</span> →{' '}
              <span className="font-bold text-green-600">とうきょう</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            答えは全てひらがなで入力してください
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
            label="穴埋めモード"
            mode="normal"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('normal')
            }}
            icon="✏️"
          />
          <ModeButton
            label="1県確定特訓"
            mode="one-prefecture"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('one-prefecture')
            }}
            icon="✏️"
          />
          <ModeButton
            label="2県確定特訓"
            mode="two-prefectures"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('two-prefectures')
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
  // 2県確定モード用: 1つ目の回答を保持
  const [firstAnswer, setFirstAnswer] = useState<string | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastNormalRef = useRef<string | null>(null)
  const lastCharRef = useRef<string | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback((): Question => {
    if (mode === 'one-prefecture') {
      const result = generateOnePrefectureQuestion(lastCharRef.current)
      lastCharRef.current = result.lastChar
      return result.question
    } else if (mode === 'two-prefectures') {
      const result = generateTwoPrefecturesQuestion(lastCharRef.current)
      lastCharRef.current = result.lastChar
      return result.question
    } else {
      const result = generateNormalQuestion(lastNormalRef.current)
      lastNormalRef.current = result.lastPrefecture
      return result.question
    }
  }, [mode])

  const { currentQuestion, presentQuestion } = useDrill(generateQuestion)

  // ドリル開始時に最初の問題を出題
  useEffect(() => {
    presentQuestion()
  }, [presentQuestion])

  // 回答チェック（2県確定モードは特別処理）
  const checkUserAnswer = useCallback(
    (userAns: string): boolean => {
      if (!currentQuestion) return false

      if (mode === 'two-prefectures') {
        return checkTwoPrefecturesAnswer(userAns, currentQuestion.answer)
      } else {
        return (
          normalizeAnswer(userAns) === normalizeAnswer(currentQuestion.answer)
        )
      }
    },
    [currentQuestion, mode],
  )

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    // 2県確定モードの場合、2段階で回答
    if (mode === 'two-prefectures') {
      if (firstAnswer === null) {
        // 1つ目の回答を保存
        setFirstAnswer(userAnswer.trim())
        setUserAnswer('')
        return
      }
      // 2つ目の回答 → 結合して判定
      const combinedAnswer = `${firstAnswer} ${userAnswer.trim()}`
      const isCorrect = checkUserAnswer(combinedAnswer)
      if (isCorrect) {
        incrementCorrectCount(mode)
        setFeedback({ type: 'correct' })
      } else {
        setFeedback({ type: 'retry' })
      }
      setUserAnswer('')
      setFirstAnswer(null)
      return
    }

    // 通常モード・1県確定モード
    const isCorrect = checkUserAnswer(userAnswer)
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
    setFirstAnswer(null)
    if (wasCorrect) {
      presentQuestion()
    }
    // リトライの場合は同じ問題を続ける
  }

  // モード名を取得
  const getModeName = () => {
    switch (mode) {
      case 'one-prefecture':
        return '1県確定'
      case 'two-prefectures':
        return '2県確定'
      default:
        return '穴埋め'
    }
  }

  // プレースホルダーを取得
  const getPlaceholder = () => {
    if (mode === 'two-prefectures') {
      return firstAnswer === null ? '県名を1つ入力' : 'もう1つ入力'
    }
    return 'ひらがなで入力'
  }

  return (
    <>
      <DrillMiniHeader
        onBack={onBack}
        drillLabel={`都道府県 (${getModeName()})`}
      />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題表示 */}
        <div className="mb-6 text-center">
          <div className="text-4xl font-bold tracking-widest text-drill-primary-dark md:text-5xl">
            {currentQuestion?.question ?? '--'}
          </div>
          {currentQuestion?.subtext && (
            <div className="mt-1 text-sm text-gray-500">
              {currentQuestion.subtext}
            </div>
          )}
        </div>

        {/* 2県確定モード: 回答済みの県を表示 */}
        {mode === 'two-prefectures' && firstAnswer && (
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-drill-primary/20 px-3 py-1 text-sm font-medium text-drill-primary-dark">
              {firstAnswer} ✓
            </span>
          </div>
        )}

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder={getPlaceholder()}
          maxLength={10}
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
 * 穴埋めモードと同じ出題
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
  const [isPenalized, setIsPenalized] = useState(false)
  const { remainingTime, subtractTime } =
    useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  // 前回の問題を追跡するRef
  const lastPrefectureRef = useRef<string | null>(null)

  // 問題生成関数（穴埋めモードと同じ）
  const generateQuestion = useCallback((): Question => {
    const result = generateNormalQuestion(lastPrefectureRef.current)
    lastPrefectureRef.current = result.lastPrefecture
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

  // 回答チェック（normalizeAnswerを使用）
  const checkUserAnswer = useCallback(
    (userAns: string): boolean => {
      if (!currentQuestion) return false
      return (
        normalizeAnswer(userAns) === normalizeAnswer(currentQuestion.answer)
      )
    },
    [currentQuestion],
  )

  const handleSubmit = () => {
    if (!userAnswer.trim() || remainingTime === 0) return

    const isCorrect = checkUserAnswer(userAnswer)
    // 履歴に記録
    checkAnswer(userAnswer)
    if (isCorrect) {
      setScore((prev) => prev + 1)
      incrementCorrectCount('challenge')
    } else {
      // 不正解ペナルティ
      subtractTime(WRONG_ANSWER_PENALTY_SECONDS)
      setIsPenalized(true)
      setTimeout(() => {
        setIsPenalized(false)
      }, 800)
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
        <PenaltyOverlay
          isPenalized={isPenalized}
          penaltySeconds={WRONG_ANSWER_PENALTY_SECONDS}
        />

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
          <div className="text-4xl font-bold tracking-widest text-drill-primary-dark md:text-5xl">
            {currentQuestion?.question ?? '--'}
          </div>
        </div>

        {/* 回答入力エリア（フィードバックなし、即時次問題） */}
        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder="ひらがなで入力"
          maxLength={10}
          instantMode
        />
      </div>
    </>
  )
}

/**
 * 都道府県名穴埋めページ
 */
export function PrefectureFillPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('normal')
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

  const handleOpenNote = () => {
    setScreen('note')
  }

  return (
    <Layout maxWidth="2xl" drillId="prefecture-fill">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="都道府県名の穴埋め"
            description="◯で隠された都道府県名を当てよう"
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
          drillName="都道府県名の穴埋め"
          history={challengeHistory}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
      {screen === 'note' && <NoteScreen onBack={handleBackToStart} />}
    </Layout>
  )
}
