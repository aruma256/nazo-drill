import { useState } from 'react'
import { useDrill } from './useDrill'
import type { DrillSessionOptions } from './useDrillSession'
import type { Feedback, QuestionGenerator } from '../types/drill'

/** 文字入力の練習。正解後は次問へ進み、不正解後は同じ問題を続ける。 */
export function usePracticeDrill(
  generateQuestion: QuestionGenerator,
  options: DrillSessionOptions = {},
) {
  const drill = useDrill(generateQuestion, { ...options, autoStart: true })
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [revealed, setRevealed] = useState(false)

  const submitAnswer = () => {
    if (!userAnswer.trim() || feedback || revealed || !drill.currentQuestion)
      return
    const isCorrect = drill.checkAnswer(userAnswer)
    setFeedback({ type: isCorrect ? 'correct' : 'retry' })
    setUserAnswer('')
  }

  /** 問題が切り替わったかを返す。ドリル固有のヒントをリセットする際に使う。 */
  const nextQuestion = () => {
    const advances = feedback?.type === 'correct' || revealed
    if (advances) drill.presentQuestion()
    setFeedback(null)
    setRevealed(false)
    setUserAnswer('')
    return advances
  }

  const revealAnswer = () => {
    if (feedback || !drill.currentQuestion) return
    setRevealed(true)
    setUserAnswer('')
  }

  return {
    ...drill,
    userAnswer,
    setUserAnswer,
    feedback,
    revealed,
    submitAnswer,
    nextQuestion,
    revealAnswer,
  }
}
