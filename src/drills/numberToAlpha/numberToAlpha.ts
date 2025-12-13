import { getRandomElementExcluding } from '../../utils'
import { numberToAlpha, alphaToNumber } from '../../utils/conversion'
import type { Question } from '../../hooks/useDrill'
import { NUMBER_TO_ALPHA_WORDS } from './words'

/**
 * ドリルのモード
 * - ejoty: EJOTY特訓モード（5の倍数のみ）
 * - single: 1文字モード（1〜26すべて）
 * - word: 単語モード
 */
export type DrillMode = 'ejoty' | 'single' | 'word'

/** 1〜26の数値配列 */
const ALL_NUMBERS = Array.from({ length: 26 }, (_, i) => i + 1)

/** EJOTY（5の倍数）の配列: E=5, J=10, O=15, T=20, Y=25 */
export const EJOTY_NUMBERS = [5, 10, 15, 20, 25] as const

/**
 * EJOTY特訓モードの問題を生成
 */
export function generateEjotyQuestion(lastNumber: number | null): {
  question: Question
  newLastNumber: number
} {
  const number = getRandomElementExcluding(EJOTY_NUMBERS, lastNumber)
  const answer = numberToAlpha(number)

  return {
    question: {
      question: number.toString(),
      answer,
      subtext: '/26',
    },
    newLastNumber: number,
  }
}

/**
 * 1文字モードの問題を生成
 */
export function generateSingleQuestion(lastNumber: number | null): {
  question: Question
  newLastNumber: number
} {
  const number = getRandomElementExcluding(ALL_NUMBERS, lastNumber)
  const answer = numberToAlpha(number)

  return {
    question: {
      question: number.toString(),
      answer,
      subtext: '/26',
    },
    newLastNumber: number,
  }
}

/**
 * 単語モードの問題を生成
 */
export function generateWordQuestion(lastWord: string | null): {
  question: Question
  newLastWord: string
} {
  const word = getRandomElementExcluding(NUMBER_TO_ALPHA_WORDS, lastWord)

  // 各文字を数字に変換
  const numbers: number[] = []
  for (const char of word) {
    numbers.push(alphaToNumber(char))
  }

  return {
    question: {
      question: numbers.join(', '),
      answer: word,
      subtext: '/26',
    },
    newLastWord: word,
  }
}
