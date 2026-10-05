import { useCallback, useEffect, useRef, useState } from 'react'
import { useDrillSession, type DrillSessionOptions } from './useDrillSession'
import type { Question, QuestionGenerator, ScoreStats } from '../types/drill'

export type {
  Feedback,
  HistoryEntry,
  Question,
  QuestionGenerator,
  ScoreStats,
} from '../types/drill'

/** 連続同一問題防止の最大リトライ回数 */
const MAX_RETRIES = 100

/**
 * ドリルのコアロジックを提供するカスタムフック
 * @param generateQuestion - 問題を生成する関数
 * @param options - ドリル独自の回答判定と累計正答数の保存先
 */
export function useDrill(
  generateQuestion: QuestionGenerator,
  {
    autoStart = false,
    ...options
  }: DrillSessionOptions & {
    /** 初回出題を自動で行う。StrictModeでも1問だけ出題する。 */
    autoStart?: boolean
  } = {},
) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const { score, history, submitAnswer, resetSession, clearHistory } =
    useDrillSession(options)
  const previousQuestionRef = useRef<Question | null>(null)

  /**
   * 問題を出題する（前回と同じ問題を避ける）
   */
  const presentQuestion = useCallback(() => {
    let newQuestion: Question
    let retries = 0

    // 前回と異なる問題が出るまで生成（最大MAX_RETRIES回）
    do {
      newQuestion = generateQuestion()
      retries++
    } while (
      newQuestion.question === previousQuestionRef.current?.question &&
      retries < MAX_RETRIES
    )

    // 生成関数は前問を保持するrefを更新するため、初回もマウント後に出題する。
    // eslint-disable-next-line react-x/set-state-in-effect -- autoStartによる初回出題はrefで1回に制限する
    setCurrentQuestion(newQuestion)
    previousQuestionRef.current = newQuestion
    // eslint-disable-next-line react-x/set-state-in-effect -- 問題の更新と出題数を同じ操作で記録する
    setTotalQuestions((prev) => prev + 1)
    return newQuestion
  }, [generateQuestion])

  useEffect(() => {
    if (autoStart && previousQuestionRef.current === null) presentQuestion()
  }, [autoStart, presentQuestion, currentQuestion])

  /**
   * 回答をチェックする
   */
  const checkAnswer = useCallback(
    (userAnswer: string): boolean => {
      if (!currentQuestion) {
        throw new Error('No question has been presented')
      }

      return submitAnswer(currentQuestion, userAnswer)
    },
    [currentQuestion, submitAnswer],
  )

  /**
   * スコア統計を取得
   */
  const getScoreStats = useCallback((): ScoreStats => {
    return {
      score,
      total: totalQuestions,
      percentage:
        totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    }
  }, [score, totalQuestions])

  /**
   * スコアをリセット
   */
  const resetScore = useCallback(() => {
    resetSession()
    setTotalQuestions(0)
    setCurrentQuestion(null)
    previousQuestionRef.current = null
  }, [resetSession])

  return {
    currentQuestion,
    score,
    totalQuestions,
    history,
    presentQuestion,
    checkAnswer,
    getScoreStats,
    resetScore,
    clearHistory,
  }
}
