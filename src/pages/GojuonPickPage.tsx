import { useState, useCallback, useRef } from 'react'
import {
  Layout,
  DrillHeader,
  DrillScreenLayout,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  GojuonTable,
  ChallengeResult,
  ChallengeCountdownModal,
  SectionHeader,
} from '../components'
import {
  usePracticeDrill,
  useChallengeDrill,
  useDrillStorage,
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
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'
import type { Screen } from '../types/drill'

const DRILL_NAME = '50on-pick'

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
        <SectionHeader>ルール</SectionHeader>
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
            label="「た」〜「も」特訓モード"
            mode="ta-mo"
            drillName={DRILL_NAME}
            onClick={() => {
              onStartDrill('ta-mo')
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

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

  return (
    <>
      <DrillScreenLayout onBack={onBack} drillLabel="文字拾い">
        <GojuonTable
          markedCells={markedCells}
          size="large"
          className=""
          isTaMoMode={mode === 'ta-mo'}
        />

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          feedback={feedback}
          placeholder="ひらがなで入力"
          maxLength={10}
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

  // 現在の問題のマークされたセル
  const markedCells = currentQuestion
    ? parseMarkedCells(currentQuestion.question)
    : []

  return (
    <DrillScreenLayout
      onBack={onBack}
      drillLabel="実力テスト"
      challenge={{ remainingTime, isPenalized, score }}
    >
      {/* 問題表示 */}
      <GojuonTable markedCells={markedCells} size="large" className="" />

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <AnswerInputArea
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        placeholder="ひらがなで入力"
        maxLength={10}
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
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

  // 問題列のカスタム表示（小さい五十音表を表示）
  const renderQuestion = useCallback((question: Question) => {
    const markedCells = parseMarkedCells(question.question)
    return <GojuonTable markedCells={markedCells} size="small" className="" />
  }, [])

  return (
    <Layout
      maxWidth="2xl"
      drillId="50on-pick"
      compact={screen === 'drill' || screen === 'challenge'}
    >
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
