import { useState } from 'react'
import {
  Layout,
  DrillHeader,
  FeedbackModal,
  AnswerInputArea,
  DrillMiniHeader,
  SectionHeader,
} from '../components'
import { useDrillStorage, type Feedback } from '../hooks'

const DRILL_NAME = 'original-nazo'

/**
 * 問題データ
 */
const QUESTIONS = [
  {
    id: 'q1',
    label: '問題1',
    image: '/images/original-nazo/q1.jpg',
    answer: 'think',
  },
]

type Screen = 'start' | 'question'

/**
 * 問題選択ボタン
 */
function QuestionButton({
  label,
  onClick,
  isSolved,
}: {
  label: string
  onClick: () => void
  isSolved: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-white px-6 py-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--drill-primary)] hover:shadow-xl active:scale-[0.98]"
    >
      {/* Gradient border effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, var(--drill-primary-light) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
            📝
          </span>
          <span className="font-display text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-drill-primary-dark">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 正解済みバッジ */}
          {isSolved && (
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
              style={{
                backgroundColor: 'var(--drill-primary-light)',
                color: 'var(--drill-primary)',
              }}
            >
              <span>済</span>
              <span>✓</span>
            </div>
          )}

          {/* Arrow indicator */}
          <svg
            className="h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--drill-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  )
}

/**
 * スタート画面
 */
function StartScreen({
  onSelectQuestion,
}: {
  onSelectQuestion: (questionId: string) => void
}) {
  const { getCorrectCount } = useDrillStorage(DRILL_NAME)

  return (
    <>
      {/* 説明 */}
      <section className="mb-8">
        <SectionHeader>このページについて</SectionHeader>
        <div className="space-y-2 pl-3 text-gray-700">
          <p>サイト作者オリジナルの謎解き問題です。</p>
        </div>
      </section>

      {/* 問題選択 */}
      <section className="mb-6">
        <SectionHeader>問題を選択</SectionHeader>
        <div className="space-y-3">
          {QUESTIONS.map((q) => (
            <QuestionButton
              key={q.id}
              label={q.label}
              onClick={() => {
                onSelectQuestion(q.id)
              }}
              isSolved={getCorrectCount(q.id) > 0}
            />
          ))}
        </div>
      </section>
    </>
  )
}

/**
 * 問題画面
 */
function QuestionScreen({
  questionId,
  onBack,
}: {
  questionId: string
  onBack: () => void
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  const question = QUESTIONS.find((q) => q.id === questionId)

  if (!question) {
    return <div>問題が見つかりません</div>
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    // 大文字小文字を無視して比較
    const isCorrect =
      userAnswer.trim().toLowerCase() === question.answer.toLowerCase()

    if (isCorrect) {
      incrementCorrectCount(questionId)
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
      // 正解後はスタート画面に戻る
      onBack()
    }
    // リトライの場合は同じ問題を続ける
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel={question.label} />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題画像 */}
        <div className="mb-6">
          <img
            src={question.image}
            alt={question.label}
            className="mx-auto max-w-full rounded-lg shadow-md"
          />
        </div>

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          feedback={feedback}
          placeholder="答えを入力"
          maxLength={50}
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
 * オリジナル謎解きページ
 */
export function OriginalNazoPage() {
  const [screen, setScreen] = useState<Screen>('start')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('')

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId)
    setScreen('question')
  }

  const handleBackToStart = () => {
    setScreen('start')
  }

  return (
    <Layout maxWidth="2xl" drillId="original-nazo">
      {screen === 'start' && (
        <>
          <DrillHeader title="おまけ謎" description="" />
          <StartScreen onSelectQuestion={handleSelectQuestion} />
        </>
      )}
      {screen === 'question' && (
        <QuestionScreen
          questionId={selectedQuestionId}
          onBack={handleBackToStart}
        />
      )}
    </Layout>
  )
}
