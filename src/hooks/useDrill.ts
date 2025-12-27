import { useCallback, useRef, useState } from 'react'

/**
 * ドリルの問題オブジェクト
 */
export interface Question {
  /** 問題文 */
  question: string
  /** 正解 */
  answer: string
  /** 補助テキスト（例: "/26"） */
  subtext?: string
}

/**
 * スコア統計
 */
export interface ScoreStats {
  /** 正答数 */
  score: number
  /** 出題数 */
  total: number
  /** 正答率（パーセント） */
  percentage: number
}

/**
 * フィードバック情報
 */
export interface Feedback {
  /** フィードバックの種類 */
  type: 'correct' | 'incorrect' | 'retry'
  /** 正解の答え（不正解の場合に表示） */
  correctAnswer?: string
}

/**
 * 履歴エントリ（1問分の記録）
 */
export interface HistoryEntry {
  /** 一意の識別子 */
  id: number
  /** 問題オブジェクト */
  question: Question
  /** ユーザーの回答 */
  userAnswer: string
  /** 正解かどうか */
  isCorrect: boolean
}

/** 問題生成関数の型 */
export type QuestionGenerator = () => Question

/** 連続同一問題防止の最大リトライ回数 */
const MAX_RETRIES = 100

/**
 * 回答を正規化する（大文字小文字、空白などを統一）
 */
function normalizeAnswer(answer: string): string {
  return answer.trim().toUpperCase()
}

/**
 * ドリルのコアロジックを提供するカスタムフック
 * @param generateQuestion - 問題を生成する関数
 */
export function useDrill(generateQuestion: QuestionGenerator) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
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
      previousQuestionRef.current &&
      newQuestion.question === previousQuestionRef.current.question &&
      retries < MAX_RETRIES
    )

    setCurrentQuestion(newQuestion)
    previousQuestionRef.current = newQuestion
    setTotalQuestions((prev) => prev + 1)
    return newQuestion
  }, [generateQuestion])

  /**
   * 回答をチェックする
   */
  const checkAnswer = useCallback(
    (userAnswer: string): boolean => {
      if (!currentQuestion) {
        throw new Error('No question has been presented')
      }

      const isCorrect =
        normalizeAnswer(userAnswer) === normalizeAnswer(currentQuestion.answer)

      if (isCorrect) {
        setScore((prev) => prev + 1)
      }

      // 履歴に記録
      setHistory((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          question: currentQuestion,
          userAnswer,
          isCorrect,
        },
      ])

      return isCorrect
    },
    [currentQuestion],
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
    setScore(0)
    setTotalQuestions(0)
    setCurrentQuestion(null)
    previousQuestionRef.current = null
    setHistory([])
  }, [])

  /**
   * 履歴をクリア
   */
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

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
