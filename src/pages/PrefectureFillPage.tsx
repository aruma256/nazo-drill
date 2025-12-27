import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  ModeButton,
  AnswerInputArea,
  DrillMiniHeader,
} from '../components'
import { useDrill, useDrillStorage, type Feedback } from '../hooks'
import type { Question } from '../hooks/useDrill'
import {
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
  normalizeAnswer,
  checkTwoPrefecturesAnswer,
} from '../drills/prefectureFill'

const DRILL_NAME = 'prefecture-fill'

type Screen = 'start' | 'drill'
type DrillMode = 'normal' | 'one-prefecture' | 'two-prefectures'

/**
 * スタート画面
 */
function StartScreen({
  onStartDrill,
}: {
  onStartDrill: (mode: DrillMode) => void
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
        <h2 className="mb-3 flex items-center text-lg font-bold text-drill-primary-dark">
          <span className="mr-2 h-5 w-1 rounded bg-drill-primary"></span>
          モードを選択
        </h2>
        <div className="space-y-3">
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
        setFeedback({
          type: 'incorrect',
          correctAnswer: currentQuestion?.answer,
        })
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
      setFeedback({
        type: 'incorrect',
        correctAnswer: currentQuestion?.answer,
      })
    }
    setUserAnswer('')
  }

  const handleNext = () => {
    setFeedback(null)
    setFirstAnswer(null)
    presentQuestion()
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
        correctAnswer={feedback?.correctAnswer}
        onNext={handleNext}
        delayOnIncorrect={3000}
      />
    </>
  )
}

/**
 * 都道府県名穴埋めページ
 */
export function PrefectureFillPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<DrillMode>('normal')

  const handleStartDrill = (selectedMode: DrillMode) => {
    setMode(selectedMode)
    setScreen('drill')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl" drillId="prefecture-fill">
      {screen === 'start' && (
        <>
          <DrillHeader
            title="都道府県名の穴埋め"
            description="◯で隠された都道府県名を当てよう"
          />
          <StartScreen onStartDrill={handleStartDrill} />
        </>
      )}
      {screen === 'drill' && (
        <DrillScreen mode={mode} onBack={handleBackToStart} />
      )}
    </Layout>
  )
}
