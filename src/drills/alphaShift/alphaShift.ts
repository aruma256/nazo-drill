import { getRandomInt, getRandomElement } from '../../utils'
import type { Question } from '../../hooks/useDrill'

/** AのASCIIコード */
const ASCII_CODE_A = 65

/**
 * アルファベットシフト問題を生成
 * - ベースとなるアルファベット（A〜Z）をランダムに選択
 * - シフト量は-5〜+5の範囲（0を除く）
 * - 結果がA-Zの範囲に収まるシフト量のみを許可
 *
 * @param lastQuestion - 前回の問題文（連続同一問題を防ぐ）
 * @returns 問題オブジェクトと新しいlastQuestion
 */
export function generateAlphaShiftQuestion(lastQuestion: string | null): {
  question: Question
  newLastQuestion: string
} {
  let questionText: string
  let answer: string

  do {
    // A〜Zのランダムなアルファベットを生成（0-25）
    const baseCode = getRandomInt(0, 25)
    const baseChar = String.fromCharCode(ASCII_CODE_A + baseCode)

    // このアルファベットに対して有効なシフト量の候補を計算
    // -5〜+5の範囲で、0を除き、かつ結果がA-Z範囲内（0-25）に収まるもの
    const validShifts: number[] = []
    for (let shift = -5; shift <= 5; shift++) {
      if (shift === 0) continue
      const shiftedCode = baseCode + shift
      if (shiftedCode >= 0 && shiftedCode <= 25) {
        validShifts.push(shift)
      }
    }

    // 有効なシフト量の中からランダムに1つ選ぶ
    const shift = getRandomElement(validShifts)
    const shiftedCode = baseCode + shift
    answer = String.fromCharCode(ASCII_CODE_A + shiftedCode)

    // 問題文を生成
    const sign = shift > 0 ? '+' : ''
    questionText = `${baseChar}${sign}${shift}`
  } while (questionText === lastQuestion)

  return {
    question: {
      question: questionText,
      answer,
    },
    newLastQuestion: questionText,
  }
}
