import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
  GojuonTable,
  ChallengeTimer,
  ChallengeResult,
  ChallengeCountdownModal,
} from '../components'
import {
  useDrill,
  useDrillStorage,
  type Feedback,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  type DrillMode,
  generateWordQuestion,
  generateSingleQuestion,
  generateTaMoQuestion,
  parseMarkedCells,
} from '../drills/gojuonPick'

const DRILL_NAME = '50on-pick'
const CHALLENGE_TIME_LIMIT = 45

type Screen = 'start' | 'drill' | 'countdown' | 'challenge' | 'challengeResult'

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
  onStartChallenge,
}: {
  onStartDrill: (mode: DrillMode) => void
  onStartChallenge: () => void
}) {
  return (
    <>
      {/* ルール説明 */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center text-lg font-bold text-drill-primary-dark">
          <span className="mr-2 h-5 w-1 rounded bg-drill-primary"></span>
          ルール
        </h2>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>五十音表の中に数字が書かれたマスがあります。</p>
          <p>
            数字を
            <span className="font-bold text-drill-primary">1, 2, 3...</span>
            の順に拾い、そのマスに対応するひらがなを読み取ります。
          </p>
          <div className="mt-3 rounded-lg bg-white/50 p-3">
            <p className="mb-3 text-center text-sm text-gray-500">例：</p>
            <GojuonTable
              markedCells={[
                { row: 2, col: 9, number: 1 }, // く
                { row: 2, col: 2, number: 2 }, // る
                { row: 0, col: 4, number: 3 }, // ま
              ]}
              size="medium"
              className=""
            />
            <p className="mb-1 mt-3 text-center text-sm text-gray-600">
              1→「く」、2→「る」、3→「ま」
            </p>
            <p className="text-center text-xl font-bold text-green-600">
              答え：くるま
            </p>
          </div>
        </div>
      </section>

      {/* 実力テスト */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-drill-primary-dark">
          <span className="mr-2 h-5 w-1 rounded bg-drill-primary"></span>
          実力テスト
        </h2>
        <ModeButton
          label={`${CHALLENGE_TIME_LIMIT}秒チャレンジ`}
          mode="challenge"
          drillName={DRILL_NAME}
          onClick={onStartChallenge}
          hidePoints
        />
      </section>

      {/* 練習モード選択 */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-drill-primary-dark">
          <span className="mr-2 h-5 w-1 rounded bg-drill-primary"></span>
          練習モード
        </h2>
        <div className="space-y-3">
          <ModeButton
            label="「た」〜「も」特訓モード"
            mode="ta-mo"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('ta-mo')
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
  const lastWordRef = useRef<string | null>(null)
  const lastColRef = useRef<number | null>(null)

  // 問題生成関数
  const generateQuestion = useCallback(() => {
    switch (mode) {
      case 'word':
      case 'challenge': {
        const result = generateWordQuestion(lastWordRef.current)
        lastWordRef.current = result.newLastWord
        return result.question
      }
      case 'single': {
        const result = generateSingleQuestion(lastColRef.current)
        lastColRef.current = result.newLastCol
        return result.question
      }
      case 'ta-mo': {
        const result = generateTaMoQuestion(lastColRef.current)
        lastColRef.current = result.newLastCol
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
    presentQuestion()
  }

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel="文字拾い" />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        <GojuonTable
          markedCells={markedCells}
          size="large"
          isTaMoMode={mode === 'ta-mo'}
        />

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="ひらがなで入力"
          maxLength={10}
        />
      </div>

      {/* フィードバックモーダル */}
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        correctAnswer={feedback?.correctAnswer}
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

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

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
          <span className="ml-2 text-2xl font-bold text-drill-primary">
            {score}
          </span>
        </div>

        {/* 問題表示 */}
        <GojuonTable markedCells={markedCells} size="large" />

        {/* 回答入力エリア（フィードバックなし、即時次問題） */}
        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          placeholder="ひらがなで入力"
          maxLength={10}
          className="mt-4"
          instantMode
        />
      </div>
    </>
  )
}

/**
 * 五十音表の文字拾いページ
 */
export function GojuonPickPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('word')
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeHistory, setChallengeHistory] = useState<HistoryEntry[]>([])

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
      setScreen('challengeResult')
    },
    [],
  )

  const handleRetryChallenge = () => {
    setChallengeScore(0)
    setScreen('countdown')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  // 問題列のカスタム表示（小さい五十音表を表示）
  const renderQuestion = useCallback((question: Question) => {
    const markedCells = parseMarkedCells(question.question)
    return <GojuonTable markedCells={markedCells} size="small" className="" />
  }, [])

  return (
    <Layout maxWidth="2xl" drillId="50on-pick">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="五十音表の文字拾い"
            description="数字の順に文字を読み取ろう"
          />
          <StartScreen
            onStartDrill={handleStartDrill}
            onStartChallenge={handleStartChallenge}
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
          drillName="五十音表の文字拾い"
          history={challengeHistory}
          questionRenderer={renderQuestion}
          onRetry={handleRetryChallenge}
          onBack={handleBackToStart}
        />
      )}
    </Layout>
  )
}
