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
import { sha256 } from '../utils'

const DRILL_NAME = 'original-nazo'

/**
 * 問題データ
 */
const QUESTIONS = [
  {
    id: 'q1',
    label: 'aruma謎Tシャツ-1',
    image: '/images/original-nazo/q1-detail.jpg',
    // コントリビューターがうっかり答えを読むことが無いようにハッシュ化
    answerHash:
      'dc2fc19d8fce376c47641cf15f823a03ad10f2dc7da3f43230551f50706914f5',
    hints: [
      'まずはピンクと、（下の方の）緑に注目してみましょう。',
      'ピンクは4つ、（下の方の）緑は5つ、直線上に並んでいます。',
      'ピンク→4つ、緑→5つ となる法則を考えてみましょう。',
      'この謎に文字は含まれていません。つまり、日本語とは限りません。',
      '"pink" は4文字、"green" は5文字です。',
      '文字数とマスの数が一致しているようです。マスに文字を埋めてみましょう。次のヒントからは、左上の部分についてのものになります。',
      '法則を意識しつつ、左上の十字部分を見てみましょう。',
      '一旦、緑のマスは無視して考えるとよいかもしれません。',
      '"yellow", "blue" が当てはまるようです。交差部分が黄色でも青色でもない理由を考えましょう。',
      '三原色を思い出しましょう。',
      '黄色と青色を混ぜると、緑色になります。以降のヒントは、矢印部分についてのものになります。',
      'ここまで、pink, green, yellow, blue を当てはめることがわかりました。実際に書き込んでみると考えやすくなりそうです。',
      '色名が交差する場合、交差したマスでは2色が混ざった色になるようです。3つある色の薄いマスは、どう解釈すればよいのでしょうか。',
      '「色の薄いマス」ではなく、単に別の色が混ざったマスなのではないでしょうか。',
      '黄色、ピンク、緑色と混ぜてこのように変化するといえば…。',
      '背景色と同じ、白色が混ざっていたようです。黄色の"w"のマスから下方向に、"white" を当てはめてみましょう。矢印が通った文字を拾うと答えになります。',
    ],
  },
]

type Screen = 'start' | 'question' | 'clear'

/**
 * ヒントパネル
 */
function HintPanel({ hints }: { hints: string[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openedCount, setOpenedCount] = useState(0)

  const handleOpenHint = () => {
    if (openedCount < hints.length) {
      setOpenedCount(openedCount + 1)
    }
  }

  return (
    <div className="mb-4">
      {/* ヒントを見るボタン */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-left transition-all hover:border-amber-400 hover:bg-amber-100"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="font-bold text-amber-800">ヒント</span>
          {openedCount > 0 && (
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-700">
              {openedCount}/{hints.length}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-amber-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ヒントパネル本体 */}
      {isOpen && (
        <div className="mt-2 rounded-xl border-2 border-amber-200 bg-white p-4">
          <div className="space-y-3">
            {/* 開放済みヒント */}
            {hints.slice(0, openedCount).map((hint, index) => (
              <div
                key={index}
                className="rounded-lg bg-amber-50 p-3 text-sm text-gray-700"
              >
                <span className="mr-2 font-bold text-amber-600">
                  ヒント{index + 1}:
                </span>
                {hint}
              </div>
            ))}

            {/* 次のヒントを見るボタン */}
            {openedCount < hints.length && (
              <button
                onClick={handleOpenHint}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-white px-4 py-3 font-bold text-amber-700 transition-all hover:border-amber-400 hover:bg-amber-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                ヒント{openedCount + 1}を見る ({openedCount + 1}/{hints.length})
              </button>
            )}

            {/* 全ヒント開放済み */}
            {openedCount === hints.length && (
              <div className="text-center text-sm text-gray-500">
                すべてのヒントを表示しました
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
          {/* 正解済み/未クリアバッジ */}
          {isSolved ? (
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
          ) : (
            <div
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
              }}
            >
              未
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
 * Coming Soon ボタン
 */
function ComingSoonButton() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-5 text-left">
      <div className="flex items-center gap-3">
        <span className="text-2xl opacity-40">📝</span>
        <span className="font-display text-lg font-bold text-gray-400">
          Coming Soon
        </span>
      </div>
    </div>
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
          <p>
            サイト作者（
            <a
              href="http://x.com/aruma256"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              @aruma256
            </a>
            ）オリジナルの謎解き問題です。
          </p>
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
          <ComingSoonButton />
          <ComingSoonButton />
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
  onClear,
}: {
  questionId: string
  onBack: () => void
  onClear: () => void
}) {
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const { incrementCorrectCount } = useDrillStorage(DRILL_NAME)

  const question = QUESTIONS.find((q) => q.id === questionId)

  if (!question) {
    return <div>問題が見つかりません</div>
  }

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return

    // 小文字に正規化してハッシュ化し、保存されたハッシュと比較
    const inputHash = await sha256(userAnswer.trim().toLowerCase())
    const isCorrect = inputHash === question.answerHash

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
      // 正解後はクリア画面へ
      onClear()
    }
    // リトライの場合は同じ問題を続ける
  }

  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel={question.label} />

      {/* 問題エリア */}
      <div className="rounded-lg bg-white/70 p-4">
        {/* 問題画像 */}
        <div className="mb-4">
          <img
            src={question.image}
            alt={question.label}
            className="mx-auto max-w-full rounded-lg shadow-md"
          />
        </div>

        {/* ヒントパネル */}
        {question.hints.length > 0 && <HintPanel hints={question.hints} />}

        <AnswerInputArea
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={() => void handleSubmit()}
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
 * クリア画面
 */
function ClearScreen({
  questionLabel,
  onBack,
}: {
  questionLabel: string
  onBack: () => void
}) {
  const handleShare = () => {
    const text = `#ナゾドリル おまけ謎「${questionLabel}」をクリアしました！\nhttps://nazo-drill.aruma256.dev/`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleBuy = () => {
    window.open(
      'https://suzuri.jp/aruma256/designs/18500610',
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-xl">
      {/* Header decoration */}
      <div
        className="h-2"
        style={{
          background:
            'linear-gradient(90deg, var(--drill-primary), var(--drill-accent))',
        }}
      />

      <div className="p-8 text-center">
        {/* Trophy icon */}
        <div className="animate-bounce-in mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200">
          <svg
            className="h-8 w-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L9 8L2 9L7 14L5.5 21L12 17.5L18.5 21L17 14L22 9L15 8L12 2Z" />
          </svg>
        </div>

        <h2 className="font-display mb-1 text-2xl font-black text-gray-800">
          クリア！
        </h2>
        <p className="mb-6 text-sm text-gray-500">「{questionLabel}」正解</p>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="group w-full cursor-pointer rounded-2xl bg-black px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-900 hover:shadow-xl active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              結果をシェア！
            </span>
          </button>

          <button
            onClick={handleBuy}
            className="group w-full cursor-pointer rounded-2xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(135deg, var(--drill-primary), var(--drill-primary-dark))',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              このナゾを買う！
            </span>
          </button>

          <button
            onClick={onBack}
            className="w-full cursor-pointer rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 font-bold text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
          >
            問題一覧に戻る
          </button>
        </div>
      </div>
    </div>
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

  const handleClear = () => {
    setScreen('clear')
  }

  const selectedQuestion = QUESTIONS.find((q) => q.id === selectedQuestionId)

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
          onClear={handleClear}
        />
      )}
      {screen === 'clear' && selectedQuestion && (
        <ClearScreen
          questionLabel={selectedQuestion.label}
          onBack={handleBackToStart}
        />
      )}
    </Layout>
  )
}
