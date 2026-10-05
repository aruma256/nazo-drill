import { useState } from 'react'
import { useChallenge } from './useChallenge'
import { useDrill } from './useDrill'
import type { DrillSessionOptions } from './useDrillSession'
import type { HistoryEntry, QuestionGenerator } from '../types/drill'

/** 文字入力の実力テスト。回答後すぐ次問へ進み、ペナルティ表示中も回答できる。 */
export function useChallengeDrill(
  generateQuestion: QuestionGenerator,
  {
    onTimeUp,
    ...options
  }: DrillSessionOptions & {
    onTimeUp: (score: number, history: HistoryEntry[]) => void
  },
) {
  const drill = useDrill(generateQuestion, { ...options, autoStart: true })
  const challenge = useChallenge({ ...drill, onTimeUp })
  const [userAnswer, setUserAnswer] = useState('')

  const submitAnswer = () => {
    if (!userAnswer.trim() || challenge.isFinished || !drill.currentQuestion)
      return
    if (!drill.checkAnswer(userAnswer)) challenge.applyPenalty()
    drill.presentQuestion()
    setUserAnswer('')
  }

  return { ...drill, ...challenge, userAnswer, setUserAnswer, submitAnswer }
}
