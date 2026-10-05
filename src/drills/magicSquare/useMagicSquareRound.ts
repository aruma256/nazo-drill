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
  { allowImmediateRetry = false }: { allowImmediateRetry?: boolean } = {},
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
    if (round.phase !== 'complete') return
    const timer = window.setTimeout(nextQuestion, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [round.phase, nextQuestion])

  useEffect(() => {
    if (round.wrongIndex === null) return
    const timer = window.setTimeout(() => {
      setRound((previous) => ({ ...previous, wrongIndex: null }))
    }, 350)
    return () => {
      clearTimeout(timer)
    }
  }, [round.wrongIndex])

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
  }
}
