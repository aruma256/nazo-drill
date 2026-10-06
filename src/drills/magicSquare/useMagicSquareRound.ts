import { useCallback, useEffect, useState } from 'react'
import {
  generateMagicSquareQuestion,
  getNextNumber,
  type MagicSquareMode,
  type MagicSquareQuestion,
} from './magicSquare'

type Phase = 'playing' | 'complete' | 'revealed'

interface Round {
  question: MagicSquareQuestion
  cells: readonly number[]
  phase: Phase
  wrongIndex: number | null
}

function createRound(
  mode: MagicSquareMode,
  previousAnswer: string | null = null,
): Round {
  const question = generateMagicSquareQuestion(mode, previousAnswer)
  return { question, cells: question.cells, phase: 'playing', wrongIndex: null }
}

export function useMagicSquareRound(
  mode: MagicSquareMode,
  {
    allowImmediateRetry = false,
    autoAdvance = false,
  }: {
    /** 実力テストは誤答の表示中も操作を受け付ける。 */
    allowImmediateRetry?: boolean
    /** 実力テストは完成した盤面を確認後、自動で次問へ進む。 */
    autoAdvance?: boolean
  } = {},
) {
  const [round, setRound] = useState(() => createRound(mode))
  const nextNumber = getNextNumber(round.cells)
  const canPlaceNumber =
    round.phase === 'playing' &&
    nextNumber !== null &&
    (allowImmediateRetry || round.wrongIndex === null)
  const nextQuestion = useCallback(() => {
    setRound(createRound(mode, round.question.answer))
  }, [mode, round.question.answer])

  useEffect(() => {
    if (!autoAdvance || round.phase !== 'complete') return
    const timer = window.setTimeout(nextQuestion, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [autoAdvance, round.phase, nextQuestion])

  useEffect(() => {
    if (!allowImmediateRetry || round.wrongIndex === null) return
    const timer = window.setTimeout(() => {
      setRound((previous) => ({ ...previous, wrongIndex: null }))
    }, 350)
    return () => {
      clearTimeout(timer)
    }
  }, [allowImmediateRetry, round.wrongIndex])

  /** 練習は正誤確認を閉じてから、同じ盤面で再回答する。 */
  const retry = () => {
    setRound((previous) => ({ ...previous, wrongIndex: null }))
  }

  const placeNumber = (index: number) => {
    if (!canPlaceNumber || round.cells[index] !== 0) return 'ignored'
    if (round.question.solution[index] !== nextNumber) {
      setRound({ ...round, wrongIndex: index })
      return 'wrong'
    }
    const cells = round.cells.map((number, cellIndex) =>
      cellIndex === index ? nextNumber : number,
    )
    const complete = getNextNumber(cells) === null
    setRound({
      ...round,
      cells,
      phase: complete ? 'complete' : 'playing',
      wrongIndex: null,
    })
    return complete ? 'complete' : 'correct'
  }

  const revealAnswer = () => {
    if (!canPlaceNumber) return
    setRound({
      ...round,
      cells: round.question.solution,
      phase: 'revealed',
      wrongIndex: null,
    })
  }

  return {
    ...round,
    nextNumber,
    canPlaceNumber,
    placeNumber,
    nextQuestion,
    revealAnswer,
    retry,
  }
}
