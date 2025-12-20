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
} from '../components'
import {
  useDrill,
  useDrillStorage,
  type Feedback,
  type HistoryEntry,
} from '../hooks'
import {
  type DrillMode,
  generateEjotyQuestion,
  generateSingleQuestion,
  generateWordQuestion,
} from '../drills/numberToAlpha'

const DRILL_NAME = '123-abc'
const CHALLENGE_TIME_LIMIT = 45

type Screen = 'start' | 'drill' | 'challenge' | 'challengeResult' | 'note'

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
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              E
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              J
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              O
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
              T
            </td>
          </tr>
          <tr>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-white text-center text-sm font-medium text-gray-700 sm:h-8 sm:w-14 sm:text-base"></td>
            <td className="h-7 w-12 border border-gray-300 bg-indigo-100 text-center text-sm font-bold text-indigo-600 sm:h-8 sm:w-14 sm:text-base">
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
  { num: 8, alpha: 'H', memo: '' },
  { num: 9, alpha: 'I', memo: '' },
  { num: 10, alpha: 'J', memo: 'EJOTY' },
  { num: 11, alpha: 'K', memo: '' },
  { num: 12, alpha: 'L', memo: '' },
  { num: 13, alpha: 'M', memo: '' },
  { num: 14, alpha: 'N', memo: '' },
  { num: 15, alpha: 'O', memo: 'EJOTY' },
  { num: 16, alpha: 'P', memo: '' },
  { num: 17, alpha: 'Q', memo: '' },
  { num: 18, alpha: 'R', memo: '' },
  { num: 19, alpha: 'S', memo: '' },
  { num: 20, alpha: 'T', memo: 'EJOTY' },
  { num: 21, alpha: 'U', memo: '' },
  { num: 22, alpha: 'V', memo: '' },
  { num: 23, alpha: 'W', memo: '' },
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
        {/* 暗記のステップ */}
        <section className="rounded-lg bg-white/70 p-4">
          <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
            <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
            覚え方のステップ
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="font-bold text-indigo-800">
                ステップ1: EJOTYを覚える
              </p>
              <p className="mt-1 text-sm">
                まずは5の倍数だけ覚えましょう。
                <br />
                <span className="font-mono font-bold text-indigo-600">
                  E=5, J=10, O=15, T=20, Y=25
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="font-bold text-indigo-800">ステップ2: 前後を計算</p>
              <p className="mt-1 text-sm">
                EJOTYを基準に、+1や-1で他の文字を導く。
                <br />
                例: J=10 なので、K=11, I=9
              </p>
            </div>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <p className="font-bold text-indigo-800">
                ステップ3: よく出る文字を覚える
              </p>
              <p className="mt-1 text-sm">
                使用頻度の高い文字から優先的に暗記していく。
              </p>
            </div>
          </div>
        </section>

        {/* 対応表 */}
        <section className="rounded-lg bg-white/70 p-4">
          <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
            <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
            対応表
          </h2>
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
                            : 'text-indigo-600'
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
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
          ルール
        </h2>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>数字をアルファベットに変換して答えます。</p>
          <div className="mt-3 rounded-lg bg-white/50 p-3 text-center">
            <p className="font-mono text-lg">
              <span className="text-indigo-600">1</span> →{' '}
              <span className="font-bold text-green-600">A</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">5</span> →{' '}
              <span className="font-bold text-green-600">E</span>
            </p>
            <p className="font-mono text-lg">
              <span className="text-indigo-600">26</span> →{' '}
              <span className="font-bold text-green-600">Z</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            参照表を見ながら位置で覚えましょう
          </p>
        </div>
      </section>

      {/* 実力テスト */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-amber-500"></span>
          実力テスト
        </h2>
        <button
          onClick={onStartChallenge}
          className="w-full cursor-pointer rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 text-lg font-bold text-amber-700 shadow-md transition-all duration-200 hover:border-amber-500 hover:from-amber-100 hover:to-orange-100 hover:shadow-lg"
        >
          {CHALLENGE_TIME_LIMIT}秒チャレンジ
          <span className="mt-1 block text-sm font-normal text-amber-600">
            単語モードで何問正解できるか挑戦！
          </span>
        </button>
      </section>

      {/* モード選択 */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-indigo-500"></span>
          練習モード
        </h2>
        <div className="space-y-3">
          <ModeButton
            label={'"EJOTY"特訓モード'}
            mode="ejoty"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('ejoty')
            }}
          />
          <ModeButton
            label="1文字モード"
            mode="single"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('single')
            }}
          />
          <ModeButton
            label="単語モード"
            mode="word"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('word')
            }}
          />
        </div>
      </section>

      {/* 暗記ノート */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-indigo-900">
          <span className="mr-2 h-5 w-1 rounded bg-green-500"></span>
          暗記ノート
        </h2>
        <button
          onClick={onOpenNote}
          className="w-full cursor-pointer rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 text-lg font-bold text-green-700 shadow-md transition-all duration-200 hover:border-green-500 hover:from-green-100 hover:to-emerald-100 hover:shadow-lg"
        >
          対応表・覚え方を見る
          <span className="mt-1 block text-sm font-normal text-green-600">
            EJOTYの覚え方や語呂合わせなど
          </span>
        </button>
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
      setFeedback({
        type: 'incorrect',
        correctAnswer: currentQuestion?.answer,
      })
    }
    setUserAnswer('')
  }

  const handleNext = () => {
    setFeedback(null)
    setQuestionCount((c) => c + 1)
    presentQuestion()
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
          <div className="text-5xl font-bold text-indigo-900">
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
          className="uppercase"
        />
      </div>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        correctAnswer={feedback?.correctAnswer}
        hintContent={
          currentQuestion
            ? `${currentQuestion.answer} = ${currentQuestion.question}`
            : undefined
        }
        onNext={handleNext}
        delayOnIncorrect={3000}
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
  const [remainingTime, setRemainingTime] = useState(CHALLENGE_TIME_LIMIT)
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

  // カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // タイムアップ時の処理
  useEffect(() => {
    if (remainingTime === 0) {
      onTimeUp(score, history)
    }
  }, [remainingTime, score, history, onTimeUp])

  const handleSubmit = () => {
    if (!userAnswer.trim() || remainingTime === 0) return

    const isCorrect = checkAnswer(userAnswer)
    if (isCorrect) {
      setScore((prev) => prev + 1)
      incrementCorrectCount('challenge')
    }
    presentQuestion()
    setUserAnswer('')
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="実力テスト" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* タイマー */}
        <ChallengeTimer
          remainingSeconds={remainingTime}
          totalSeconds={CHALLENGE_TIME_LIMIT}
        />

        {/* スコア表示 */}
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500">正解数</span>
          <span className="ml-2 text-2xl font-bold text-indigo-600">
            {score}
          </span>
        </div>

        {/* 問題表示 */}
        <div className="mb-4 text-center">
          <div className="text-5xl font-bold text-indigo-900">
            {currentQuestion?.question ?? '--'}
          </div>
          {currentQuestion?.subtext && (
            <div className="mt-1 text-sm text-gray-500">
              {currentQuestion.subtext}
            </div>
          )}
        </div>

        {/* 回答入力エリア（フィードバックなし、即時次問題） */}
        <div className="space-y-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value.toUpperCase())
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            placeholder="答えを入力"
            maxLength={10}
            autoFocus
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-center text-xl font-bold uppercase focus:border-indigo-400 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
          >
            回答
          </button>
        </div>
      </div>
    </>
  )
}

/**
 * 数字toアルファベットページ
 */
export function NumberToAlphaPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('single')
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeHistory, setChallengeHistory] = useState<HistoryEntry[]>([])

  const handleStartDrill = (selectedMode: DrillMode) => {
    setMode(selectedMode)
    setScreen('drill')
  }

  const handleStartChallenge = () => {
    setScreen('challenge')
  }

  const handleOpenNote = () => {
    setScreen('note')
  }

  const handleChallengeTimeUp = useCallback(
    (score: number, history: HistoryEntry[]) => {
      setChallengeScore(score)
      setChallengeHistory(history)
      setScreen('challengeResult')
    },
    [],
  )

  const handleRetryChallenge = () => {
    setChallengeScore(0)
    setChallengeHistory([])
    setScreen('challenge')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="数字toアルファベット"
            description="数字をアルファベットに変換しよう"
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
          history={challengeHistory}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
      {screen === 'note' && <NoteScreen onBack={handleBackToStart} />}
    </Layout>
  )
}
