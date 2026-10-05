import { useCallback, useRef } from 'react'
import {
  DrillPageLayout,
  DrillScreenLayout,
  FeedbackModal,
  ModeButton,
  PrefectureAnswerGuide,
  PrefectureAnswerInput,
  DrillMiniHeader,
  SectionHeader,
} from '../components'
import {
  usePracticeDrill,
  useChallengeDrill,
  useDrillPage,
  type HistoryEntry,
  type Question,
} from '../hooks'
import {
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
  checkPrefectureFillAnswer,
  SINGLE_PREFECTURE_CHARS,
  DOUBLE_PREFECTURE_CHARS,
} from '../drills/prefectureFill'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'

const DRILL_NAME = 'prefecture-fill'

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
          <PrefectureAnswerGuide />
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

  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    feedback,
    submitAnswer,
    nextQuestion,
  } = usePracticeDrill(generateQuestion, {
    validateAnswer: checkPrefectureFillAnswer,
    storage: { drillName: DRILL_NAME, mode },
  })

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

  const revealedPrefecture =
    mode === 'two-prefectures' ? currentQuestion?.subtext : undefined
  const questionSubtext =
    mode === 'two-prefectures' ? '都道府県' : currentQuestion?.subtext

  return (
    <>
      <DrillScreenLayout
        onBack={onBack}
        drillLabel={`都道府県 (${getModeName()})`}
      >
        {/* 問題表示 */}
        <div className="text-center">
          <div className="text-4xl font-bold tracking-widest text-drill-primary-dark md:text-5xl">
            {currentQuestion?.question ?? '--'}
          </div>
          {questionSubtext && (
            <div className="mt-1 text-sm text-gray-500">{questionSubtext}</div>
          )}
        </div>

        <PrefectureAnswerInput
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          feedback={feedback}
          inputPrefix={
            revealedPrefecture && (
              <span className="flex items-center justify-center gap-3 whitespace-nowrap">
                <span className="font-display text-2xl font-bold text-drill-primary-dark">
                  {revealedPrefecture}
                </span>
                <span className="text-xl font-bold text-gray-600">と</span>
              </span>
            )
          }
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
 * 穴埋めモードと同じ出題
 */
function ChallengeScreen({
  onTimeUp,
  onBack,
}: {
  onTimeUp: (score: number, history: HistoryEntry[]) => void
  onBack: () => void
}) {
  // 前回の問題を追跡するRef
  const lastPrefectureRef = useRef<string | null>(null)

  // 問題生成関数（穴埋めモードと同じ）
  const generateQuestion = useCallback((): Question => {
    const result = generateNormalQuestion(lastPrefectureRef.current)
    lastPrefectureRef.current = result.lastPrefecture
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
    validateAnswer: checkPrefectureFillAnswer,
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
        <div className="text-4xl font-bold tracking-widest text-drill-primary-dark md:text-5xl">
          {currentQuestion?.question ?? '--'}
        </div>
      </div>

      {/* 回答入力エリア（フィードバックなし、即時次問題） */}
      <PrefectureAnswerInput
        value={userAnswer}
        onChange={setUserAnswer}
        onSubmit={submitAnswer}
        disabled={isFinished}
        instantMode
      />
    </DrillScreenLayout>
  )
}

/**
 * 都道府県名穴埋めページ
 */
export function PrefectureFillPage() {
  const page = useDrillPage<DrillMode>(DRILL_NAME)

  return (
    <DrillPageLayout
      drillId={DRILL_NAME}
      title="都道府県名の穴埋め"
      description="◯で隠された都道府県名を当てよう"
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
