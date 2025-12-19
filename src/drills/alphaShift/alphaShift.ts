import { getRandomInt, getRandomElement } from '../../utils'
import type { Question } from '../../hooks/useDrill'
import { ASCII_CODE_A } from '../../utils/conversion'

/** アルファベットシフトのモード */
export type AlphaShiftMode = 'plus-training' | 'minus-training'

/**
 * モードごとのシフト範囲を取得
 */
function getShiftRange(mode: AlphaShiftMode): { min: number; max: number } {
  switch (mode) {
    case 'plus-training':
      return { min: 1, max: 3 }
    case 'minus-training':
      return { min: -3, max: -1 }
  }
}

/**
 * アルファベットシフト問題を生成
 * - ベースとなるアルファベット（A〜Z）をランダムに選択
 * - シフト量はモードによって決まる
 * - 結果がA-Zの範囲に収まるシフト量のみを許可
 *
 * @param lastQuestion - 前回の問題文（連続同一問題を防ぐ）
 * @param mode - ドリルモード
 * @returns 問題オブジェクトと新しいlastQuestion
 */
export function generateAlphaShiftQuestion(
  lastQuestion: string | null,
  mode: AlphaShiftMode,
): {
  question: Question
  newLastQuestion: string
} {
  let questionText: string
  let answer: string

  const { min, max } = getShiftRange(mode)

  do {
    // モードに応じて有効なベースアルファベットの範囲を計算
    // plus-training (+1〜+3): A(0) ～ W(22) まで有効（X,Y,Zは+1でも範囲外になる可能性あり）
    // minus-training (-1〜-3): D(3) ～ Z(25) まで有効（A,B,Cは-1でも範囲外になる可能性あり）
    const minBaseCode = mode === 'minus-training' ? Math.abs(min) : 0
    const maxBaseCode = mode === 'plus-training' ? 25 - max : 25

    const baseCode = getRandomInt(minBaseCode, maxBaseCode)
    const baseChar = String.fromCharCode(ASCII_CODE_A + baseCode)

    // このアルファベットに対して有効なシフト量の候補を計算
    const validShifts: number[] = []
    for (let shift = min; shift <= max; shift++) {
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
